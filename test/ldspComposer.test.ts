import { describe, it } from "node:test"
import { QueryMessage } from "../src/model"
import { composeQuery } from "../src/lsdpComposer"
import assert from "node:assert"

describe("LSDP composer", () => {
  it("should compose query message", () => {
    const query: QueryMessage = {
      type: "query",
      classIds: ["0001", "0004"],
      messageType: "standard",
    }
    const buffer = composeQuery(query)
    assert.strictEqual(buffer.toString("hex"), "064c5344500107510200010004")
  })
})
