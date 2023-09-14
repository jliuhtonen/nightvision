import { concatTimes } from "./util"

const HEADER_LENGTH_BYTES = 6

export type Packet = LSDPPacket | UnknownPacket

export interface LSDPPacket {
  type: "lsdp"
  message: Message
}

export interface UnknownPacket {
  type: "unknown"
}

export type Message = AnnounceMessage | DeleteMessage | UnknownMessage

export interface AnnounceMessage {
  type: "announce"
  nodeId: string
  address: string
  records: AnnounceRecord[]
}

export interface DeleteMessage {
  type: "delete"
  nodeId: string
  classIds: string[]
}

export interface UnknownMessage {
  type: "unknown"
  messageType: string
}

export interface AnnounceRecord {
  classId: string
  txtRecords: Record<string, string>
}

export const parsePacket = (buffer: Buffer): Packet => {
  let currentByte = 0

  const length = buffer.readInt8(currentByte++)
  const magicWord = buffer.toString("utf8", currentByte, (currentByte += 4))
  const protocolVersion = buffer.readInt8(currentByte++)
  if (
    magicWord !== "LSDP" ||
    length !== HEADER_LENGTH_BYTES ||
    protocolVersion !== 1
  ) {
    return { type: "unknown" }
  }

  const messageLength = buffer.readInt8(currentByte++)
  const messageBuf = buffer.subarray(currentByte, currentByte + messageLength)
  const message = parseMessage(messageBuf)

  return {
    type: "lsdp",
    message,
  }
}

const parseMessage = (buffer: Buffer): Message => {
  let currentByte = 0

  const messageType = buffer.toString("utf8", currentByte++, currentByte)

  switch (messageType) {
    case "A":
      return parseAnnounceMessage(buffer.subarray(currentByte))
    case "D":
      return parseDeleteMessage(buffer.subarray(currentByte))
    default:
      return {
        type: "unknown",
        messageType,
      }
  }
}

const parseAnnounceMessage = (buffer: Buffer): AnnounceMessage => {
  let currentByte = 0

  const nodeIdLength = buffer.readInt8(currentByte++)
  const nodeId = buffer.toString(
    "hex",
    currentByte,
    (currentByte += nodeIdLength)
  )
  const addressLength = buffer.readInt8(currentByte++)
  const address = parseAddress(
    buffer.subarray(currentByte, (currentByte += addressLength))
  )
  const records = parseRecords(buffer.subarray(currentByte))

  return {
    type: "announce",
    nodeId,
    address,
    records,
  }
}

const parseDeleteMessage = (buffer: Buffer): DeleteMessage => {
  let currentByte = 0

  const nodeIdLength = buffer.readInt8(currentByte++)
  const nodeId = buffer.toString(
    "hex",
    currentByte,
    (currentByte += nodeIdLength)
  )
  const classIdCount = buffer.readInt8(currentByte++)
  const classIds = concatTimes(classIdCount, () => {
    return buffer.toString("hex", currentByte, (currentByte += 2))
  })

  return {
    type: "delete",
    nodeId,
    classIds,
  }
}

const parseRecords = (buffer: Buffer): AnnounceRecord[] => {
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

const parseAddress = (buffer: Buffer): string => {
  return new Uint8Array(buffer).join(".")
}
