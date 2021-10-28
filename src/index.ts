import * as fs from 'fs';

export default class Bufferlo {
  private _buffer: Buffer = null;
  private _encoding: BufferEncoding;
  private _fd: number = 0;
  private _index: number = 0;

  static decimalTo(decimal: number, target: 'binary' | 'octal' | 'hex') {
    switch (target) {
      case 'binary':
        return decimal.toString(2);
      case 'octal':
        return decimal.toString(8);
      case 'hex':
        return decimal.toString(16);
    }
  }

  static binaryTo(binary: string, target: 'decimal' | 'octal' | 'hex') {
    switch (target) {
      case 'decimal':
        return parseInt(binary, 2);
      case 'octal':
        return Bufferlo.decimalTo(parseInt(binary, 2), target);
      case 'hex':
        return Bufferlo.decimalTo(parseInt(binary, 2), target);
      default:
        return binary;
    }
  }

  static hexTo(hex: string, target: 'binary' | 'decimal' | 'octal') {
    switch (target) {
      case 'decimal':
        return parseInt(hex, 16);
      default:
        return Bufferlo.decimalTo(parseInt(hex, 16), target);
    }
  }

  static octalTo(octal: string, target: 'binary' | 'decimal' | 'hex') {
    switch (target) {
      case 'decimal':
        return parseInt(octal, 8);
      default:
        return Bufferlo.decimalTo(parseInt(octal, 8), target);
    }
  }

  static ofArray(data: Uint8Array | ReadonlyArray<number>) {
    const bf = new Bufferlo();
    bf.buffer = Buffer.from(data);
    return bf;
  }

  static ofArrayBuffer(arrayBuffer: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>) {
    const bf = new Bufferlo();
    bf.buffer = Buffer.from(arrayBuffer);
    return bf;
  }

