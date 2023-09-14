import assert from "node:assert"
import { describe, it } from "node:test"
import { parsePacket } from "../src/lsdpParser"

describe("LSDP parser", () => {
  it("should parse announce message", () => {
    const hexPacket =
      "064c534450017341069076824274c404c0a80a0a02000105046e616d650e426c7565736f756e64204e6f646504706f7274053131303030056d6f64656c044e3133300776657273696f6e07332e32302e3532027a730130000402046e616d650e426c7565736f756e64204e6f646504706f7274053131343331"
    const buffer = Buffer.from(hexPacket, "hex")
    const packet = parsePacket(buffer)

    assert.deepEqual(packet, {
      type: "lsdp",
      message: {
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
      },
    })
  })
  it("should parse delete message", () => {
    const hexPacket = "064c534450017344069076824274c40200010004"
    const buffer = Buffer.from(hexPacket, "hex")
    const packet = parsePacket(buffer)

    assert.deepEqual(packet, {
      type: "lsdp",
      message: {
        type: "delete",
        nodeId: "9076824274c4",
        classIds: ["0001", "0004"],
      },
    })
  })
  it("should parse query message", () => {
    const hexPacket = "064c5344500173510200010004"
    const buffer = Buffer.from(hexPacket, "hex")
    const packet = parsePacket(buffer)

    assert.deepEqual(packet, {
      type: "lsdp",
      message: {
        type: "query",
        messageType: "standard",
        classIds: ["0001", "0004"],
      },
    })
  })
})
