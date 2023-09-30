import { describe, it } from "node:test"
import assert from "node:assert"
import {
  AnnounceMessage,
  Connection,
  Packet,
  createConnection,
} from "../src/index"
import { wait } from "./testUtil"

describe("Connection", () => {
  it("should send and receive announcement", async () => {
    const message: AnnounceMessage = {
      type: "announce",
      nodeId: "9076824274c4",
      address: "192.168.10.10",
      records: [
        {
          classId: "0001",
          txtRecords: {
            name: "Bluesound Node",
            port: "11000",
            model: "N130",
            version: "3.20.52",
            zs: "0",
          },
        },
        {
          classId: "0004",
          txtRecords: {
            name: "Bluesound Node",
            port: "11431",
          },
        },
      ],
    }

    let connection: Connection | undefined
    const receivedPackets: Packet[] = []

    try {
      connection = await createConnection({ loopbackOnly: true })
      connection.onData((err, packet) => {
        if (err) {
          throw err
        }
        if (packet) {
          receivedPackets.push(packet)
        }
      })
      await connection.sendMessage(message)
      while (receivedPackets.length < 1) {
        await wait(100)
      }
      assert.deepEqual(receivedPackets[0], { type: "lsdp", message })
    } finally {
      connection?.close()
    }
  })
})
