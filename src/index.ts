import * as fs from 'fs';

export default class Bufferlo {
  private _buffer: Buffer = null;
  private _encoding: BufferEncoding;
  private _fd: number = 0;
  private _index: number = 0;

  /**
   * Convert the given decimal number to a target numeral system.
   *
   * @param decimal - The `decimal` number
   * @param target - The `target` numeral system
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
   * Convert the given binary string to a target numeral system.
   *
   * @param binary - The `binary` string
   * @param target - The `target` numeral system
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
   * Convert the given hex string to a target numeral system.
   *
   * @param hex - The `hex` string
   * @param target - The `target` numeral system
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
   * Convert the given octal string to a target numeral system.
   *
   * @param octal - The `octal` string
   * @param target - The `target` numeral system
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

  /**
   * Creates a new `Bufferlo` instance by a given `Array`
   *
   * @param data - The `Array`
   * @returns An new `Bufferlo` instance
   */
  static ofArray(data: Uint8Array | ReadonlyArray<number>) {
    const bf = new Bufferlo();
    bf.buffer = Buffer.from(data);
    return bf;
  }

  /**
   * Creates a new `Bufferlo` instance by a given `ArrayBuffer`
   *
   * @param data - The `ArrayBuffer`
   * @returns An new `Bufferlo` instance
   */
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

  /**
   * Fix a broken index.
   */
  private fixIndex() {
    if (this.index < 0) this.index = 0;
    if (this.index > this.length) this.index = this.length;
  }

  /**
   * Sets the byte at an given `index` to a given `value`.
   * The `value` has to be in range 0-255.
   *
   * @param index - The byte's `index`
   * @param value - The new `value`
   * @param base - The base of the `value`'s numeral system
   */
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
   * Appends the given content to the `Buffer`, starting from the current `index` position.
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
   * Appends the Buffer content to the current opened file. A `fd` must be set.
   */
  appendToFile(cb?: (buffer: Bufferlo) => void): void {
    if (!this.fd) throw new Error('No file descriptor set!');
    fs.appendFile(this.fd, this.buffer, { encoding: this.encoding }, (err: Error) => {
      if (err) throw err;
      if (typeof cb === 'function') cb(this);
    });
  }

  /**
   * Appends the Buffer content to the current opened file synchronously. A `fd` must be set.
   */
  appendToFileSync(): void {
    if (!this.fd) throw new Error('No file descriptor set!');
    fs.appendFileSync(this.fd, this.buffer, { encoding: this.encoding });
  }

  /**
   * Gets the number of unwritten bytes, which depends on the current `index` position and the `size`.
   *
   * @returns Number of unwritten bytes
   */
  available() {
    return this.length - this.index;
  }

  /**
   * Gets the byte at an given `index` in a given numeral `system`.
   * Use an negative `index` to start from the `Buffer` end.
   *
   * @param index - The `Buffer` position
   * @param system - The numeral `system` of the return value
   * @returns The byte at this index
   */
  at(index: number, system: 'binary' | 'decimal' | 'octal' | 'hex' = 'decimal') {
    const fixedIndex = index < 0 ? this.length + index : index;
    if (fixedIndex >= this.length) return undefined;
    switch (system) {
      case 'decimal':
        return this.buffer[fixedIndex];
      default:
        return Bufferlo.decimalTo(this.buffer[fixedIndex], system);
    }
  }

  /**
   * Clones the current instance. The `fd` attribute is not copied.
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
   * Closes the current opened file (`fd`).
   */
  closeFile() {
    fs.closeSync(this.fd);
    this.fd = 0;
  }

  /**
   * Compares with a given `Bufferlo` instance.
   *
   * * `0` is returned if target is the same
   * * `1` is returned if target should come before
   * * `-1` is returned if target should come after
   *
   * @param buffer - The `Bufferlo` instance to compare
   * @returns
   */
  compare(buffer: Bufferlo) {
    return this.buffer.compare(buffer.buffer);
  }

  /**
   * Concats `Buffer` with a list of given `Bufferlo` instances.
   *
   * @param list - The `Buffer` instances to concat
   */
  concat(...list: Bufferlo[]): void {
    this.buffer = Buffer.concat([this.buffer, ...list.map((bf) => bf.buffer)]);
  }

