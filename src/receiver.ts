import { CONNECTION } from './consts/connection'
import { Cookie } from './storage/cookie'
import { DocumentElement } from './dom/element'
import { ELEMENT } from './consts/element'
import { ELEMENTS } from './consts/elements'
import { FORM } from './consts/form'
import { INPUT } from './consts/input'
import { NETWORK } from './consts/network'
import { Observer } from './observer'
import { STORE } from './consts/store'
import { WINDOW } from './consts/window'
import { getValue } from './helpers/value'
import { uuid } from './helpers/uuid'

declare const cookieStore: any

export class Receiver {
  id = uuid()

  // customPaths for overriding default paths
  #customPaths: Map<string, (...args: any[]) => any> = new Map()
  // cookie is used as paths on execOn
  #cookie = new Cookie()
  // session is used as paths on execOn
  #sessionStorage = sessionStorage
  // localStorage is used as paths on execOn
  #localStorage = localStorage
  // cookieStore
  #cookieStore = cookieStore
  // on is used as paths on execOn
  #on = new Observer()
  // dom is used as paths on execOn
  #element = new DocumentElement()
  // private port
  #port?: MessagePort
  // logs messages to a handler
  #logger?: (...args: any[]) => void
  // private onDisconnect
  #onDisconnect?: () => void

  /**
   * Connects to the host application
   *
   * @param port
   * @param onDisconnect
   */
  connect(port: MessagePort, onDisconnect?: () => void) {
    this.#port = port
    this.#on.port = port

    port.onmessage = async (event: MessageEvent) => {
      if (event.data.batch) {
        return event.data.batch.forEach((payload: any) => this.#postMessage(payload))
      }
      this.#postMessage(event.data)
    }
    this.#onDisconnect = onDisconnect
  }

  /**
   * Disconnects from the host application
   */
  disconnect() {
    this.#on.execDisconnect()
    setTimeout(() => {
      this.#port?.close()
      this.#port = undefined
    }, 1000)
    this.#onDisconnect?.()
  }

  /**
   * Register a custom path or override a default path
   *
   * @param path
   * @param callback
   */
  registerPath(path: string, callback: (...args: any[]) => any) {
    this.#customPaths.set(path, callback)
  }

  /**
   * Logs messages to a handler
   *
   * @param logger
   */
  log(logger: (...args: any[]) => void) {
    this.#logger = logger
  }

  #execOn(id: string, selector: string, path: string) {
    selector = selector + '' === '*' ? '' : selector + ''
    switch (path) {
      case ELEMENT.ON_CLICK:
      case ELEMENT.ON_MOUSEDOWN:
      case ELEMENT.ON_MOUSEUP:
      case ELEMENT.ON_HOVER:
        return this.#on.pointerEvent(id, selector, path)
      case ELEMENT.ON_TOGGLE:
        return this.#on.toggleShowHide(id, selector)
      case ELEMENT.ON_MUTATION:
        return this.#on.mutation(id, selector)
      case INPUT.ON_INPUT:
      case INPUT.ON_CHANGE:
      case INPUT.ON_FOCUS:
      case INPUT.ON_BLUR:
        return this.#on.inputEvent(id, selector, path)
      case FORM.ON_SUBMIT:
        return this.#on.submit(id, selector)
      case WINDOW.ON_URL_CHANGE:
        return this.#on.urlChange(id, selector, path)
      case NETWORK.ON_FETCH:
        return this.#on.fetch(id, selector)
      case NETWORK.ON_HTTP:
        return this.#on.httpRequest(id, selector)
      case CONNECTION.ON_DISCONNECT:
        return this.#on.disconnect(id)
      case STORE.ON_COOKIE_CHANGE:
        return this.#on.cookieChange(id, selector, path)
      case STORE.ON_SESSION_STORAGE_CHANGE:
        return this.#on.sessionStorageChange(id, selector, path)
      case STORE.ON_COOKIE_STORE_CHANGE:
        return this.#on.cookieStorageChange(id, selector, path)
      case STORE.ON_LOCAL_STORAGE_CHANGE:
        return this.#on.localStorageChange(id, selector, path)
      default:
        console.log('path not found', path)
        return () => {}
    }
  }

