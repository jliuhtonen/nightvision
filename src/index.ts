import assert from "node:assert"
import dgram from "node:dgram"
import { concatTimes } from "./util.js"

const LSDP_PORT = 11430
const HEADER_LENGTH_BYTES = 6

export interface Envelope {
  magicWord: string
  protocolVersion: number
  message: Message
}

export type Message = AnnounceMessage | UnknownMessage

export interface AnnounceMessage {
  type: "announce"
  nodeId: string
  address: string
  records: AnnounceRecord[]
}

export interface UnknownMessage {
  type: "unknown"
  messageType: string
}

export interface AnnounceRecord {
  classId: string
  txtRecords: Record<string, string>
}

export type Callback = (error?: Error, result?: Envelope) => void

export const createLsdpListener = (cb: Callback): (() => void) => {
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

const readLsdpBuffer = (buffer: Buffer): Envelope => {
  let currentByte = 0

  const length = buffer.readInt8(currentByte++)
  assert.strictEqual(length, HEADER_LENGTH_BYTES)

  const magicWord = buffer.toString("utf8", currentByte, (currentByte += 4))
  assert.strictEqual(magicWord, "LSDP")

  const protocolVersion = buffer.readInt8(currentByte++)
  assert.strictEqual(protocolVersion, 1)

  const messageLength = buffer.readInt8(currentByte++)
  const messageBuf = buffer.subarray(currentByte, currentByte + messageLength)
  const message = readMessageBuffer(messageBuf)

  return {
    magicWord,
    protocolVersion,
    message,
  }
}

const readMessageBuffer = (buffer: Buffer): Message => {
  let currentByte = 0

  const messageType = buffer.toString("utf8", currentByte++, currentByte)

  if (messageType !== "A") {
    return {
      type: "unknown",
      messageType,
    }
  }

  const nodeIdLength = buffer.readInt8(currentByte++)
  const nodeId = buffer.toString(
    "hex",
    currentByte,
    (currentByte += nodeIdLength)
  )
  const addressLength = buffer.readInt8(currentByte++)
  const address = readAddress(
    buffer.subarray(currentByte, (currentByte += addressLength))
  )
  const records = readRecordsBuffer(buffer.subarray(currentByte))

  return {
    type: "announce",
    nodeId,
    address,
    records,
  }
}

const readRecordsBuffer = (buffer: Buffer): AnnounceRecord[] => {
  let currentByte = 0
  const recordCount = buffer.readInt8(currentByte++)

  const records = concatTimes(recordCount, () => {
    const classId = buffer.toString("hex", currentByte, (currentByte += 2))
    const txtCount = buffer.readInt8(currentByte++)
    const txtRecords = concatTimes(txtCount, () => {
      const keyLength = buffer.readInt8(currentByte++)
      const key = buffer.toString(
        "utf8",
        currentByte,
        (currentByte += keyLength)
      )
      const valueLength = buffer.readInt8(currentByte++)
      const value = buffer.toString(
        "utf8",
        currentByte,
        (currentByte += valueLength)
      )
      return [key, value]
    })

    return {
      classId,
      txtRecords: Object.fromEntries(txtRecords),
    }
  })

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
