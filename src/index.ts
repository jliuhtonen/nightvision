import dgram from "node:dgram"
import { parsePacket } from "./lsdpParser"
import { Packet, QueryMessage } from "./model"
import { composeQuery } from "./lsdpComposer"
import { getNonLoopbackInterfaces, getBroadcastIp } from "./network"

const LSDP_PORT = 11430
export type Callback = (error?: Error, result?: Packet) => void

export interface Connection {
  close: () => void
  query: (query: QueryMessage) => Promise<void>
  onData: (cb: Callback) => void
}

export const createConnection = (): Promise<Connection> => {
  const broadcastIps = getNonLoopbackInterfaces().map(iface =>
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
        async query(query: QueryMessage): Promise<void> {
          const buffer = composeQuery(query)
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
