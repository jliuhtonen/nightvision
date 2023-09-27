import {
  AnnounceMessage,
  HEADER_LENGTH_BYTES,
  PROTOCOL_VERSION,
  QueryMessage,
} from "./model"

const QUERY_BASE_LENGTH_BYTES = 3
const ANNOUNCE_HEADER_BASE_LENGTH_BYTES = 5
const IP_ADDR_LENGTH_BYTES = 4

const calculateTxtRecordLengthBytes = (
  txtRecords: Record<string, string>
): number =>
  Object.entries(txtRecords).reduce(
    (acc, [key, value]) => acc + 2 + key.length + value.length,
    0
  )

const calculateAnnounceLengthBytes = (announce: AnnounceMessage): number =>
  HEADER_LENGTH_BYTES +
  ANNOUNCE_HEADER_BASE_LENGTH_BYTES +
  announce.nodeId.length / 2 +
  IP_ADDR_LENGTH_BYTES +
  announce.records.reduce(
    (acc: number, record) =>
      acc + 3 + calculateTxtRecordLengthBytes(record.txtRecords),
    0
  )

export const composeAnnounce = (announce: AnnounceMessage): Buffer => {
  const messageLength = calculateAnnounceLengthBytes(announce)
  const buffer = Buffer.alloc(messageLength)
  let currentByte = 0

  buffer.writeInt8(HEADER_LENGTH_BYTES, currentByte++)
  buffer.write("LSDP", currentByte, (currentByte += 4), "utf8")
  buffer.writeInt8(PROTOCOL_VERSION, currentByte++)

  buffer.writeInt8(messageLength - HEADER_LENGTH_BYTES, currentByte++)
  buffer.write("A", currentByte++, 1, "utf8")
  buffer.writeInt8(announce.nodeId.length / 2, currentByte++)
  buffer.write(
    announce.nodeId,
    currentByte,
    (currentByte += announce.nodeId.length / 2),
    "hex"
  )
  buffer.writeInt8(IP_ADDR_LENGTH_BYTES, currentByte++)

  const ipAddr = new Uint8Array(announce.address.split(".").map(Number))
  ipAddr.forEach(byte => buffer.writeUInt8(byte, currentByte++))

  buffer.writeInt8(announce.records.length, currentByte++)
  announce.records.forEach(record => {
    buffer.write(record.classId, currentByte, (currentByte += 2), "hex")
    buffer.writeInt8(Object.keys(record.txtRecords).length, currentByte++)
    Object.entries(record.txtRecords).forEach(([key, value]) => {
      buffer.writeInt8(key.length, currentByte++)
      buffer.write(key, currentByte, (currentByte += key.length), "utf8")
      buffer.writeInt8(value.length, currentByte++)
      buffer.write(value, currentByte, (currentByte += value.length), "utf8")
    })
  })

  return buffer
}

export const composeQuery = (query: QueryMessage): Buffer => {
  const buffer = Buffer.alloc(
    HEADER_LENGTH_BYTES + QUERY_BASE_LENGTH_BYTES + query.classIds.length * 2
  )
  let currentByte = 0

  buffer.writeInt8(HEADER_LENGTH_BYTES, currentByte++)
  buffer.write("LSDP", currentByte, (currentByte += 4), "utf8")
  buffer.writeInt8(PROTOCOL_VERSION, currentByte++)
  buffer.writeInt8(
    QUERY_BASE_LENGTH_BYTES + query.classIds.length * 2,
    currentByte++
  )
  buffer.write(composeQueryType(query.messageType), currentByte++, 1, "utf8")
  buffer.writeInt8(query.classIds.length, currentByte++)
  query.classIds.forEach(classId => {
    buffer.write(classId, currentByte, (currentByte += 2), "hex")
  })
  return buffer
}

export const composeQueryType = (queryType: "standard" | "unicast"): string => {
  switch (queryType) {
    case "standard":
      return "Q"
    case "unicast":
      return "R"
  }
}
