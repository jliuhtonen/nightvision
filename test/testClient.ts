import { createLsdpListener } from "../src/index"

createLsdpListener((err, result) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(JSON.stringify(result, null, 2))
})
