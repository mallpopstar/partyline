import { IChannel, IReceiver, Messenger, RequestMessage, Responder, ResponseMessage } from "./types"

function isIChannel(value: any): value is IChannel {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.postMessage === 'function' &&
    typeof value.addEventListener === 'function' &&
    typeof value.removeEventListener === 'function'
  )
}

class Receiver implements IReceiver {
  // requests that are registered
  #requestHandlers: Map<string, (...args: any[]) => any> = new Map()
  // private port
  #dispatcher?: Messenger
  // private onDisconnect
  #disconnectHandler?: () => void

  /**
   * Connects to dispatcher
   *
   * @param dispatcher
   * @param disconnectHandler
   */
  connect(dispatcher: Messenger, disconnectHandler?: () => void) {
    if (dispatcher instanceof Window || dispatcher instanceof BroadcastChannel || isIChannel(dispatcher)) {
      dispatcher.addEventListener('message', (event: any) => {
        if (event.data.batch) {
          return event.data.batch.forEach((payload: any) => this.#requestHandler(payload))
        }
        this.#requestHandler(event.data)
      })
      this.#disconnectHandler = disconnectHandler
    } else {
      dispatcher.onmessage = async (event: any) => {
        if (event.data.batch) {
          return event.data.batch.forEach((payload: any) => this.#requestHandler(payload))
        }
        this.#requestHandler(event.data)
      }
      this.#disconnectHandler = disconnectHandler
    }
    this.#dispatcher = dispatcher
  }

  /**
   * Disconnects from dispatcher
   */
  disconnect() {
    setTimeout(() => {
      if (this.#dispatcher instanceof BroadcastChannel || this.#dispatcher instanceof MessagePort) {
        this.#dispatcher?.close()
      }
      this.#dispatcher = undefined
    }, 1000)
    this.#disconnectHandler?.()
  }

  /**
   * Register a request handler
   *
   * @param name
   * @param handler
   */
  onRequest(name: string, handler: (req: RequestMessage, res: Responder) => any) {
    this.#requestHandlers.set(name, handler)
  }

  onSubscribe(event: string, handler: (req: RequestMessage, res: Responder) => void) {
    this.#requestHandlers.set(event + ':subscribe', (req, res) => {
      req.name = this.#cleanupName(req.name) // remove :subscribe from name before calling handler
      handler(req, res)
    })
  }

  onUnsubscribe(event: string, handler: (req: RequestMessage, res: Responder) => any) {
    this.#requestHandlers.set(event + ':unsubscribe', (req, res) => {
      req.name = this.#cleanupName(req.name) // remove :unsubscribe from name before calling handler
      handler(res, res)
    })
  }

  removeHandler(name: string, type: 'request' | 'subscription' = 'request') {
    if (type === 'request') {
      this.#requestHandlers.delete(name)
    } else {
      this.#requestHandlers.delete(name + ':subscribe')
      this.#requestHandlers.delete(name + ':unsubscribe')
    }
  }

  removeAllHandlers(match?: RegExp) {
    if (match instanceof RegExp) {
      this.#requestHandlers.forEach((_, key) => {
        if (match.test(key)) {
          this.#requestHandlers.delete(key)
        }
      })
    } else {
      this.#requestHandlers.clear()
    }
  }

  async #requestHandler(req: RequestMessage) {
    try {
      if (['request', 'subscription'].includes(req.type) === false) return
      const res: Responder = {
        send: (body?: any) => {
          this.#postMessage(req, body)
        },
      }

      if (this.#requestHandlers.has(req.name)) {
        this.#requestHandlers.get(req.name)?.(req, res)
      } else if (this.#requestHandlers.has('*')) {
        this.#requestHandlers.get('*')?.(req, res)
      } else {
        this.#postMessage(req, new Error(`Request "${req.name}" not found`))
      }
    } catch (e: any) {
      this.#postMessage(e)
    }
  }

  #cleanupName(name: string) {
    return name.replace(/(.*):\w+/g, '$1')
  }

  #postMessage(req: RequestMessage, body?: any) {
    try {
      const message: ResponseMessage = {
        id: req.id,
        senderId: req.senderId,
        type: 'response',
        name: req.name,
        body,
      }

      if (req.type === 'subscription') {
        message.type = 'event'
        // remove .subscribe or .unsubscribe from name
        message.name = this.#cleanupName(req.name)
      } else if (req.body instanceof Error) {
        message.type = 'error'
        message.body = { name: req.body.name, message: req.body.message, cause: req.body.cause }
      }

      const origin: any = this.#dispatcher === window.parent || this.#dispatcher === window.opener ? '*' : undefined
      this.#dispatcher?.postMessage(message, origin)
    } catch (e) {
      console.warn(e)
    }
  }
}

export const createReceiver = (): IReceiver => {
  return new Receiver()
}
