export const concatTimes = <T>(n: number, cb: (i: number) => T): T[] => {
  const result: T[] = []

  for (let i = 0; i < n; i++) {
    result.push(cb(i))
  }

  return result
}
