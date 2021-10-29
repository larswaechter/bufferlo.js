import Bufferlo from '.';

const bu = new Bufferlo();
bu.fromHex('abcd');
console.log(bu);
console.log(bu.at(0));

console.log(Buffer.from('abc', 'hex'));

/*
const bu = new Bufferlo();
bu.fromUtf8('a');
console.log(bu.toJSON());
bu.setOctal(0, '142');
console.log(bu.toJSON());
*/

/*
console.log(bu.buffer.readInt8());
console.log(bu.toDecimal());
console.log(bu.toHex());
console.log(bu.toAscii());
console.log(bu.toBinary());
*/

/*
const a = Buffer.from([255, 254]);
console.log(a, a.toString(), a[0]);

const b = new Uint32Array([2, 4, 8]);
console.log(b, b.length, b.byteLength);
*/

/*
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
*/
