export const HEADER_LENGTH_BYTES = 6
export const PROTOCOL_VERSION = 1

export type Packet = LSDPPacket | UnknownPacket

export interface LSDPPacket {
  type: "lsdp"
  message: Message
}

export interface UnknownPacket {
  type: "unknown"
}

export type Message =
  | AnnounceMessage
  | DeleteMessage
  | QueryMessage
  | UnknownMessage

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
