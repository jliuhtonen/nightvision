# Nightvision

[![Nightvision CI](https://github.com/jliuhtonen/nightvision/actions/workflows/workflow.yml/badge.svg)](https://github.com/jliuhtonen/nightvision/actions/workflows/workflow.yml)

Lenbrook Service [Discovery](https://youtu.be/xBTqRd09y3E) Protocol implementation for Node.js. See [specification](https://content-bluesound-com.s3.amazonaws.com/uploads/2022/07/BluOS-Custom-Integration-API-v1.5.pdf).

This library provides you with a client and server implementation for the protocol that allows you to send and receive messages to discover supported devices and their capabilities.

Currently, it cannot be used to advertise services as only queries can be sent. Contributions are welcome.

## Example

```javascript
import { createConnection } from "nightvision"
const conn = await createConnection()

conn.onData((err, result) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(JSON.stringify(result, null, 2))
})

await conn.sendMessage({
  type: "query",
  messageType: "standard",
  classIds: ["0001"],
})
```

As mentioned in the specification, the guideline is to send startup messages 7 times within certain time interval and delays.
This is considered out of scope for this library.
