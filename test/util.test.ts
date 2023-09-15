import { describe, it } from "node:test"
import { getBroadcastIp } from "../src/network"
import assert from "node:assert"

describe("Network", () => {
  it("Calculates broadcast ip", () => {
    assert.equal(
      getBroadcastIp("192.168.0.8", "255.255.255.0"),
      "192.168.0.255"
    )
    assert.equal(getBroadcastIp("10.0.1.5", "255.255.0.0"), "10.0.255.255")
  })
})
