import { CONNECTION } from './consts/connection'
import { uuid } from './helpers/uuid'

export interface ISender {
  id: string
  sendRequest: (path: string, ...args: any[]) => Promise<any>
  subscribe: (event: string, selector: string | { [key: string]: string }, callback: any) => () => void
  connect: (port: MessagePort) => void
  disconnect: () => void
}

export class Sender implements ISender {
  id = uuid()
  /** @private */
  port?: MessagePort
  /** @private */
  batchTimer: any = null
  /** @private */
  batchMessages: any = []
  /** @private */
  promises: Map<string, any> = new Map()
  /** @private */
  eventHandlers: Map<string, any> = new Map()

  /** @private */
  preparePayload(data: any) {
    return JSON.parse(JSON.stringify(data))
  }

  /** @private */
  createTimeoutPromise<T>(id: string, path: string, timeout: number = 10000): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const promise = this.promises.get(id)
        this.promises.delete(id)
        reject(new Error('timeout on ' + promise.path))
      }, timeout)
      this.promises.set(id, { path, timer, resolve, reject })
    })
  }

  /** @private */
  batch(params: { id: string; path: string; args: any[] }) {
    this.batchMessages.push(params)
    clearTimeout(this.batchTimer)

    // if batch is full, send it max is 10
    if (this.batchMessages.length >= 10) {
      this.port?.postMessage({ batch: this.preparePayload(this.batchMessages) })
      this.batchMessages.length = 0
      return
    }

    this.batchTimer = setTimeout(() => {
      try {
        this.port?.postMessage({ batch: this.preparePayload(this.batchMessages) })
      } catch (e: any) {
        if (import.meta.env.DEV) {
          console.error(e.message)
        }
      }
      this.batchMessages.length = 0
    }, 1)
  }

  async sendRequest<T = any>(path = '', ...args: any[]) {
    const id = uuid()
    this.batch({ id, path, args })
    return this.createTimeoutPromise<T>(id, path)
  }

  subscribe(event: string, target: string | { [key: string]: string }, callback: any) {
    const id = uuid()
    this.eventHandlers.set(id, callback)
    this.batch({ id, path: event, args: [target] })
    return () => {
      this.eventHandlers.delete(id)
      setTimeout(() => {
        this.port?.postMessage({ id, path: 'off.' + event, args: [target] })
      }, 0)
    }
  }

  connect(messagePort: MessagePort) {
    this.port = messagePort

    this.port.onmessage = e => {
      const { id, data, error } = e.data
      const promise = this.promises.get(id)
      if (promise) {
        promise.timer && clearTimeout(promise.timer)
        this.promises.delete(id)
        if (error) {
          promise.reject(error)
        } else {
          promise.resolve(data)
        }
      } else {
        const callback = this.eventHandlers.get(id)
        if (callback) {
          callback(data)
        }
      }
    }

    return new Promise(resolve => setTimeout(resolve, 0))
  }

  disconnect() {
    if (this.port) {
      // loop through all promises and reject them
      this.port.postMessage({ id: this.id, path: CONNECTION.DISCONNECT })
    }
  }

  static create(): ISender {
    return new Sender()
  }
}
