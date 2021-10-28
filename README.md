# bufferlo.js

A TypeScript library for the Node Buffer class.

[![NPM](https://nodei.co/npm/bufferlo.js.png)](https://nodei.co/npm/bufferlo.js/)

![Tests](https://github.com/larswaechter/bufferlo.js/actions/workflows/tests.yaml/badge.svg)

## Introduction

bufferlo.js is TypeScript library that simplifies the work with Node's [Buffer](https://nodejs.org/api/buffer.html) class. It uses a Buffer instance under the hood and provides different methods to interact with this buffer.

## 💻 Installation

Install via npm or yarn:

```bash
npm i --save bufferlo.js
```

## 🔨 Usage

How to import bufferlo.js and how to use it. You can find all methods in the [docs]().

```js
// ES6: import Bufferlo from 'bufferlo.js';
const Bufferlo = require('bufferlo.js');

const bf = new Bufferlo();
bf.allocBytes(3);

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

You can find the complete documentation including all available methods [here]().

## :octocat: Contributing

See [CONTRIBUTING.md]()

## 🔑 License

[MIT]()
