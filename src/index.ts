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

  buffer.readInt8(i++) // length
  const magicWord = buffer.toString("utf8", i, (i += 4))
  const protocolVersion = buffer.readInt8(i++)
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
  // const recordCount = buffer.readInt8(i++)

  return {
    messageType,
    nodeId,
    address,
  }
}

const readAddress = (buffer: Buffer): string => {
  return new Uint8Array(buffer).join(".")
}

createLsdpListener((err, result) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(result)
})
