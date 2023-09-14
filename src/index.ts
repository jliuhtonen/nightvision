import dgram from "node:dgram"
import { parsePacket } from "./lsdpParser"
import { Packet, QueryMessage } from "./model"
import { composeQuery } from "./lsdpComposer"
import { concatTimes } from "./util"

const LSDP_PORT = 11430
export type Callback = (error?: Error, result?: Packet) => void

export interface Connection {
  close: () => void
  query: (query: QueryMessage, broadcastIp: string) => Promise<void>
}

export const createLsdpListener = (cb: Callback): Promise<Connection> => {
  const socket = dgram.createSocket("udp4")

  socket.on("message", (msg, _rinfo) => {
    cb(undefined, parsePacket(msg))
  })

  socket.on("error", err => {
    cb(err)
  })

  return new Promise(resolve => {
    socket.bind(LSDP_PORT, () => {
      socket.setBroadcast(true)
      resolve({
        query(query: QueryMessage, broadcastIp: string): Promise<void> {
          const buffer = composeQuery(query)

          return new Promise((res, rej) => {
            socket.send(buffer, LSDP_PORT, broadcastIp, err => {
              if (err) {
                rej(err)
              } else {
                res(void 0)
              }
            })
          })
        },
        close() {
          socket.close()
        },
      })
    })
  })
}
