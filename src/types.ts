export type Messenger = Window | Worker | MessagePort | BroadcastChannel | IChannel

type Type = 'response' | 'event' | 'error'

export interface IChannel {
  onmessage?: (e: any) => void
  postMessage(message: any): void
  addEventListener(type: 'message', listener: (e: any) => void): void
  removeEventListener(type: 'message', listener: (e: any) => void): void
}

export type RequestMessage = {
  id: string
  senderId?: string
  type: 'request' | 'subscription'
  name: string
  body: any
}

export type ResponseMessage = {
  id: string
  receiverId?: string
  senderId?: string
  type?: Type
  name?: string
  body: any
}

export type Responder = {
  send: (body?: any) => void
}

export interface IReceiver {
  connect(dispatcher: Messenger, onDisconnect?: () => void): void
  disconnect(): void
  onRequest(event: string, handler: (req: RequestMessage, res: Responder) => void): void
  onSubscribe(event: string, handler: (req: RequestMessage, res: Responder) => void): void
  onUnsubscribe(event: string, handler: (req: RequestMessage, res: Responder) => void): void
  removeHandler(name: string | RegExp, type?: 'request' | 'subscription'): void
  removeAllHandlers(match?: string | RegExp): void
}


export interface ISender {
  setOptions: (options: any) => void
  postRequest: (name: string, body?: any) => Promise<any>
  // Function signature for the first variation
  subscribe(event: string, handler: any): () => void
  subscribe(event: string, options: { [key: string]: any }, handler: any): () => void
  // Function signature for the second variation
  connect: (
    dispatcher: Messenger,
    receiver?: Messenger
  ) => void
  disconnect: () => void
}

