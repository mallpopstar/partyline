
# Partyline

An RPC for communicating between browser windows. Send messages between browser windows, tabs, iframes and web workers.

## Features

- Send messages from APIs that support `postMessage` to any other API that supports `postMessage`, including:
  - `window`
  - `iframe`
  - `web worker`
  - `MessageChannel`
  - `BroadcastChannel`
- Built-in support:
  - `web scraping`
  - `listening for HTTP, fetch and websocket requests`
  - `listening for DOM events and changes`
  - `listening for changes in the URL`
  - `listening for changes in storage`
    - `cookie`
    - `localStorage`
    - `sessionStorage`
  - `mutating the DOM`
- Support for all major frameworks:
  - `React`
  - `Angular`
  - `Vue`
  - `Svelte`
  - `Solid`
  - `Vanilla JS`
  - ...

## Installation

```sh
npm i @mallpopstar/partyline
```

## Example

If you would like to see how to use Partyline, check out my [Hello Kitty](https://github.com/mallpopstar/hellokitty) project.

You can also run a demo:

```sh
yarn dev
```

## Usage

> **Note:** I am still working on documentation and need to figure out how to create tests around this. Look at `main.ts` for now.


```js
import { Receiver, Sender } from '@mallpopstar/partyline'

// The receiver is the API that receives messages, performs actions and sends responses
const receiver = new Receiver()
r.connect(window)

// supports sync and async functions
r.on('ping', (requestId, message) => {
  console.log('ping', message)
  return 'Hello from receiver!'
})

// The sender is the API that sends messages and receives responses
const sender = new Sender()
s.connect(window)

s.send('ping', { message: 'Hello from sender!' }).then(response => {
  console.log('pong', response)
})
```