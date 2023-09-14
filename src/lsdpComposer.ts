import { HEADER_LENGTH_BYTES, PROTOCOL_VERSION, QueryMessage } from "./model"

const QUERY_BASE_LENGTH_BYTES = 3

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
