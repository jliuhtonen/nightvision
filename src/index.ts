import dgram from "node:dgram"
import { Packet, parsePacket } from "./lsdpParser"

const LSDP_PORT = 11430
export type Callback = (error?: Error, result?: Packet) => void

export const createLsdpListener = (cb: Callback): (() => void) => {
  const socket = dgram.createSocket("udp4")

  socket.on("message", (msg, _rinfo) => {
    console.log(msg.toString("hex"))
    cb(undefined, parsePacket(msg))
  })

  socket.on("error", err => {
    cb(err)
  })

  socket.bind(LSDP_PORT)

  return () => {
    socket.close()
  }
}
