import * as fs from 'fs';

type Encoding = 'utf-8';

class Bufferlo {
  private _buffer: Buffer = null;
  private _encoding: Encoding;
  private _fd: number = 0;
  private _index: number = 0;

  constructor(
    buffer?: Buffer | string | number[] | ArrayBuffer | SharedArrayBuffer,
    encoding: Encoding = 'utf-8'
  ) {
    if (Buffer.isBuffer(buffer)) this._buffer = Buffer.from(buffer);
    this._encoding = encoding;
  }

  get buffer() {
    return this._buffer;
  }

  set buffer(buffer: Buffer) {
    this._buffer = buffer;
  }

  get encoding() {
    return this._encoding;
  }

  set encoding(encoding: Encoding) {
    this._encoding = encoding;
  }

  get fd() {
    return this._fd;
  }

  set fd(fd: number) {
    this._fd = fd;
  }

  get index() {
    return this._index;
  }

  set index(index: number) {
    this._index = index;
  }

  get length() {
    return this.buffer.length;
  }

  get byteLength() {
    return this.buffer.byteLength;
  }

  allocBytes(n: number, fill: string | number | Buffer = 0) {
    this.buffer = Buffer.alloc(n, fill, this.encoding);
    this.index = this.length;
  }

  allocKiloBytes(n: number, fill: string | number | Buffer = 0) {
    this.buffer = Buffer.alloc(1024 * n, fill, this.encoding);
    this.index = this.length;
  }

  allocMegaBytes(n: number, fill: string | number | Buffer = 0) {
    this.buffer = Buffer.alloc(Math.pow(1024, 2) * n, fill, this.encoding);
    this.index = this.length;
  }

  available() {
    return this.length - this.index;
  }

  isEmpty() {
    return this.index === 0;
  }

  isFull() {
    return this.available() === 0;
  }

  bytesLeft() {
    return this.buffer.length - this.buffer.indexOf(0x00);
  }

  clone() {
    const bufferlo: Bufferlo = new Bufferlo();
    bufferlo.encoding = this.encoding;
    bf.index = this.index;
    bufferlo.buffer.set(this.buffer);
    return bufferlo;
  }

  compare(bufferlo: Bufferlo) {
    return Buffer.compare(this.buffer, bufferlo.buffer);
  }

  fit(content: string) {
    return Buffer.byteLength(content, this.encoding) <= this.available();
  }

  extend(n: number) {
    this.buffer = Buffer.concat([this.buffer, Buffer.alloc(n)]);
  }

  equals(bufferlo: Bufferlo) {
    return this.buffer === bufferlo.buffer;
  }

  isBuffer() {
    return Buffer.isBuffer(this.buffer);
  }

  append(content: string) {
    return this.write(content, this.index);
  }

  write(content: string, offset: number = 0): number {
    const n = this.buffer.write(content, offset, this.encoding);
    this.index += n;
    return n;
  }

  openFile(path: string, mode: fs.OpenMode = 'r+') {
    this.fd = fs.openSync(path, mode);
  }

  closeFile() {
    fs.closeSync(this.fd);
    this.fd = 0;
  }

  concat(...list: Bufferlo[]): void {
    this.buffer = Buffer.concat([this.buffer, ...list.map((bf) => bf.buffer)]);
  }

  fromUtf8(content: string) {
    this.buffer = Buffer.from(content, 'utf-8');
  }

  fromFileSync() {
    if (!this.fd) throw new Error('No file descriptor found!');
    this.buffer = Buffer.from(fs.readFileSync(this.fd, this.encoding), this.encoding);
    this.index = this.buffer.length;
  }

  fromFile(cb: (buffer: Bufferlo) => void) {
    if (!this.fd) throw new Error('No file descriptor found!');
    fs.readFile(this.fd, this.encoding, (err: Error, data: Buffer) => {
      if (err) throw err;
      this.buffer = Buffer.from(data);
      this.index = this.buffer.length;
      cb(this);
    });
  }

  toFile(cb?: () => void): void {
    if (!this.fd) throw new Error('No file descriptor found!');
    fs.writeFile(this.fd, this.buffer, { encoding: this.encoding }, (err: Error) => {
      if (err) throw err;
      if (typeof cb === 'function') cb();
    });
  }

  copyTo(path: string, cb?: () => void) {
    fs.open(path, 'w', (err: Error, fd: number) => {
      if (err) throw err;
      fs.writeFile(fd, this.buffer, { encoding: this.encoding }, (_err: Error) => {
        if (_err) throw err;
        if (typeof cb === 'function') cb();
      });
    });
  }

  asAscii() {
    return this.buffer.toString('ascii');
  }

  asBase64() {
    return this.buffer.toString('base64');
  }

  asBinary() {
    return this.buffer.toString('binary');
  }

  asHex() {
    return this.buffer.toString('hex');
  }

  asUtf8() {
    return this.buffer.toString('utf-8');
  }
}

const bf = new Bufferlo();
bf.allocBytes(4, 'a');
console.log(bf.buffer);
