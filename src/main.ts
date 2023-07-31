import { createReceiver } from './receiver'
import { createSender } from './sender'
/* eslint-disable @typescript-eslint/ban-ts-comment */

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

// send request to receiver
const sender = createSender()
sender.connect(window)

sender.postRequest('ping', 'Hello from sender!').then(response => {
  console.log('pong', response)
})

sender.subscribe('foo', (val: string) => console.log('foo changed:', val))