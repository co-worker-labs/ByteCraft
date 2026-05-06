export class SSHBuffer {
  private parts: Uint8Array[] = [];

  writeUint32(n: number): void {
    const buf = new Uint8Array(4);
    buf[0] = (n >>> 24) & 0xff;
    buf[1] = (n >>> 16) & 0xff;
    buf[2] = (n >>> 8) & 0xff;
    buf[3] = n & 0xff;
    this.parts.push(buf);
  }

  writeString(s: string | Uint8Array): void {
    const bytes = typeof s === "string" ? new TextEncoder().encode(s) : s;
    this.writeUint32(bytes.length);
    this.parts.push(bytes);
  }

  writeMpint(n: Uint8Array): void {
    if (n.length === 0) {
      this.writeUint32(0);
      return;
    }
    let padded: Uint8Array;
    if (n[0] & 0x80) {
      padded = new Uint8Array(n.length + 1);
      padded.set(n, 1);
    } else {
      padded = n;
    }
    this.writeUint32(padded.length);
    this.parts.push(padded);
  }

  writeRaw(bytes: Uint8Array): void {
    this.parts.push(bytes);
  }

  toBytes(): Uint8Array {
    const total = this.parts.reduce((sum, p) => sum + p.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const p of this.parts) {
      result.set(p, offset);
      offset += p.length;
    }
    return result;
  }
}

export class SSHReader {
  private data: Uint8Array;
  private pos = 0;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  readUint32(): number {
    const n =
      ((this.data[this.pos] << 24) |
        (this.data[this.pos + 1] << 16) |
        (this.data[this.pos + 2] << 8) |
        this.data[this.pos + 3]) >>>
      0;
    this.pos += 4;
    return n;
  }

  readString(): Uint8Array {
    const len = this.readUint32();
    const result = this.data.slice(this.pos, this.pos + len);
    this.pos += len;
    return result;
  }

  readStringUtf8(): string {
    return new TextDecoder().decode(this.readString());
  }

  get remaining(): number {
    return this.data.length - this.pos;
  }

  get offset(): number {
    return this.pos;
  }
}

interface DerValue {
  tag: number;
  value: Uint8Array;
  children?: DerValue[];
}

function parseDerInner(data: Uint8Array, start: number, end: number): DerValue[] {
  const result: DerValue[] = [];
  let pos = start;
  while (pos < end) {
    const tag = data[pos++];
    let length = data[pos++];
    if (length & 0x80) {
      const numBytes = length & 0x7f;
      length = 0;
      for (let i = 0; i < numBytes; i++) {
        length = (length << 8) | data[pos++];
      }
    }
    const valueStart = pos;
    const valueEnd = pos + length;
    const value = data.slice(valueStart, valueEnd);
    const isConstructed = (tag & 0x20) !== 0;
    const children = isConstructed ? parseDerInner(data, valueStart, valueEnd) : undefined;
    result.push({ tag, value, children });
    pos = valueEnd;
  }
  return result;
}

export function parseDerTagged(data: Uint8Array): DerValue[] {
  return parseDerInner(data, 0, data.length);
}

function readDerInteger(value: Uint8Array): Uint8Array {
  let start = 0;
  while (start < value.length && value[start] === 0x00) {
    start++;
  }
  return value.slice(start);
}

export interface RsaPrivateComponents {
  n: Uint8Array;
  e: Uint8Array;
  d: Uint8Array;
  p: Uint8Array;
  q: Uint8Array;
  dp: Uint8Array;
  dq: Uint8Array;
  iqmp: Uint8Array;
}

export function extractRsaFromPkcs8(pkcs8: Uint8Array): RsaPrivateComponents {
  const outer = parseDerTagged(pkcs8);
  const seq = outer[0].children!;
  const rsaSeq = parseDerTagged(seq[2].value);
  const ints = rsaSeq[0].children!.slice(1);
  const [n, e, d, p, q, dp, dq, iqmp] = ints.map((v) => readDerInteger(v.value));
  return { n, e, d, p, q, dp, dq, iqmp };
}

