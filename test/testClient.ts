import { createLsdpListener } from "../src/index"

const connection = createLsdpListener((err, result) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(JSON.stringify(result, null, 2))
})

connection.then(c => {
  c.query(
    { type: "query", messageType: "standard", classIds: ["0001"] },
    "192.168.1.255"
  ).then(() => {
    console.log("query sent")
  })
})
