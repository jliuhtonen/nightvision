import dgram from "node:dgram"
import { parsePacket } from "./lsdpParser"
import { Message, Packet } from "./model"
import { composeMessage } from "./lsdpComposer"
import { getBroadcastIp, getNonLoopbackInterfaces } from "./network"

const LSDP_PORT = 11430
const loopbackInterface = { address: "127.0.0.1", netmask: "255.255.255.255" }

export type Callback = (error?: Error, result?: Packet) => void

export interface Connection {
  close: () => void
  sendMessage: (msg: Message) => Promise<void>
  onData: (cb: Callback) => void
}

export const createConnection = (loopbackOnly = false): Promise<Connection> => {
  const interfaces = loopbackOnly
    ? [loopbackInterface]
    : getNonLoopbackInterfaces()
  const broadcastIps = interfaces.map(iface =>
    getBroadcastIp(iface.address, iface.netmask)
  )
  const socket = dgram.createSocket("udp4")

  const sendDatagram = (buffer: Buffer, ip: string): Promise<void> => {
    return new Promise((res, rej) => {
      socket.send(buffer, LSDP_PORT, ip, err => {
        if (err) {
          rej(err)
        } else {
          res(void 0)
        }
      })
    })
  }

  return new Promise(resolve => {
    socket.bind(LSDP_PORT, () => {
      socket.setBroadcast(true)
      resolve({
        async sendMessage(msg: Message): Promise<void> {
          const buffer = composeMessage(msg)
          await Promise.all(
            broadcastIps.map(broadcastIp => sendDatagram(buffer, broadcastIp))
          )
        },
        close() {
          socket.close()
        },
        onData(cb: Callback) {
          socket.on("message", (msg, _rinfo) => {
            cb(undefined, parsePacket(msg))
          })

          socket.on("error", err => {
            cb(err)
          })
        },
      })
    })
  })
}

export * from "./model"
