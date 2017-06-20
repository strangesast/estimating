export function hexToBin(str: string): Uint8Array {
  let a = [];
  for (let i=0; i < str.length; i+=2) {
    a.push(parseInt(str.substring(i, i+2), 16))
  }
  return new Uint8Array(a);
}

export function binToHex(bin : Uint8Array, start? : number, end? : number) : string {
  if (!(bin instanceof Uint8Array)) bin = new Uint8Array(bin)
  start = start == null ? 0 : start | 0
  end = end == null ? bin.length : end | 0
  let hex = ''
  for (let i = start; i < end; i++) {
    let byte = bin[i]
    hex += (byte < 0x10 ? '0' : '') + byte.toString(16)
  }
  return hex
}

export function parseOct(bin: Uint8Array, start?: number, end?: number): number {
  let val = 0,
      sign = 1
  if (bin[start] === 0x2d) {
    start++
    sign = -1
  }
  while (start < end) {
    val = (val << 3) + bin[start++] - 0x30
  }
  return sign * val
}

export function parseDec(bin: Uint8Array, start?: number, end?: number): number {
  let val = 0, sign = 1
  if (bin[start] === 0x2d) {
    start++
    sign = -1
  }
  while (start < end) {
    val = val * 10 + bin[start++] - 0x30
  }
  return sign * val
}

export function join(...arr: Uint8Array[]): Uint8Array {
  let buf = new Uint8Array(arr.reduce((a, b) => a + b.length, 0));
  for (let i=0,j=0,a; a=arr[i], i < arr.length; i++) {
    buf.set(a, j);
    j+=a.length;
  }
  return buf;
}

export function indexOf(bin : Uint8Array, raw : string, start?: number, end?: number): number {
  start = start == null ? 0 : start | 0
  end = end == null ? bin.length : end | 0
  outer: for (let i = start || 0; i < end; i++) {
    for (let j = 0, l = raw.length; j < l; j++) {
      if (i + j >= end || bin[i + j] !== raw.charCodeAt(j)) {
        continue outer
      }
    }
    return i
  }
  return -1
}
