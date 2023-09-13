import assert from "node:assert"
import dgram from "node:dgram"

const LSDP_PORT = 11430

export interface LSDPEnvelope {
  magicWord: string
  protocolVersion: number
  message: LSDPMessage
}

export type LSDPMessage = AnnounceMessage

export interface AnnounceMessage {
  messageType: string
  nodeId: string
  address: string
  records: AnnounceRecord[]
}

export interface AnnounceRecord {
  classId: string
  txtRecords: Record<string, string>
}

export type LSDPCallback = (error?: Error, result?: LSDPEnvelope) => void

export const createLsdpListener = (cb: LSDPCallback): (() => void) => {
  const socket = dgram.createSocket("udp4")

  socket.on("message", (msg, _rinfo) => {
    cb(undefined, readLsdpBuffer(msg))
  })

  socket.on("error", err => {
    cb(err)
  })

  socket.bind(LSDP_PORT)

  return () => {
    socket.close()
  }
}

const readLsdpBuffer = (buffer: Buffer): LSDPEnvelope => {
  let i = 0

  const length = buffer.readInt8(i++)
  assert.strictEqual(length, buffer.length)

  const magicWord = buffer.toString("utf8", i, (i += 4))
  assert.strictEqual(magicWord, "LSDP")

  const protocolVersion = buffer.readInt8(i++)
  assert.strictEqual(protocolVersion, 1)

  const messageLength = buffer.readInt8(i++)
  const messageBuf = buffer.subarray(i, i + messageLength)
  const message = readMessageBuffer(messageBuf)

  return {
    magicWord,
    protocolVersion,
    message,
  }
}

const readMessageBuffer = (buffer: Buffer): LSDPMessage => {
  let i = 0

  const messageType = buffer.toString("utf8", i++, i)
  const nodeIdLength = buffer.readInt8(i++)
  const nodeId = buffer.toString("hex", i, (i += nodeIdLength))
  const addressLength = buffer.readInt8(i++)
  const address = readAddress(buffer.subarray(i, (i += addressLength)))
  const records = readRecordsBuffer(buffer.subarray(i))

  return {
    messageType,
    nodeId,
    address,
    records,
  }
}

const readRecordsBuffer = (buffer: Buffer): AnnounceRecord[] => {
  let i = 0

  const recordCount = buffer.readInt8(i++)
  const records = []

  for (let j = 0; j < recordCount; j++) {
    const classId = buffer.toString("hex", i, (i += 2))
    const txtCount = buffer.readInt8(i++)
    const txtRecords = []
    for (let k = 0; k < txtCount; k++) {
      const keyLength = buffer.readInt8(i++)
      const key = buffer.toString("utf8", i, (i += keyLength))
      const valueLength = buffer.readInt8(i++)
      const value = buffer.toString("utf8", i, (i += valueLength))
      txtRecords.push([key, value])
    }
    records.push({ classId, txtRecords: Object.fromEntries(txtRecords) })
  }

  return records
}

const readAddress = (buffer: Buffer): string => {
  return new Uint8Array(buffer).join(".")
}

createLsdpListener((err, result) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(JSON.stringify(result, null, 2))
})
