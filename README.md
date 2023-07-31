# Partyline ☎️

Partyline is a JavaScript library that can send messages between APIs that support `postMessage`. It is designed to allow you to create your own APIs that can communicate with each other, even if they are loaded from different origins.

## Features

- Send messages from APIs that support `postMessage` to any other API that supports `postMessage`, including:
  - `window`
  - `iframe`
  - `web worker`
  - `MessageChannel`
  - `BroadcastChannel`
- Sending requests and responses
- Subscribing to events
- Easy to use API
- Register your own request handlers
- Ability to add your own custom transports
- Written in TypeScript
- Tree-shakes unused library code

## Installation

```bash
npm install @mallpopstar/partyline
```

## Running the examples in this repo

Clone the repo and run the following commands:

```bash
npm install
npm run dev
```
Open the link indicated in your console. Open your console in the browser to see the logs.

## Basic usage

```js
import { createReceiver, createSender } from '@mallpopstar/partyline'

// receiving a message
const receiver = createReceiver()
receiver.connect(window)

receiver.onRequest('ping', (req, res) => {
  console.log('ping', req)
  res.send('Hello from receiver!')
})

receiver.onSubscribe('foo', (req, res) => {
  console.log('foo', req)
  res.send('response subscription')
})

// post request to receiver
const sender = createSender()
sender.connect(window)

sender.postRequest('ping', 'Hello from sender!').then(res => {
  console.log('pong', res)
})

sender.subscribe('foo', (val: string) => console.log('foo changed:', val))
```

### Using `iframe`

**From the parent window**

```ts
import { createReceiver } from '@mallpopstar/partyline'

const receiver = createReceiver()
receiver.connect(iframe.contentWindow)

receiver.onRequest('ping', (req, res) => {
  console.log('ping', req)
  res.send('pong')
})
```

**From the child window (iframe)**

```ts
import { createSender } from '@mallpopstar/partyline'

const sender = createSender()
sender.connect(window.parent)

sender.postRequest('ping', { message: 'Hello from sender!' }).then(res => {
  console.log('pong', res)
})
```

### Using `web worker`

**From the main thread**

```ts
import { createReceiver, loadWorker } from '@mallpopstar/partyline'

const receiver = createReceiver()
const messageChannel = new MessageChannel()

receiver.onRequest('ping', (req, res) => {
  console.log('ping', req)
  res.send('pong')
})

// loadWorker is a special function that will load the worker cross-origin
const worker = loadWorker('worker.js')
receiver.connect(worker)
```

**From the worker**

```ts
import { createSender } from '@mallpopstar/partyline'

const sender = createSender()

sender.connect(self)
sender.postRequest('ping', { message: 'Hello from sender!' }).then(res => {
  console.log('pong', res)
})
```

### Using `BroadcastChannel`

**From first website**

```ts
import { createReceiver } from '@mallpopstar/partyline'

const receiver = createReceiver()
const channel = new BroadcastChannel('my-channel')

receiver.onRequest('ping', (req, res) => {
  console.log('ping', req)
  res.send('pong')
})

receiver.connect(channel)
```

**From second website**

```ts
import { createSender } from '@mallpopstar/partyline'

const sender = createSender()
const channel = new BroadcastChannel('my-channel')

sender.connect(channel)
sender.postRequest('ping', { message: 'Hello from sender!' }).then(res => {
  console.log('pong', res)
})
```

### Using `MessageChannel`

**From receiving port**

```ts
import { createReceiver } from '@mallpopstar/partyline'

const receiver = createReceiver()
const channel = new MessageChannel()

receiver.onRequest('ping', (req, res) => {
  console.log('ping', req)
  res.send('pong')
})

receiver.connect(channel.port1)
```

**From sending port**

```ts
import { createSender } from '@mallpopstar/partyline'

const sender = createSender()
const channel = new MessageChannel()

sender.connect(channel.port2)
sender.postRequest('ping', { message: 'Hello from sender!' }).then(res => {
  console.log('pong', res)
})
```

### Sender options

By default the sender will timeout a request after 10 seconds. You can change this by passing in a `timeout` option:

```ts
import { createSender } from '@mallpopstar/partyline'

const sender = createSender()
// if you pass in 0, it will never timeout
sender.setOptions({ timeout: 1000 })
```

## Subscribing to events

If you want to subscribe to events, you can use the `subscribe` request method. This will send a request to the receiver and then the receiver use this to send back responses subscribers. 

```ts
import { createReceiver, createSender } from '@mallpopstar/partyline'

const receiver = createReceiver()
const sender = createSender()
const subscribers = new Map<string, any>()

let count = 0
receiver.onSubscribe('count', (req, res) => {
  console.log('foo', req)
  subscribers.set(req.id, res)
  setInterval(() => {
    count++
    subscribers.forEach(res => res.send(count))
  }, 1000)
})

receiver.onUnsubscribe('count', req => {
  console.log('unsubscribed', req)
  subscribers.delete(req.id)
})

const unsubscribe = sender.subscribe('count', req => {
  console.log('count', req)
  if (req.body >= 3) {
    unsubscribe()
  }
})
```

## Using IChannel to create your own transports

If you want to create your own transport, you can use the `IChannel` interface provided in Partyline. This interface is used by the `createReceiver` and `createSender` methods to create the default transports. You can use this to create adapters for WebSockets, WebRTC, or other transports.

**Super simple example**

```ts
import { IChannel } from '@mallpopstar/partyline'

class MyChannel implements IChannel {
  #subscriptions: any[] = []

  onmessage?: (e: any) => void
  
  postMessage(message: any): void {
    this.#subscriptions.forEach(subscription => subscription(message))
  }
  addEventListener(_: 'message', listener: (e: any) => void): void {
    this.#subscriptions.push(listener)
  }
  removeEventListener(_: 'message', listener: (e: any) => void): void {
    this.#subscriptions = this.#subscriptions.filter(subscription => subscription !== listener)
  }
}
```

## Alternatives to Partyline

There are a few other libraries that do similar things to Partyline:

- https://github.com/krakenjs/zoid
- https://github.com/dollarshaveclub/postmate
- https://github.com/AshleyScirra/via.js

If you are looking for a library that can load 3rd-party js files and fill in the gaps, check out [Partytown 🎉](https://partytown.builder.io/).