  /**
   *
   * @param path
   * @param selector
   * @param value HTML or styles
   * @param position
   * @returns
   */
  #execDom(path: string, selector: string | string[], value: string, position: InsertPosition = 'beforeend') {
    switch (path) {
      case ELEMENT.ADD:
        return this.#element.add(selector as string, value, position)
      case ELEMENTS.ADD:
        return this.#element.addToAll(selector as string, value, position)
      case ELEMENT.FIND:
        return this.#element.get(selector as string, value as any)
      case ELEMENTS.FIND:
        return this.#element.getAll(selector as string)
      case ELEMENT.EXISTS:
        return this.#element.exists(selector)
      case ELEMENT.REMOVE:
        return this.#element.remove(selector as string)
      case ELEMENTS.REMOVE:
        return this.#element.removeAll(selector as string)
      case ELEMENT.REPLACE:
        return this.#element.replace(selector as string, value!)
      case ELEMENTS.REPLACE:
        return this.#element.replaceAll(selector as string, value!)
      case ELEMENT.ADD_STYLES:
        return this.#element.addStyles(selector as string, value!)
      case ELEMENTS.ADD_STYLES:
        return this.#element.addStylesToAll(selector as string, value!)
      case ELEMENT.RESTORE_STYLES:
        return this.#element.restoreStyles(selector as string)
      case ELEMENTS.RESTORE_STYLES:
        return this.#element.restoreStylesToAll()
      case ELEMENT.REMOVE_CLASSES:
        return this.#element.removeClasses(selector as string, value!)
      case ELEMENTS.REMOVE_CLASSES:
        return this.#element.removeClassesToAll(selector as string, value!)
    }
  }

  async #postMessage(data: { id: string; path: string; args: any[] }) {
    try {
      const { id, path, args } = data
      // log the message
      this.#logger?.(data)
      // check if the path is a custom path
      if (this.#customPaths.has(path)) {
        let value = this.#customPaths.get(path)?.(id, ...args)
        if (this.#isPromise(value)) {
          value = await value
        }
        return this.#port?.postMessage({ id, data: value })
      }

      if (this.#isFetch(path)) {
        const [url, options] = args
        return this.#fetch(id, url, options)
      }

      if (this.#isOff(path)) {
        return this.#on.off(id)
      }

      if (this.#isOn(path)) {
        return this.#execOn(id, args[0], path)
      }

      if (this.#isDisconnect(path)) {
        return this.disconnect()
      }

      if (this.#isCookie(path)) {
        const target = { cookie: this.#cookie }
        let value = getValue(path, target)
        if (this.#isFunction(value)) {
          value = this.#invoke(value, path, args, target)
          if (this.#isPromise(value)) {
            value = await value
          }
          return this.#port?.postMessage({ id, data: value })
        }
      }

      if (this.#isSessionStorage(path)) {
        const target = { storage: this.#sessionStorage }
        let value = getValue(path, target)
        if (this.#isFunction(value)) {
          value = this.#invoke(value, path, args, target)
          if (this.#isPromise(value)) {
            value = await value
          }
          return this.#port?.postMessage({ id, data: value })
        }
      }

      if (this.#isLocalStorage(path)) {
        const target = { storage: this.#localStorage }
        let value = getValue(path, target)
        if (this.#isFunction(value)) {
          value = this.#invoke(value, path, args, target)
          if (this.#isPromise(value)) {
            value = await value
          }
          return this.#port?.postMessage({ id, data: value })
        }
      }

      if (this.#isCookieStore(path)) {
        const target = { storage: this.#cookieStore }
        let value = getValue(path, target)
        if (this.#isFunction(value)) {
          value = this.#invoke(value, path, args, target)
          if (this.#isPromise(value)) {
            value = await value
          }
          return this.#port?.postMessage({ id, data: value })
        }
      }

      if (this.#isElement(path)) {
        const [selector, html, position] = args
        let value = this.#execDom(path, selector, html, position)
        return this.#port?.postMessage({ id, data: value })
      }
      let value = getValue(path)
      if (this.#isFunction(value)) {
        value = this.#invoke(value, path, args)
      }

      try {
        // check if the result is a promise
        if (this.#isPromise(value)) {
          value = await value
        } // check if html element
        else if (this.#isHTMLElement(value)) {
          value = value.outerHTML
        }
      } catch (e) {
        value = undefined
      }

      this.#port?.postMessage({ id: data.id, data: value })
    } catch (e: any) {
      this.#port?.postMessage({ id: data.id, error: e.message })
    }
  }

  #invoke(method: Function, path: string, args: any[], target?: any) {
    try {
      // if there is a . in the path pop the last item off the path and get the value of that
      // then call the method on that value
      let thisArg = window
      if (path.includes('.')) {
        const thisPath = path.split('.').slice(0, -1).join('.')
        thisArg = getValue(thisPath, target)
      }
      return method.apply(thisArg, args)
    } catch (e) {
      console.log(e)
    }
  }

  #isOn(path: string) {
    return path.includes('.on')
  }

  #isOff(path: string) {
    return path.includes('off.')
  }

  #isCookie(path: string) {
    return path.startsWith('cookie')
  }

  #isSessionStorage(path: string) {
    return path.startsWith('sessionStorage')
  }

  #isLocalStorage(path: string) {
    return path.startsWith('localStorage')
  }

  #isCookieStore(path: string) {
    return path.startsWith('cookieStore')
  }

  #isElement(path: string) {
    return path.startsWith('element')
  }

  #isFunction(val: any) {
    if (!val) return false
    return typeof val === 'function'
  }

  #isPromise(val: any) {
    if (!val) return false
    return val instanceof Promise
  }

  #isHTMLElement(val: any) {
    if (!val) return false
    return val instanceof Element
  }

  #isFetch(path: string) {
    return path === NETWORK.FETCH
  }

  #isDisconnect(path: string) {
    return path === CONNECTION.DISCONNECT
  }

  async #fetch(id: string, url: string, options: any) {
    try {
      const response = await fetch(url, options)
      if (response.ok) {
        const data = await response.text()
        this.#port?.postMessage({ id, data: (data + '').trim() })
        return { data }
      }
      return { error: response.statusText }
    } catch (e: any) {
      this.#port?.postMessage({ id, data: { error: e.message } })
      return { error: e.message }
    }
  }
}
