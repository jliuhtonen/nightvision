import { networkInterfaces, NetworkInterfaceInfo } from "os"

export interface NetworkInterface {
  address: string
  netmask: string
}

export const getNonLoopbackInterfaces = (): NetworkInterface[] => {
  const interfaces = networkInterfaces()
  return Object.values(interfaces)
    .flat()
    .filter(
      (iface): iface is NetworkInterfaceInfo =>
        iface !== undefined && iface.family === "IPv4" && !iface.internal
    )
    .map(({ address, netmask }) => ({ address, netmask }))
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
