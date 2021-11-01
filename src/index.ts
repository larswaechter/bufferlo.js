import * as fs from 'fs';

export default class Bufferlo {
  private _buffer: Buffer = null;
  private _encoding: BufferEncoding;
  private _fd: number = 0;
  private _index: number = 0;

  /**
   * Convert the given decimal number to a target number system.
   *
   * @param decimal - The decimal number
   * @param target - The target number system
   * @returns Converted decimal number
   */
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

  /**
   * Convert the given binary string to a target number system.
   *
   * @param binary - The binary string
   * @param target - The target number system
   * @returns Converted binary string
   */
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

  /**
   * Convert the given hex string to a target number system.
   *
   * @param hex - The hex string
   * @param target - The target number system
   * @returns Converted hex string
   */
  static hexTo(hex: string, target: 'binary' | 'decimal' | 'octal') {
    switch (target) {
      case 'decimal':
        return parseInt(hex, 16);
      default:
        return Bufferlo.decimalTo(parseInt(hex, 16), target);
    }
  }

  /**
   * Convert the given octal string to a target number system.
   *
   * @param octal - The octal string
   * @param target - The target number system
   * @returns Converted octal string
   */
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
    if (content) {
      this._buffer = Buffer.from(content);
      this.index = this.length;
    }
    this._encoding = encoding;
  }

  private fixIndex() {
    if (this.index < 0) this.index = 0;
    if (this.index > this.length) this.index = this.length;
  }

  private setBase(index: number, value: string, base: number) {
    this.buffer[index] = parseInt(value, base);
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
    return this.isBuffer() ? this.buffer.length : 0;
  }

  *[Symbol.iterator]() {
    return yield* this.buffer;
  }

  /**
   * Allocates a new `Buffer` of `size` Bytes. If `fill` is undefined, the `Buffer` will be zero-filled.
   *
   * @param size - The `Buffer` size
   * @param fill - The `Buffer`'s content
   */
  alloc(size: number, fill: string | number | Buffer = 0) {
    this.buffer = Buffer.alloc(size, fill, this.encoding);
    this.index = 0;
  }

  /**
   * Allocates a new `Buffer` of `size` Bytes. If `fill` is undefined, the `Buffer` will be zero-filled.
   * The underlying memory is not initialized.
   *
   * @param size - The `Buffer` size
   * @param fill - The `Buffer`'s content
   */
  allocUnsafe(size: number) {
    this.buffer = Buffer.allocUnsafe(size);
    this.index = 0;
  }

  /**
   * Allocates a new `Buffer` of `size` KiloBytes. If `fill` is undefined, the `Buffer` will be zero-filled.
   *
   * @param size - The `Buffer` size
   * @param fill - The `Buffer`'s content
   */
  allocKiloBytes(size: number, fill: string | number | Buffer = 0) {
    this.alloc(1024 * size, fill);
  }

  /**
   * Allocates a new `Buffer` of `size` KiloBytes. If `fill` is undefined, the `Buffer` will be zero-filled.
   * The underlying memory is not initialized.
   *
   * @param size - The `Buffer` size
   * @param fill - The `Buffer`'s content
   */
  allocKiloBytesUnsafe(size: number) {
    this.allocUnsafe(1024 * size);
  }

  /**
   * Allocates a new `Buffer` of `size` MegaBytes. If `fill` is undefined, the `Buffer` will be zero-filled.
   *
   * @param size - The `Buffer` size
   * @param fill - The `Buffer`'s content
   */
  allocMegaBytes(size: number, fill: string | number | Buffer = 0) {
    this.alloc(Math.pow(1024, 2) * size, fill);
  }

  /**
   * Allocates a new `Buffer` of `size` MegaBytes. If `fill` is undefined, the `Buffer` will be zero-filled.
   * The underlying memory is not initialized.
   *
   * @param size - The `Buffer` size
   * @param fill - The `Buffer`'s content
   */
  allocMegaBytesUnsafe(size: number) {
    this.allocUnsafe(Math.pow(1024, 2) * size);
  }

  /**
   * Append the given content to the `Buffer`, starting from the current `index` position.
   * The `index` is increased by the number of written bytes.
   *
   * @param content - The content to append
   * @returns The number of written Bytes
   */
  append(content: string) {
    if (!this.fit(content)) throw new Error('Not enough memory available!');
    return this.write(content, this.index);
  }

  /**
   * Append the Buffer content to the current open `fd`.
   */
  appendToFile(cb?: (buffer: Bufferlo) => void): void {
    if (!this.fd) throw new Error('No file descriptor set!');
    fs.appendFile(this.fd, this.buffer, { encoding: this.encoding }, (err: Error) => {
      if (err) throw err;
      if (typeof cb === 'function') cb(this);
    });
  }

  /**
   * Append the Buffer content to the current open `fd` synchronously.
   */
  appendToFileSync(): void {
    if (!this.fd) throw new Error('No file descriptor set!');
    fs.appendFileSync(this.fd, this.buffer, { encoding: this.encoding });
  }

  /**
   * Get the number of unwritten bytes, which depends on the current `index` position and the Buffer `size`.
   *
   * @returns
   */
  available() {
    return this.length - this.index;
  }

  /**
   * Get the byte at an given index.
   *
   * @param index - The `Buffer` array index
   * @param format - The number system of the return value
   * @returns The byte at this index
   */
  at(index: number, format: 'binary' | 'decimal' | 'octal' | 'hex' = 'decimal') {
    const fixedIndex = index < 0 ? this.length + index : index;
    if (fixedIndex >= this.length) return undefined;
    switch (format) {
      case 'decimal':
        return this.buffer[fixedIndex];
      default:
        return Bufferlo.decimalTo(this.buffer[fixedIndex], format);
    }
  }

  /**
   * Clone the current instance. The `fd` attribute is not copied.
   *
   * @returns New `Bufferlo` instance
   */
  clone() {
    const bufferlo: Bufferlo = new Bufferlo();
    bufferlo.buffer = Buffer.alloc(this.length);
    this.copy(bufferlo);
    bufferlo.encoding = this.encoding;
    bufferlo.index = this.index;
    return bufferlo;
  }

  /**
   * Close the current open `fd.`.
   */
  closeFile() {
    fs.closeSync(this.fd);
    this.fd = 0;
  }

  /**
   * Compare with a given `Buffer`.
   *
   * * `0` is returned if target is the same
   * * `1` is returned if target should come before
   * * `-1` is returned if target should come after
   *
   * @param buffer - The `Buffer` to compare
   * @returns
   */
  compare(buffer: Bufferlo) {
    return this.buffer.compare(buffer.buffer);
  }

  /**
   * Concat with a list of given `Buffers`.
   *
   * @param list - The `Buffers` to concat
   */
  concat(...list: Bufferlo[]): void {
    this.buffer = Buffer.concat([this.buffer, ...list.map((bf) => bf.buffer)]);
  }

  /**
   * Copy the `Buffer` content to a given `target`.
   *
   * @param buffer - Target `Buffer`
   * @param targetStart - The target `Buffer` starting position
   * @param sourceStart - The source `Buffer` starting position
   * @param sourceEnd - The source `Buffer` ending position
   * @returns The number of copied bytes
   */
  copy(
    buffer: Bufferlo,
    targetStart: number = 0,
    sourceStart: number = 0,
    sourceEnd: number = this.length
  ) {
    return this.buffer.copy(buffer.buffer, targetStart, sourceStart, sourceEnd);
  }

  /**
   * Copy the `Buffer` content to a given `target` starting at the `target`'s index.
   *
   * @param buffer - The target `Buffer`
   * @param sourceStart - The source `Buffer` starting position
   * @param sourceEnd  - The source `Buffer` ending position
   * @returns The number of copied bytes
   */
  copyToIndex(buffer: Bufferlo, sourceStart: number = 0, sourceEnd: number = this.length) {
    return this.copy(buffer, buffer.index, sourceStart, sourceEnd);
  }

  /**
   * Copy the `Buffer` content to a given file.
   * Use this method if you don't want to write to the current open `fd`.
   *
   * @param path - The file path
   * @param cb - The callback when the file is written
   */
  copyToFile(path: string, cb?: () => void) {
    fs.open(path, 'w', (err: Error, fd: number) => {
      if (err) throw err;
      fs.writeFile(fd, this.buffer, { encoding: this.encoding }, (_err: Error) => {
        if (_err) throw err;
        if (typeof cb === 'function') cb();
      });
    });
  }

  /**
   * Extend the `Buffer` by a given `size`.
   *
   * @param size - The size to extend
   */
  extend(size: number) {
    this.buffer = Buffer.concat([this.buffer, Buffer.alloc(size)]);
  }

  /**
   * Compare the bytes with given `Buffer`.
   *
   * @param bufferlo - The `Buffer` to compare
   * @returns `True` if all bytes equal, otherwise `false`
   */
  equals(bufferlo: Bufferlo) {
    return this.buffer.equals(bufferlo.buffer);
  }

  /**
   * Check whether the given `content` fits into the `Buffer`.
   * The content `fits` if enough bytes unwritten.
   *
   * @param content - The `content` to check
   * @returns `True` if the `content` fits, otherwise `false`
   */
  fit(content: string) {
    return Buffer.byteLength(content, this.encoding) <= this.available();
  }

  /**
   * Initialize the `Buffer` from a given Ascii `string`.
   *
   * @param content - The `content` for the initialization
   */
  fromAscii(content: string) {
    this.encoding = 'ascii';
    this.buffer = Buffer.from(content, this.encoding);
    this.index = this.buffer.length;
  }

  /**
   * Initialize the `Buffer` from the current open `fd`.
   *
   * @param cb - The callback when the `Buffer` is initialized
   */
  fromFile(cb: (buffer: Bufferlo) => void) {
    if (!this.fd) throw new Error('No file descriptor set!');
    fs.readFile(this.fd, this.encoding, (err: Error, data: Buffer) => {
      if (err) throw err;
      this.buffer = Buffer.from(data);
      this.index = this.buffer.length;
      cb(this);
    });
  }

  /**
   * Initialize the `Buffer` from the current open `fd` synchronously.
   */
  fromFileSync() {
    if (!this.fd) throw new Error('No file descriptor set!');
    this.buffer = Buffer.from(fs.readFileSync(this.fd, this.encoding), this.encoding);
    this.index = this.buffer.length;
  }

  /**
   * Initialize the `Buffer` from a given hex `string`.
   *
   * @param content - The hex `content` for the initialization
   */
  fromHex(content: string) {
    this.encoding = 'hex';
    this.buffer = Buffer.from(content, this.encoding);
    this.index = this.buffer.length;
  }

  /**
   * Check whether a valid `Buffer` is set.
   *
   * @returns `True` if a valid `Buffer` is set, otherwise ´false`
   */
  isBuffer() {
    return Buffer.isBuffer(this.buffer);
  }

  /**
   * Check whether the `Buffer` is empty. The `Buffer` is empty if the `index` is `0`.
   *
   * @returns `True` if the `Buffer` is empty, otherwise `false`
   */
  isEmpty() {
    return this.index === 0;
  }

  /**
   * Check whether the `Buffer` is full. The `Buffer` is full if the `index` equals the `Buffer` length.
   *
   * @returns `True` if the `Buffer` is full, otherwise `false`
   */
  isFull() {
    return this.available() === 0;
  }

  /**
   * Move the `index` to a given `position`. For setting the `index` to a fix number use the `index` attribute.
   *
   * @param position - The target `position`
   */
  moveIndex(position: 'start' | 'center' | 'end' | 'empty') {
    switch (position) {
      case 'start':
        this.index = 0;
        break;
      case 'center':
        this.index = Math.floor(this.length / 2);
        break;
      case 'end':
        this.index = Math.max(0, this.length - 1);
        break;
      case 'empty':
        this.index = this.buffer.indexOf(0);
        break;
    }
  }

  /**
   * Open a given file and update the `fd` to it.
   *
   * @param path - The file to open
   * @param mode - The file's `OpenMode`
   */
  openFile(path: string, mode: fs.OpenMode = 'r+') {
    this.fd = fs.openSync(path, mode);
  }

  /**
   * Set the byte at an given `index` to a given `value`.
   *
   * @param index - The `Buffer` array index
   * @param value - The new `value`
   */
  set(index: number, value: number) {
    this.buffer[index] = value;
  }

  /**
   * Set the byte at an given `index` to a given binary `value`.
   *
   * @param index - The `Buffer` array index
   * @param value - The new `value` in binary
   */
  setBinary(index: number, value: string) {
    this.setBase(index, value, 2);
  }

  /**
   * Set the byte at an given `index` to a given hex `value`.
   *
   * @param index - The `Buffer` array index
   * @param value - The new `value` in hex
   */
  setHex(index: number, value: string) {
    this.setBase(index, value, 16);
  }

  /**
   * Set the byte at an given `index` to a given hex `value`.
   *
   * @param index - The `Buffer` array index
   * @param value - The new `value` in hex
   */
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

  toUint8Array() {
    return new Uint8Array(this.buffer);
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
