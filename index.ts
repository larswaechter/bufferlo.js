import * as fs from 'fs';

class Bufferlo {
  private _buffer: Buffer = null;
  private _encoding: BufferEncoding;
  private _fd: number = 0;
  private _index: number = 0;

  constructor(
    buffer?: Buffer | string | number[] | ArrayBuffer | SharedArrayBuffer,
    encoding: BufferEncoding = 'utf-8'
  ) {
    if (Buffer.isBuffer(buffer)) this._buffer = Buffer.from(buffer);
    this._encoding = encoding;
  }

  private fixIndex() {
    if (this.index < 0) this.index = 0;
    if (this.index > this.length) this.index = this.length;
  }

  get buffer() {
    return this._buffer;
  }

  set buffer(buffer: Buffer) {
    this._buffer = buffer;
    this.fixIndex();
  }

  get encoding() {
    return this._encoding;
  }

  set encoding(encoding: BufferEncoding) {
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

  *[Symbol.iterator]() {
    return yield* this.buffer;
  }

  allocBytes(n: number, fill: string | number | Buffer = 0) {
    this.buffer = Buffer.alloc(n, fill, this.encoding);
    this.index = 0;
  }

  allocKiloBytes(n: number, fill: string | number | Buffer = 0) {
    this.buffer = Buffer.alloc(1024 * n, fill, this.encoding);
    this.index = 0;
  }

  allocMegaBytes(n: number, fill: string | number | Buffer = 0) {
    this.buffer = Buffer.alloc(Math.pow(1024, 2) * n, fill, this.encoding);
    this.index = 0;
  }

  append(content: string) {
    if (!this.fit(content)) throw new Error('Not enough memory available!');
    return this.write(content, this.index);
  }

  available() {
    return this.length - this.index;
  }

  bytesLeft() {
    return this.buffer.length - this.buffer.indexOf(0x00);
  }

  clone() {
    const bufferlo: Bufferlo = new Bufferlo();
    bufferlo.buffer.set(this.buffer);
    bufferlo.encoding = this.encoding;
    bufferlo.index = this.index;
    return bufferlo;
  }

  closeFile() {
    fs.closeSync(this.fd);
    this.fd = 0;
  }

  compare(buffer: Bufferlo) {
    return Buffer.compare(this.buffer, buffer.buffer);
  }

  concat(...list: Bufferlo[]): void {
    this.buffer = Buffer.concat([this.buffer, ...list.map((bf) => bf.buffer)]);
  }

  copy(
    buffer: Bufferlo,
    targetStart: number = 0,
    sourceStart: number = 0,
    sourceEnd: number = this.length
  ) {
    return this.buffer.copy(buffer.buffer, targetStart, sourceStart, sourceEnd);
  }

  copyFromIndex(buffer: Bufferlo) {
    return this.copy(buffer, buffer.index, this.index);
  }

  copyToFile(path: string, cb?: () => void) {
    fs.open(path, 'w', (err: Error, fd: number) => {
      if (err) throw err;
      fs.writeFile(fd, this.buffer, { encoding: this.encoding }, (_err: Error) => {
        if (_err) throw err;
        if (typeof cb === 'function') cb();
      });
    });
  }

  extend(n: number) {
    this.buffer = Buffer.concat([this.buffer, Buffer.alloc(n)]);
  }

  equals(bufferlo: Bufferlo) {
    return this.buffer === bufferlo.buffer;
  }

  fit(content: string) {
    return Buffer.byteLength(content, this.encoding) <= this.available();
  }

  fromUtf8(content: string) {
    this.buffer = Buffer.from(content, 'utf-8');
  }

  isBuffer() {
    return Buffer.isBuffer(this.buffer);
  }

  isEmpty() {
    return this.index === 0;
  }

  isFull() {
    return this.available() === 0;
  }

  loadFromFile(cb: (buffer: Bufferlo) => void) {
    if (!this.fd) throw new Error('No file descriptor found!');
    fs.readFile(this.fd, this.encoding, (err: Error, data: Buffer) => {
      if (err) throw err;
      this.buffer = Buffer.from(data);
      this.index = this.buffer.length;
      cb(this);
    });
  }

  loadFromFileSync() {
    if (!this.fd) throw new Error('No file descriptor found!');
    this.buffer = Buffer.from(fs.readFileSync(this.fd, this.encoding), this.encoding);
    this.index = this.buffer.length;
  }

  openFile(path: string, mode: fs.OpenMode = 'r+') {
    this.fd = fs.openSync(path, mode);
  }

  slice(start: number = 0, end: number = this.length) {
    return this.buffer.slice(start, end);
  }

  write(content: string, offset: number = 0): number {
    const n = this.buffer.write(content, offset, this.encoding);
    this.index = offset + n;
    return n;
  }

  writeToFile(cb?: (buffer: Bufferlo) => void): void {
    if (!this.fd) throw new Error('No file descriptor found!');
    fs.writeFile(this.fd, this.buffer, { encoding: this.encoding }, (err: Error) => {
      if (err) throw err;
      if (typeof cb === 'function') cb(this);
    });
  }

  writeToFileSync(): void {
    if (!this.fd) throw new Error('No file descriptor found!');
    fs.writeFileSync(this.fd, this.buffer, { encoding: this.encoding });
  }

  toArray() {
    return [...this.buffer];
  }

  toJSON() {
    return this.buffer.toJSON();
  }

  toView(offset: number = 0, length: number = this.length) {
    return new DataView(this.buffer, offset, length);
  }

  toAscii() {
    return this.toString('ascii');
  }

  toBase64() {
    return this.toString('base64');
  }

  toBinary() {
    return this.toString('binary');
  }

  toHex() {
    return this.toString('hex');
  }

  toUtf8() {
    return this.toString('utf-8');
  }

  toString(encoding: BufferEncoding = this.encoding) {
    return this.buffer.toString(encoding);
  }
}

const bf = new Bufferlo();
bf.allocBytes(3);
bf.append('a');
bf.append('b');

for (const val of bf) console.log(val);

const tmp = Buffer.alloc(3);
tmp.write('c', 0);
tmp.write('d', 1);
for (const val of tmp) console.log(val);

console.log(bf.buffer);
