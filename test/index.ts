import 'mocha';
import assert from 'assert';

import Bufferlo from '../dist/index';

describe('bufferlo.js', () => {
  it('Empty initialization', () => {
    const bf = new Bufferlo();
    assert.equal(bf.isBuffer(), false);
    assert.equal(bf.encoding, 'utf-8');
    assert.equal(bf.index, 0);
    assert.equal(bf.fd, 0);
  });

  it('Buffer allocation', () => {
    let bf = new Bufferlo();
    bf.allocBytes(1);
    assert.equal(bf.length, 1);
    assert.equal(bf.byteLength, 1);
    assert.equal(bf.index, 0);

    bf = new Bufferlo();
    bf.allocBytesUnsafe(1);
    assert.equal(bf.length, 1);
    assert.equal(bf.byteLength, 1);
    assert.equal(bf.index, 0);

    bf = new Bufferlo();
    bf.allocKiloBytes(1);
    assert.equal(bf.length, 1024);
    assert.equal(bf.byteLength, 1024);
    assert.equal(bf.index, 0);

    bf = new Bufferlo();
    bf.allocKiloBytesUnsafe(1);
    assert.equal(bf.length, 1024);
    assert.equal(bf.byteLength, 1024);
    assert.equal(bf.index, 0);

    bf = new Bufferlo();
    bf.allocMegaBytes(1);
    assert.equal(bf.length, 1048576);
    assert.equal(bf.byteLength, 1048576);
    assert.equal(bf.index, 0);

    bf = new Bufferlo();
    bf.allocMegaBytesUnsafe(1);
    assert.equal(bf.length, 1048576);
    assert.equal(bf.byteLength, 1048576);
    assert.equal(bf.index, 0);
  });

  it('append', () => {
    const bf = new Bufferlo();
    bf.allocBytes(3);
    bf.append('a');
    bf.append('b');
    bf.append('c');
    assert.equal(bf.index, 3);
    assert.throws(() => bf.append('d'));
  });

  it('available', () => {
    const bf = new Bufferlo();
    assert.equal(bf.available(), 0);
    bf.allocBytes(4);
    assert.equal(bf.available(), 4);
    bf.append('a');
    assert.equal(bf.available(), 3);
  });

  it('at', () => {
    const bf = new Bufferlo();
    bf.allocBytes(3);
    bf.append('a');
    bf.append('b');
    bf.append('c');
    assert.equal(bf.at(0), 97);
    assert.equal(bf.at(1), 98);
    assert.equal(bf.at(2), 99);
  });

  it('clone', () => {
    const bf1 = new Bufferlo();
    bf1.allocBytes(3);
    bf1.append('a');
    bf1.append('b');

    const bf2 = bf1.clone();
    assert(bf1.equals(bf2));
    assert.equal(bf1.encoding, bf2.encoding);
    assert.equal(bf1.index, bf2.index);
  });

  it('closeFile', () => {
    const bf = new Bufferlo();
    bf.openFile(__dirname + '/dummy.txt');
    assert(bf.fd > 0);
    bf.closeFile();
    assert(bf.fd === 0);
  });

  it('compare', () => {
    const bf1 = new Bufferlo();
    bf1.allocBytes(1);
    bf1.append('a');

    const bf2 = new Bufferlo();
    bf2.allocBytes(1);
    bf2.append('a');
    assert(bf1.compare(bf2) === 0);

    const bf3 = new Bufferlo();
    bf3.allocBytes(1);
    bf3.append('b');
    assert(bf1.compare(bf3) === -1);

    const bf4 = new Bufferlo();
    bf4.allocBytes(1);
    bf4.append('c');
    assert(bf4.compare(bf1) === 1);
  });

  it('concat', () => {
    const bf1 = new Bufferlo();
    bf1.allocBytes(1);
    bf1.append('a');

    const bf2 = new Bufferlo();
    bf2.allocBytes(1);
    bf2.append('b');

    const bf3 = new Bufferlo();
    bf3.allocBytes(1);
    bf3.append('c');
    bf1.concat(bf2, bf3);

    assert.equal(bf1.length, 3);
    assert.equal(bf1.at(0), 97);
    assert.equal(bf1.at(1), 98);
    assert.equal(bf1.at(2), 99);
  });

  it('copy', () => {
    const bf1 = new Bufferlo();
    bf1.allocBytes(4);
    bf1.append('a');
    bf1.append('b');
    bf1.append('c');
    bf1.append('d');

    let bf2 = new Bufferlo();
    bf2.allocBytes(4);
    bf1.copy(bf2);
    assert.equal(bf2.at(0), 97);
    assert.equal(bf2.at(1), 98);
    assert.equal(bf2.at(2), 99);
    assert.equal(bf2.at(3), 100);

    bf2 = new Bufferlo();
    bf2.allocBytes(4);
    bf1.copy(bf2, 1, 2, 4);
    assert.equal(bf2.at(0), 0);
    assert.equal(bf2.at(1), 99);
    assert.equal(bf2.at(2), 100);
    assert.equal(bf2.at(3), 0);
  });

  it('copyToIndex', () => {
    const bf1 = new Bufferlo();
    bf1.allocBytes(3);
    bf1.append('a');
    bf1.append('b');
    bf1.append('c');

    const bf2 = new Bufferlo();
    bf2.allocBytes(3);
    bf2.index = 1;
    bf1.copyToIndex(bf2, 0, 2);
    assert.equal(bf2.at(0), 0);
    assert.equal(bf2.at(1), 97);
    assert.equal(bf2.at(2), 98);
  });

  it('extend', () => {
    const bf = new Bufferlo();
    bf.allocBytes(4);
    bf.append('a');
    bf.append('b');
    bf.extend(12);
    assert.equal(bf.length, 16);
    assert.equal(bf.at(0), 97);
    assert.equal(bf.at(1), 98);
  });

  it('extend', () => {
    const bf1 = new Bufferlo();
    bf1.allocBytes(1);
    bf1.append('a');

    const bf2 = new Bufferlo();
    bf2.allocBytes(1);
    bf2.append('a');

    const bf3 = new Bufferlo();
    bf3.allocBytes(1);
    bf3.append('b');

    assert(bf1.equals(bf2));
    assert(!bf1.equals(bf3));
  });

  it('fit', () => {
    const bf = new Bufferlo();
    bf.allocBytes(1);
    assert(bf.fit('a'));
    assert(!bf.fit('ab'));
  });
});
