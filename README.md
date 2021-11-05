# bufferlo.js

A TypeScript library built for the Node Buffer class.

[![NPM](https://nodei.co/npm/bufferlo.js.png)](https://nodei.co/npm/bufferlo.js/)

![Tests](https://github.com/larswaechter/bufferlo.js/actions/workflows/tests.yaml/badge.svg)
![Linter](https://github.com/larswaechter/bufferlo.js/actions/workflows/linter.yaml/badge.svg)

## Introduction

bufferlo.js is TypeScript library that simplifies the work with Node's [Buffer](https://nodejs.org/api/buffer.html) class. It uses a `Buffer` instance under the hood and provides multiple methods to interact with this buffer.

What is a Buffer? ([Source](https://nodejs.org/en/knowledge/advanced/buffers/how-to-use-buffers/))

> The `Buffer` class in Node.js is designed to handle raw binary data. Each buffer corresponds to some raw memory allocated outside V8. Buffers act somewhat like arrays of integers, but aren't resizable and have a whole bunch of methods specifically for binary data. The integers in a buffer each represent a byte and so are limited to values from 0 to 255 inclusive.

## 💻 Installation

Install via npm:

```bash
npm i --save bufferlo.js
```

## 🔨 Usage

How to import bufferlo.js and how to use it. You can find all methods in the [docs](https://larswaechter.github.io/bufferlo.js/).

```js
// ES6: import Bufferlo from 'bufferlo.js';
const Bufferlo = require('bufferlo.js');

const bf = new Bufferlo();
bf.alloc(3);

bf.append('a');
bf.append('b');
bf.available(); // 1 byte

bf.write('xyz');
bf.fit('a'); // false
bf.available(); // 0 bytes

bf.extend(5);
bf.length; // 8 bytes
bf.available(); // 5 bytes

bf.openFile('./dummy.txt');
bf.writeToFileSync(); // writes 'xyz' to dummy.txt
```

## 📚 Documentation

You can find the complete documentation including all available methods [here](https://larswaechter.github.io/bufferlo.js/).

## 🧩 Contributing

See [CONTRIBUTING.md](https://github.com/larswaechter/bufferlo.js/blob/master/CONTRIBUTING.md)

## 🔑 License

bufferlo.js is released under [MIT](https://github.com/larswaechter/bufferlo.js/blob/master/LICENSE) license.
