export const concatTimes = <T>(n: number, cb: (i: number) => T): T[] => {
  const result: T[] = []

  for (let i = 0; i < n; i++) {
    result.push(cb(i))
  }

  return result
}

export const getBroadcastIp = (ip: string, subnetMask: string): string => {
  const ipNumber = ipStrToNumber(ip)
  const subnetMaskNumber = ipStrToNumber(subnetMask)
  const broadcastIpNumber = ipNumber | ~subnetMaskNumber
  return ipNumberToStr(broadcastIpNumber)
}

const ipStrToNumber = (ip: string): number => {
  const ipNumbers = ip.split(".").map(Number)
  return new DataView(Uint8Array.from(ipNumbers).buffer).getUint32(0, true)
}

const ipNumberToStr = (ipNumber: number): string => {
  const ipBuffer = Buffer.alloc(4)
  new DataView(ipBuffer.buffer).setUint32(0, ipNumber, true)
  return Array.from(ipBuffer).join(".")
}