export interface RsaPublicComponents {
  n: Uint8Array;
  e: Uint8Array;
}

export function extractRsaFromSpki(spki: Uint8Array): RsaPublicComponents {
  const outer = parseDerTagged(spki);
  const seq = outer[0].children!;
  const bitString = seq[1].value;
  const rsaSeq = parseDerTagged(bitString.slice(1));
  const [n, e] = rsaSeq[0].children!.map((v) => readDerInteger(v.value));
  return { n, e };
}

export function serializeRsaPublicBlob(e: Uint8Array, n: Uint8Array): Uint8Array {
  const buf = new SSHBuffer();
  buf.writeString("ssh-rsa");
  buf.writeMpint(e);
  buf.writeMpint(n);
  return buf.toBytes();
}

export function serializeEd25519PublicBlob(publicKey: Uint8Array): Uint8Array {
  const buf = new SSHBuffer();
  buf.writeString("ssh-ed25519");
  buf.writeString(publicKey);
  return buf.toBytes();
}

export function buildEd25519PrivateData(publicKey: Uint8Array, seed: Uint8Array): Uint8Array {
  const buf = new SSHBuffer();
  buf.writeString("ssh-ed25519");
  buf.writeString(publicKey);
  const secretKey = new Uint8Array(64);
  secretKey.set(seed, 0);
  secretKey.set(publicKey, 32);
  buf.writeString(secretKey);
  return buf.toBytes();
}

export function buildRsaPrivateData(rsa: RsaPrivateComponents): Uint8Array {
  const buf = new SSHBuffer();
  buf.writeString("ssh-rsa");
  buf.writeMpint(rsa.n);
  buf.writeMpint(rsa.e);
  buf.writeMpint(rsa.d);
  buf.writeMpint(rsa.iqmp);
  buf.writeMpint(rsa.p);
  buf.writeMpint(rsa.q);
  return buf.toBytes();
}

function pemEncode(raw: Uint8Array): string {
  const b64 = btoa(String.fromCharCode(...raw));
  const lines = b64.match(/.{1,70}/g) || [];
  return (
    "-----BEGIN OPENSSH PRIVATE KEY-----\n" +
    lines.join("\n") +
    "\n-----END OPENSSH PRIVATE KEY-----\n"
  );
}

export interface PrivateKeyOptions {
  publicKeyBlob: Uint8Array;
  privateKeyData: Uint8Array;
  comment: string;
  passphrase: string;
}

export function buildOpenSshPrivateKey(opts: PrivateKeyOptions): string {
  const blockSize = 8;

  const checkInt = new Uint8Array(4);
  crypto.getRandomValues(checkInt);
  const checkVal = (checkInt[0] << 24) | (checkInt[1] << 16) | (checkInt[2] << 8) | checkInt[3];

  const inner = new SSHBuffer();
  inner.writeUint32(checkVal);
  inner.writeUint32(checkVal);
  inner.writeRaw(opts.privateKeyData);
  inner.writeString(opts.comment);

  let innerBytes = inner.toBytes();
  const padLen = (blockSize - (innerBytes.length % blockSize)) % blockSize;
  if (padLen > 0) {
    const padding = new Uint8Array(padLen);
    for (let i = 0; i < padLen; i++) padding[i] = (i + 1) & 0xff;
    const combined = new Uint8Array(innerBytes.length + padLen);
    combined.set(innerBytes);
    combined.set(padding, innerBytes.length);
    innerBytes = combined;
  }

  const outer = new SSHBuffer();
  outer.writeRaw(new TextEncoder().encode("openssh-key-v1\0"));
  outer.writeString("none");
  outer.writeString("none");
  outer.writeString("");
  outer.writeUint32(1);
  outer.writeString(opts.publicKeyBlob);
  outer.writeString(innerBytes);

  return pemEncode(outer.toBytes());
}
