import dgram from "node:dgram"

const LSDP_PORT = 11430

export interface AnnounceMessage {
  length: number
  magicWord: string
  protocolVersion: number
}

export type LSDPCallback = (error?: Error, result?: AnnounceMessage) => void

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

const readLsdpBuffer = (buffer: Buffer): AnnounceMessage => {
  return {
    length: buffer.readInt8(0),
    magicWord: buffer.toString("utf8", 1, 1 + 4),
    protocolVersion: buffer.readInt8(5),
  }
}

createLsdpListener((err, result) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(result)
})
