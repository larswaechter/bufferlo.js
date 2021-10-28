# bufferlo.js

A TypeScript library for the Node Buffer class.

[![NPM](https://nodei.co/npm/bufferlo.js.png)](https://nodei.co/npm/bufferlo.js/)

## Introduction

bufferlo.js is TypeScript library that simplifies the work with Node's [Buffer](https://nodejs.org/api/buffer.html) class. The library uses a Buffer instance under the hood and offers different methods to interact with this buffer.

## 💻 Installation

Install via npm or yarn:

```bash
npm i --save bufferlo.js
```

## 🔨 Usage

```js
// ES6: import Bufferlo from 'bufferlo.js';
const Bufferlo = require('bufferlo.js');

const bf = new Bufferlo();
bf.allocBytes(3);

bf.append('a');
bf.append('b');
bf.available(); // 1 byte

bf.write('xyz');
bf.available(); // 0 bytes

bf.extend(5);
bf.length; // 8 bytes
bf.available(); // 5 bytes
```

## 📚 Documentation

You can find the complete documentation including all available methods [here]().

## :octocat: Contributing

See [CONTRIBUTING.md]()

## 🔑 License

[MIT]()