  /**
   * Copies the `Buffer` content to a given `target`.
   *
   * @param buffer - Target `Buffer` instance
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
   * Copies the `Buffer` content to a given `target` starting at the `target`'s index.
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
   * Extends the `Buffer` by a given `size`.
   *
   * @param size - The size to extend
   */
  extend(size: number) {
    this.buffer = Buffer.concat([this.buffer, Buffer.alloc(size)]);
  }

  /**
   * Compares the bytes with given `Bufferlo` instance.
   *
   * @param bufferlo - The `Buffer` to compare
   * @returns `True` if all bytes equal, otherwise `false`
   */
  equals(bufferlo: Bufferlo) {
    return this.buffer.equals(bufferlo.buffer);
  }

  /**
   * Checks whether the given `content` fits into the `Buffer`.
   * The content `fits` if enough bytes are unwritten.
   *
   * @param content - The `content` to check
   * @returns `True` if the `content` fits, otherwise `false`
   */
  fit(content: string) {
    return Buffer.byteLength(content, this.encoding) <= this.available();
  }

  /**
   * Initializes the `Buffer` from a given Ascii `string`.
   * Sets the `encoding` to ASCII.
   *
   * @param content - The `content` for the initialization
   */
  fromAscii(content: string) {
    this.encoding = 'ascii';
    this.buffer = Buffer.from(content, this.encoding);
    this.index = this.buffer.length;
  }

  /**
   * Initializes the `Buffer` from the current opened file (`fd`).
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
   * Initializes the `Buffer` from the current open file (`fd`) synchronously.
   */
  fromFileSync() {
    if (!this.fd) throw new Error('No file descriptor set!');
    this.buffer = Buffer.from(fs.readFileSync(this.fd, this.encoding), this.encoding);
    this.index = this.buffer.length;
  }

  /**
   * Initializes the `Buffer` from a given hex `string`.
   *
   * @param content - The hex `content` for the initialization
   */
  fromHex(content: string) {
    this.encoding = 'hex';
    this.buffer = Buffer.from(content, this.encoding);
    this.index = this.buffer.length;
  }

  /**
   * Checks whether a valid `Buffer` is set.
   *
   * @returns `True` if a valid `Buffer` is set, otherwise ´false`
   */
  isBuffer() {
    return Buffer.isBuffer(this.buffer);
  }

  /**
   * Checks whether the `Buffer` is empty.
   * The `Buffer` is empty if the `index` is at position `0`.
   *
   * @returns `True` if the `Buffer` is empty, otherwise `false`
   */
  isEmpty() {
    return this.index === 0;
  }

  /**
   * Checks whether the `Buffer` is full.
   * The `Buffer` is full if the `index` equals the `Buffer` length.
   *
   * @returns `True` if the `Buffer` is full, otherwise `false`
   */
  isFull() {
    return this.available() === 0;
  }

  /**
   * Moves the `index` to a given `position`.
   * Use the `index` attribute for setting a fixed number.
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
   * Opens a given file and set the `fd` to it.
   *
   * @param path - The file to open
   * @param mode - The file's `OpenMode`
   */
  openFile(path: fs.PathLike, mode: fs.OpenMode = 'r+') {
    this.fd = fs.openSync(path, mode);
  }

  /**
   * Sets the byte at an given `index` to a given `value`.
   * The `value` has to be in range 0-255.
   *
   * @param index - The byte's `index`
   * @param value - The new `value`
   */
  set(index: number, value: number) {
    this.buffer[index] = value;
  }

  /**
   * Sets the byte at an given `index` to a given binary `value`.
   * The `value` has to be in range 0-255.
   *
   * @param index - The byte's `index`
   * @param value - The new `value` in binary
   */
  setBinary(index: number, value: string) {
    if (!new RegExp(/^[0-1]+$/g).test(value)) throw new Error('No valid binary value provided!');
    this.setBase(index, value, 2);
  }

  /**
   * Sets the byte at an given `index` to the Unicode of a given `value`.
   * The Unicode is determined using `.charCodeAt()`.
   *
   * @param index - The byte's `index`
   * @param value - The new `value`
   */
  setChar(index: number, value: string) {
    if (!value.length) throw new Error('Invalid char value provided!');
    this.buffer[index] = value.charCodeAt(0);
  }

