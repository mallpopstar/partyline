import { ISender, Messenger } from "./types"
interface SenderOptions {
  timeout?: number
}

class Sender implements ISender {
  #id = crypto.randomUUID()
  #messenger?: Messenger
  #timer: any = null
  #batchedRequests: any = []
  #promises: Map<string, any> = new Map()
  #eventHandlers: Map<string, any> = new Map()
  #receiver?: Messenger
  #options: SenderOptions = {
    timeout: 10000,
  }

  #messageHandler = (e: any) => {
    const { id, type } = e.data
    if (!id || !type) return // its possible the message was from the same sender or
    const promise = this.#promises.get(id)
    if (promise) {
      promise.timer && clearTimeout(promise.timer)
      this.#promises.delete(id)
      if (type === 'error') {
        promise.reject(e.data)
      } else {
        promise.resolve(e.data)
      }
    } else {
      const handler = this.#eventHandlers.get(id)
      if (handler) {
        handler(e.data)
      }
    }
  }

  #postMessage(message: any) {
    const origin: any = this.#messenger === self.parent || this.#messenger === self.opener ? '*' : undefined
    this.#messenger?.postMessage(message, origin)
  }

  setOptions(options: SenderOptions) {
    this.#options = { ...this.#options, ...options }
  }

  #convertToObject(value: any) {
    return JSON.parse(JSON.stringify(value))
  }

  #createTimeoutPromise<T>(id: string, name: string, timeout = 10000): Promise<T> {
    timeout = this.#options.timeout || timeout
    if (timeout) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          const promise = this.#promises.get(id)
          this.#promises.delete(id)
          reject(new Error('timeout on ' + promise.name))
        }, timeout)
        this.#promises.set(id, { name, timer, resolve, reject })
      })
    }
    return new Promise((resolve, reject) => {
      this.#promises.set(id, { name, resolve, reject })
    })
  }

  #batch(params: { id: string; senderId: string; type: string; name: string; body?: any }) {
    this.#batchedRequests.push(params)
    clearTimeout(this.#timer)
    // if batch is full, send it max is 10
    if (this.#batchedRequests.length >= 10) {
      this.#postMessage({ batch: this.#convertToObject(this.#batchedRequests) })
      this.#batchedRequests.length = 0
      return
    }
    this.#timer = setTimeout(() => {
      try {
        this.#postMessage({ batch: this.#convertToObject(this.#batchedRequests) })
      } catch (e: any) {
        if (import.meta.env.DEV) {
          console.error(e.message)
        }
      }
      this.#batchedRequests.length = 0
    }, 1)
  }

  async postRequest<T = any>(name = '', body?: any) {
    if(!this.#messenger) throw new Error('sender not connected')
    const id = crypto.randomUUID()
    const type = 'request'
    const senderId = this.#id
    this.#batch({ id, senderId, type, name, body })
    return this.#createTimeoutPromise<T>(id, name)
  }

  subscribe(event: string, ...args: any[]) {
    if(!this.#messenger) throw new Error('sender not connected')
    let handler: any
    let options: any
    if (args[0] instanceof Function) {
      handler = args[0]
    } else if (args[1] instanceof Function) {
      options = args[0]
      handler = args[1]
    }

    const id = crypto.randomUUID()
    const type = 'subscription'
    const senderId = this.#id
    this.#eventHandlers.set(id, handler)
    this.#batch({ id, senderId, type, name: event + ':subscribe', body: options || undefined })
    return () => {
      this.#eventHandlers.delete(id)
      setTimeout(() => {
        this.#postMessage({ id, senderId, type, name: event + ':unsubscribe', body: options || undefined })
      }, 0)
    }
  }

  connect(
    dispatcher: Messenger,
    receiver?: Messenger
  ) {
    if (!receiver) {
      receiver = dispatcher
    }

    if (receiver instanceof MessagePort) {
      receiver.onmessage = this.#messageHandler
    } else {
      receiver.addEventListener('message', this.#messageHandler)
    }

    this.#receiver = receiver
    this.#messenger = dispatcher
    return new Promise(resolve => setTimeout(resolve, 0))
  }

  disconnect() {
    if (!this.#messenger) return
    // loop through all promises and reject them
    this.#postMessage({ id: this.#id, type: 'request', name: 'disconnect' })
    this.#eventHandlers.clear()
    this.#promises.clear()
    this.#receiver?.removeEventListener('message', this.#messageHandler)
    this.#messenger = undefined
  }
}

export const createSender = (): ISender => {
  return new Sender()
}
