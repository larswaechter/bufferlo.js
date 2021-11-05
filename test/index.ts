import 'mocha';
import assert from 'assert';
import { unlinkSync, writeFileSync } from 'fs';

import Bufferlo from '../dist/index';

describe('bufferlo.js', () => {
  it('decimalTo', () => {
    assert.strictEqual(Bufferlo.decimalTo(13, 'binary'), '1101');
    assert.strictEqual(Bufferlo.decimalTo(384, 'octal'), '600');
    assert.strictEqual(Bufferlo.decimalTo(541, 'hex'), '21d');
  });

  it('binaryTo', () => {
    assert.strictEqual(Bufferlo.binaryTo('10101001', 'octal'), '251');
    assert.strictEqual(Bufferlo.binaryTo('1010010', 'decimal'), 82);
    assert.strictEqual(Bufferlo.binaryTo('1000111101', 'hex'), '23d');
  });

  it('hexTo', () => {
    assert.strictEqual(Bufferlo.hexTo('efd', 'binary'), '111011111101');
    assert.strictEqual(Bufferlo.hexTo('9a', 'decimal'), 154);
    assert.strictEqual(Bufferlo.hexTo('c5', 'octal'), '305');
  });

  it('octalTo', () => {
    assert.strictEqual(Bufferlo.octalTo('41', 'binary'), '100001');
    assert.strictEqual(Bufferlo.octalTo('331', 'decimal'), 217);
    assert.strictEqual(Bufferlo.octalTo('5412', 'hex'), 'b0a');
  });

  it('Empty initialization', () => {
    const bf = new Bufferlo();
    assert.strictEqual(bf.isBuffer(), false);
    assert.strictEqual(bf.encoding, 'utf-8');
    assert.strictEqual(bf.length, 0);
    assert.strictEqual(bf.index, 0);
    assert.strictEqual(bf.fd, 0);
  });

  it('Non empty initialization', () => {
    const bf = new Bufferlo('abc');
    assert.strictEqual(bf.isBuffer(), true);
    assert.strictEqual(bf.encoding, 'utf-8');
    assert.strictEqual(bf.length, 3);
    assert.strictEqual(bf.index, 3);
    assert.strictEqual(bf.fd, 0);
  });

  it('Buffer allocation', () => {
    let bf = new Bufferlo();
    bf.alloc(1);
    assert.strictEqual(bf.length, 1);
    assert.strictEqual(bf.byteLength, 1);
    assert.strictEqual(bf.index, 0);

    bf = new Bufferlo();
    bf.allocUnsafe(1);
    assert.strictEqual(bf.length, 1);
    assert.strictEqual(bf.byteLength, 1);
    assert.strictEqual(bf.index, 0);

    bf = new Bufferlo();
    bf.allocKiloBytes(1);
    assert.strictEqual(bf.length, 1024);
    assert.strictEqual(bf.byteLength, 1024);
    assert.strictEqual(bf.index, 0);

    bf = new Bufferlo();
    bf.allocKiloBytesUnsafe(1);
    assert.strictEqual(bf.length, 1024);
    assert.strictEqual(bf.byteLength, 1024);
    assert.strictEqual(bf.index, 0);

    bf = new Bufferlo();
    bf.allocMegaBytes(1);
    assert.strictEqual(bf.length, 1048576);
    assert.strictEqual(bf.byteLength, 1048576);
    assert.strictEqual(bf.index, 0);

    bf = new Bufferlo();
    bf.allocMegaBytesUnsafe(1);
    assert.strictEqual(bf.length, 1048576);
    assert.strictEqual(bf.byteLength, 1048576);
    assert.strictEqual(bf.index, 0);
  });

  it('ofArray', () => {
    const bf = Bufferlo.ofArray([97, 98, 99]);
    assert.strictEqual(bf.isBuffer(), true);
    assert.strictEqual(bf.encoding, 'utf-8');
    assert.strictEqual(bf.length, 3);
    assert.strictEqual(bf.index, 3);
  });

  it('ofArrayBuffer', () => {
    const bf = Bufferlo.ofArrayBuffer(new Uint8Array([97, 98, 99]));
    assert.strictEqual(bf.isBuffer(), true);
    assert.strictEqual(bf.encoding, 'utf-8');
    assert.strictEqual(bf.length, 3);
    assert.strictEqual(bf.index, 3);
  });

  it('append', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.append('a');
    bf.append('b');
    bf.append('c');
    assert.strictEqual(bf.index, 3);
    assert.throws(() => bf.append('d'));
  });

  it('available', () => {
    const bf = new Bufferlo();
    assert.strictEqual(bf.available(), 0);
    bf.alloc(4);
    assert.strictEqual(bf.available(), 4);
    bf.append('a');
    assert.strictEqual(bf.available(), 3);
  });

  it('at', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.append('a');
    bf.append('b');
    bf.append('c');
    assert.strictEqual(bf.at(0), 97);
    assert.strictEqual(bf.at(1), 98);
    assert.strictEqual(bf.at(2), 99);
    assert.strictEqual(bf.at(-1), 99);
    assert.strictEqual(bf.at(-2), 98);
    assert.strictEqual(bf.at(-3), 97);
    assert.strictEqual(bf.at(0, 'binary'), '1100001');
    assert.strictEqual(bf.at(1, 'octal'), '142');
    assert.strictEqual(bf.at(2, 'hex'), '63');
  });

  it('clone', () => {
    const bf1 = new Bufferlo();
    bf1.fd = 1;
    bf1.alloc(3);
    bf1.append('a');
    bf1.append('b');

    const bf2 = bf1.clone();
    assert.notStrictEqual(bf1.fd, bf2.fd);
    assert(bf1.equals(bf2));
    assert.strictEqual(bf1.encoding, bf2.encoding);
    assert.strictEqual(bf1.index, bf2.index);
  });

  it('closeFile & openFile', () => {
    const bf = new Bufferlo();
    bf.openFile(__dirname + '/tmp.txt');
    assert(bf.fd > 0);
    bf.closeFile();
    assert.equal(bf.fd, 0);
  });

  it('compare', () => {
    const bf1 = new Bufferlo();
    bf1.alloc(1);
    bf1.append('a');

    const bf2 = new Bufferlo();
    bf2.alloc(1);
    bf2.append('a');
    assert(bf1.compare(bf2) === 0);

    const bf3 = new Bufferlo();
    bf3.alloc(1);
    bf3.append('b');
    assert(bf1.compare(bf3) === -1);

    const bf4 = new Bufferlo();
    bf4.alloc(1);
    bf4.append('c');
    assert(bf4.compare(bf1) === 1);
  });

  it('concat', () => {
    const bf1 = new Bufferlo();
    bf1.alloc(1);
    bf1.append('a');

    const bf2 = new Bufferlo();
    bf2.alloc(1);
    bf2.append('b');

    const bf3 = new Bufferlo();
    bf3.alloc(1);
    bf3.append('c');
    bf1.concat(bf2, bf3);

    assert.strictEqual(bf1.length, 3);
    assert.strictEqual(bf1.at(0), 97);
    assert.strictEqual(bf1.at(1), 98);
    assert.strictEqual(bf1.at(2), 99);
  });

  it('copy', () => {
    const bf1 = new Bufferlo();
    bf1.alloc(4);
    bf1.append('a');
    bf1.append('b');
    bf1.append('c');
    bf1.append('d');

    let bf2 = new Bufferlo();
    bf2.alloc(4);
    bf1.copy(bf2);

    bf1.set(0, 101);
    assert.notStrictEqual(bf1.at(0), bf2.at(0));
    assert.strictEqual(bf1.at(1), bf2.at(1));
    assert.strictEqual(bf1.at(2), bf2.at(2));
    assert.strictEqual(bf1.at(3), bf2.at(3));

    bf2 = new Bufferlo();
    bf2.alloc(4);
    bf1.copy(bf2, 1, 2, 4);
    assert.strictEqual(bf2.at(0), 0);
    assert.strictEqual(bf2.at(1), 99);
    assert.strictEqual(bf2.at(2), 100);
    assert.strictEqual(bf2.at(3), 0);
  });

  it('copyToIndex', () => {
    const bf1 = new Bufferlo();
    bf1.alloc(3);
    bf1.append('a');
    bf1.append('b');
    bf1.append('c');

    const bf2 = new Bufferlo();
    bf2.alloc(3);
    bf2.index = 1;
    bf1.copyToIndex(bf2, 0, 2);
    assert.strictEqual(bf2.at(0), 0);
    assert.strictEqual(bf2.at(1), 97);
    assert.strictEqual(bf2.at(2), 98);
  });

  it('extend', () => {
    const bf = new Bufferlo();
    bf.alloc(4);
    bf.append('a');
    bf.append('b');
    bf.extend(12);
    assert.strictEqual(bf.length, 16);
    assert.strictEqual(bf.at(0), 97);
    assert.strictEqual(bf.at(1), 98);
  });

  it('equals', () => {
    const bf1 = new Bufferlo();
    bf1.alloc(1);
    bf1.append('a');

    const bf2 = new Bufferlo();
    bf2.alloc(1);
    bf2.append('a');

    const bf3 = new Bufferlo();
    bf3.alloc(1);
    bf3.append('b');

    assert(bf1.equals(bf2));
    assert(!bf1.equals(bf3));
  });

  it('fit', () => {
    const bf = new Bufferlo();
    bf.alloc(1);
    assert(bf.fit('a'));
    assert(!bf.fit('ab'));
  });

  it('fromFile', () => {
    const bf = new Bufferlo();
    bf.openFile(__dirname + '/tmp.txt');
    bf.fromFile((_bf) => {
      assert.equal(_bf.length, 3);
      assert.equal(_bf.index, 3);
      assert.equal(_bf.at(0), 97);
      assert.equal(_bf.at(1), 98);
      assert.equal(_bf.at(2), 99);
      _bf.closeFile();
    });
  });

  it('fromFileSync', () => {
    const bf = new Bufferlo();
    bf.openFile(__dirname + '/tmp.txt');
    bf.fromFileSync();
    assert.equal(bf.length, 3);
    assert.equal(bf.index, 3);
    assert.equal(bf.at(0), 97);
    assert.equal(bf.at(1), 98);
    assert.equal(bf.at(2), 99);
    bf.closeFile();
  });

  it('fromHex', () => {
    const bf = new Bufferlo();
    bf.fromHex('616263');
    assert.equal(bf.length, 3);
    assert.equal(bf.index, 3);
    assert.equal(bf.toString(), '616263');
  });

  it('isBuffer', () => {
    const bf = new Bufferlo();
    assert(!bf.isBuffer());
    bf.alloc(1);
    assert(bf.isBuffer());
  });

  it('isEmpty', () => {
    const bf = new Bufferlo();
    bf.alloc(1);
    assert(bf.isEmpty());
    bf.write('a');
    assert(!bf.isEmpty());
  });

  it('isFull', () => {
    const bf = new Bufferlo();
    bf.alloc(1);
    assert(!bf.isFull());
    bf.write('a');
    assert(bf.isFull());
  });

  it('moveIndex', () => {
    const bf = new Bufferlo();
    bf.alloc(5);
    bf.write('a');

    bf.moveIndex('center');
    assert.equal(bf.index, 2);
    bf.moveIndex('end');
    assert.equal(bf.index, bf.length - 1);
    bf.moveIndex('empty');
    assert.equal(bf.index, 1);
    bf.moveIndex('start');
    assert.equal(bf.index, 0);
  });

  it('set', () => {
    const bf = new Bufferlo();
    bf.alloc(1);

    bf.set(0, 97);
    assert.strictEqual(bf.at(0), 97);

    bf.setBinary(0, '1010');
    assert.strictEqual(bf.at(0), 10);
    assert.throws(() => bf.setBinary(0, '1012'));

    bf.setChar(0, 'a');
    assert.strictEqual(bf.at(0), 97);

    bf.setHex(0, 'ff');
    assert.strictEqual(bf.at(0), 255);
    assert.throws(() => bf.setHex(0, 'defg'));

    bf.setOctal(0, '27');
    assert.strictEqual(bf.at(0), 23);
    assert.throws(() => bf.setOctal(0, '142801'));
  });

  it('toArray', () => {
    const bf = new Bufferlo();
    bf.alloc(4);
    bf.write('abcd');

    const arr = bf.toArray();
    assert.equal(arr.length, 4);
    assert.strictEqual(arr[0], 97);
    assert.strictEqual(arr[1], 98);
    assert.strictEqual(arr[2], 99);
    assert.strictEqual(arr[3], 100);
  });

  it('toAscii', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.write('abc');
    assert.equal(bf.toAscii(), 'abc');
  });

  it('toBinary', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.write('abc');
    assert.equal(bf.toBinary(), '110000111000101100011');
  });

  it('toDecimal', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.write('abc');
    assert.equal(bf.toDecimal(), '97 98 99');
  });

  it('toHex', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.write('abc');
    assert.equal(bf.toHex(), '616263');
  });

  it('toJSON', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.write('abc');

    const json = bf.toJSON();
    assert.strictEqual(json.data[0], 97);
    assert.strictEqual(json.data[1], 98);
    assert.strictEqual(json.data[2], 99);
  });

  it('toOctal', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.write('abc');
    assert.equal(bf.toOctal(), '141142143');
  });

  it('toUtf8', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.write('abc');
    assert.equal(bf.toUtf8(), 'abc');
  });

  it('toUint8Array', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.write('abc');

    const arr = bf.toUint8Array();
    assert.equal(arr.length, 3);
    assert.equal(arr.byteLength, 3);
    assert.equal(arr[0], 97);
    assert.equal(arr[1], 98);
    assert.equal(arr[2], 99);
  });

  it('toView', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.write('abc');

    let view = bf.toView();
    assert.equal(view.byteLength, 3);
    assert.equal(view.getInt8(0), 97);
    assert.equal(view.getInt8(1), 98);
    assert.equal(view.getInt8(2), 99);

    view = bf.toView(1, 2);
    assert.equal(view.byteLength, 1);
    assert.equal(view.getInt8(0), 98);
  });

  it('writeToFile', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.write('xyz');

    const file = __dirname + '/tmp_a.txt';
    writeFileSync(file, 'abc', 'utf-8');

    bf.openFile(file);
    bf.writeToFile((_bf) => {
      assert.equal(_bf.at(0), 120);
      assert.equal(_bf.at(1), 121);
      assert.equal(_bf.at(2), 122);

      _bf.closeFile();

      unlinkSync(file);
    });
  });

  it('writeToFileSync', () => {
    const bf = new Bufferlo();
    bf.alloc(3);
    bf.write('xyz');

    const file = __dirname + '/tmp_b.txt';
    writeFileSync(file, 'abc', 'utf-8');

    bf.openFile(file);
    bf.writeToFileSync();
    bf.closeFile();

    assert.equal(bf.at(0), 120);
    assert.equal(bf.at(1), 121);
    assert.equal(bf.at(2), 122);

    unlinkSync(file);
  });
});