  /**
   * Sets the byte at an given `index` to a given hex `value`.
   * The `value` has to be in range 0-255.
   *
   * @param index - The byte's `index`
   * @param value - The new `value` in hex
   */
  setHex(index: number, value: string) {
    if (!new RegExp(/^[0-9a-fA-F]+$/g).test(value)) throw new Error('No valid hex value provided!');
    this.setBase(index, value, 16);
  }

  /**
   * Sets the byte at an given `index` to a given hex `value`.
   * The `value` has to be in range 0-255.
   *
   * @param index - The byte's `index`
   * @param value - The new `value` in hex
   */
  setOctal(index: number, value: string) {
    if (!new RegExp(/^[0-7]+$/g).test(value)) throw new Error('No valid octal value provided!');
    this.setBase(index, value, 8);
  }

  /**
   * Converts the `Buffer` to an `Array`.
   *
   * @returns The `Buffer` as `Array`
   */
  toArray() {
    return [...this.buffer];
  }

  /**
   * Decodes the `Buffer` to an ASCII string.
   *
   * @returns ASCII string
   */
  toAscii() {
    return this.toString('ascii');
  }

  /**
   * Decodes the `Buffer` to a binary string.
   *
   * @returns Binary string
   */
  toBinary() {
    return this.toDecimal().toString(2);
  }

  /**
   * Decodes the `Buffer` to a decimal number.
   *
   * @returns Decimal number
   */
  toDecimal() {
    return parseInt(this.toHex(), 16);
  }

  /**
   * Decodes the `Buffer` to a hex string.
   *
   * @returns Hex string
   */
  toHex() {
    return this.toString('hex');
  }

  /**
   * Returns a JSON representation of the `Buffer`.
   *
   * @returns JSON representation
   */
  toJSON() {
    return this.buffer.toJSON();
  }

  /**
   * Decodes the `Buffer` to an octal string.
   *
   * @returns Octal string
   */
  toOctal() {
    return this.toDecimal().toString(8);
  }

  /**
   * Decodes the `Buffer` to a string according to the specified character encoding inencoding.
   *
   * @param encoding - The character encoding to use.
   * @returns Decoded string
   */
  toString(encoding: BufferEncoding = this.encoding) {
    return this.buffer.toString(encoding);
  }

  /**
   * Decodes the `Buffer` to an UTF-8 string.
   *
   * @returns UTF-8 string
   */
  toUtf8() {
    return this.toString('utf-8');
  }

  /**
   * Converts the `Buffer` to a `Uint8Array`.
   *
   * @returns `Uint8Array` representation
   */
  toUint8Array() {
    return new Uint8Array(this.buffer);
  }

  /**
   * Converts the ´Buffer` to a `DataView`
   *
   * @param offset - The `Buffer` `offset`
   * @param length - The number of bytes
   * @returns `DataView` representation
   */
  toView(offset: number = 0, length: number = this.length) {
    return new DataView(this.buffer, offset, length);
  }

  /**
   * Writes the given `content` to the `Buffer` starting from `offset`.
   *
   * @param content - The `content` to write
   * @param offset - The `offset` in bytes
   * @returns The number of written bytes
   */
  write(content: string, offset: number = 0): number {
    const n = this.buffer.write(content, offset, this.encoding);
    this.index = offset + n;
    return n;
  }

  /**
   * Writes the `Buffer` content to the current opened file. A `fd` must be set.
   *
   * @param cb - The callback when the file is written
   */
  writeToFile(cb?: (buffer: Bufferlo) => void): void {
    if (!this.fd) throw new Error('No file descriptor set!');
    fs.writeFile(this.fd, this.buffer, { encoding: this.encoding }, (err: Error) => {
      if (err) throw err;
      if (typeof cb === 'function') cb(this);
    });
  }

  /**
   * Writes the `Buffer` content to the current opened file synchronously. A `fd` must be set.
   */
  writeToFileSync(): void {
    if (!this.fd) throw new Error('No file descriptor set!');
    fs.writeFileSync(this.fd, this.buffer, { encoding: this.encoding });
  }
}
