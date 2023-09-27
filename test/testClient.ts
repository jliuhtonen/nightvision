import { createConnection } from "../src/index"

createConnection().then(conn => {
  conn.onData((err, result) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(JSON.stringify(result, null, 2))
  })

  conn
    .sendMessage({ type: "query", messageType: "standard", classIds: ["0001"] })
    .then(() => {
      console.log("query sent")
    })
})
