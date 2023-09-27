export const HEADER_LENGTH_BYTES = 6
export const PROTOCOL_VERSION = 1

export type Packet = ReceivedPacket | UnknownPacket

export interface ReceivedPacket {
  type: "lsdp"
  message: ReceivedMessage
}

export interface UnknownPacket {
  type: "unknown"
}

export type ReceivedMessage = Message | UnknownMessage

export type Message = AnnounceMessage | DeleteMessage | QueryMessage

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

export interface QueryMessage {
  type: "query"
  messageType: "standard" | "unicast"
  classIds: string[]
}