  constructor(content?: string, encoding: BufferEncoding = 'utf-8') {
    if (content) this._buffer = Buffer.from(content);
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

  get byteLength() {
    return this.buffer.byteLength;
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

  *[Symbol.iterator]() {
    return yield* this.buffer;
  }

  allocBytes(n: number, fill: string | number | Buffer = 0) {
    this.buffer = Buffer.alloc(n, fill, this.encoding);
    this.index = 0;
  }

  allocBytesUnsafe(n: number) {
    this.buffer = Buffer.allocUnsafe(n);
    this.index = 0;
  }

  allocKiloBytes(n: number, fill: string | number | Buffer = 0) {
    this.allocBytes(1024 * n, fill);
  }

  allocKiloBytesUnsafe(n: number) {
    this.allocBytesUnsafe(1024 * n);
  }

  allocMegaBytes(n: number, fill: string | number | Buffer = 0) {
    this.allocBytes(Math.pow(1024, 2) * n, fill);
  }

  allocMegaBytesUnsafe(n: number) {
    this.allocBytesUnsafe(Math.pow(1024, 2) * n);
  }

  append(content: string) {
    if (!this.fit(content)) throw new Error('Not enough memory available!');
    return this.write(content, this.index);
  }

  appendToFile(cb?: (buffer: Bufferlo) => void): void {
    if (!this.fd) throw new Error('No file descriptor set!');
    fs.appendFile(this.fd, this.buffer, { encoding: this.encoding }, (err: Error) => {
      if (err) throw err;
      if (typeof cb === 'function') cb(this);
    });
  }

  appendToFileSync(): void {
    if (!this.fd) throw new Error('No file descriptor set!');
    fs.appendFileSync(this.fd, this.buffer, { encoding: this.encoding });
  }

  available() {
    return this.isBuffer() ? this.length - this.index : 0;
  }

  at(index: number) {
    return this.buffer[index];
  }

  clone() {
    const bufferlo: Bufferlo = new Bufferlo();
    bufferlo.buffer = Buffer.alloc(this.length);
    this.copy(bufferlo);
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

  copyToIndex(buffer: Bufferlo, sourceStart: number = 0, sourceEnd: number = this.length) {
    return this.copy(buffer, buffer.index, sourceStart, sourceEnd);
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
    return this.buffer.equals(bufferlo.buffer);
  }

  fit(content: string) {
    return Buffer.byteLength(content, this.encoding) <= this.available();
  }

  fromAscii(content: string) {
    this.encoding = 'ascii';
    this.buffer = Buffer.from(content, this.encoding);
    this.index = this.buffer.length;
  }

  fromBinary(content: string) {
    this.encoding = 'binary';
    this.buffer = Buffer.from(content, this.encoding);
    this.index = this.buffer.length;
  }

  fromFile(cb: (buffer: Bufferlo) => void) {
    if (!this.fd) throw new Error('No file descriptor set!');
    fs.readFile(this.fd, this.encoding, (err: Error, data: Buffer) => {
      if (err) throw err;
      this.buffer = Buffer.from(data);
      this.index = this.buffer.length;
      cb(this);
    });
  }

  fromFileSync() {
    if (!this.fd) throw new Error('No file descriptor set!');
    this.buffer = Buffer.from(fs.readFileSync(this.fd, this.encoding), this.encoding);
    this.index = this.buffer.length;
  }

  fromHex(content: string) {
    this.encoding = 'hex';
    this.buffer = Buffer.from(content, this.encoding);
    this.index = this.buffer.length;
  }

  fromUtf8(content: string) {
    this.encoding = 'utf-8';
    this.buffer = Buffer.from(content, this.encoding);
    this.index = this.buffer.length;
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

  moveIndex(position: 'start' | 'center' | 'end' | 'empty') {
    switch (position) {
      case 'start':
        this.index = 0;
        break;
      case 'center':
        this.index = Math.floor(this.length / 2);
        break;
      case 'end':
        this.index = this.length;
        break;
      case 'empty':
        this.index = this.buffer.indexOf(0);
        break;
    }
  }

  openFile(path: string, mode: fs.OpenMode = 'r+') {
    this.fd = fs.openSync(path, mode);
  }

  set(index: number, value: number) {
    this.buffer[index] = value;
  }

  setBase(index: number, value: string, base: number = 10) {
    this.buffer[index] = parseInt(value, base);
  }

  setBinary(index: number, value: string) {
    this.setBase(index, value, 2);
  }

  setHex(index: number, value: string) {
    this.setBase(index, value, 16);
  }

  setOctal(index: number, value: string) {
    this.setBase(index, value, 8);
  }

  slice(start: number = 0, end: number = this.length) {
    return this.buffer.slice(start, end);
  }

  toArray() {
    return [...this.buffer];
  }

  toAscii() {
    return this.toString('ascii');
  }

  toBinary() {
    return this.toDecimal().toString(2);
  }

  toDecimal() {
    return parseInt(this.toHex(), 16);
  }

  toHex() {
    return this.toString('hex');
  }

  toJSON() {
    return this.buffer.toJSON();
  }

  toOctal() {
    return this.toDecimal().toString(8);
  }

  toString(encoding: BufferEncoding = this.encoding) {
    return this.buffer.toString(encoding);
  }

  toUtf8() {
    return this.toString('utf-8');
  }

  toView(offset: number = 0, length: number = this.length) {
    return new DataView(this.buffer, offset, length);
  }

  write(content: string, offset: number = 0): number {
    const n = this.buffer.write(content, offset, this.encoding);
    this.index = offset + n;
    return n;
  }

  writeToFile(cb?: (buffer: Bufferlo) => void): void {
    if (!this.fd) throw new Error('No file descriptor set!');
    fs.writeFile(this.fd, this.buffer, { encoding: this.encoding }, (err: Error) => {
      if (err) throw err;
      if (typeof cb === 'function') cb(this);
    });
  }

  writeToFileSync(): void {
    if (!this.fd) throw new Error('No file descriptor set!');
    fs.writeFileSync(this.fd, this.buffer, { encoding: this.encoding });
  }
}
