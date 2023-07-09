import { CONNECTION } from './consts/connection'
import { Cookie } from './storage/cookie'
import { DocumentElement } from './dom/element'
import { ELEMENT } from './consts/element'
import { FORM } from './consts/form'
import { INPUT } from './consts/input'
import { NETWORK } from './consts/network'
import { Observer } from './observer'
import { STORE } from './consts/store'
import { WINDOW } from './consts/page'
import { createUniqueId } from './helpers/createUniqueId'
import { getValue } from './helpers/value'

declare const cookieStore: any

export class Receiver {
  id = createUniqueId()

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
  #dispatcher?: Window | Worker | MessagePort | BroadcastChannel
  // logs messages to a handler
  #logger?: (...args: any[]) => void
  // private onDisconnect
  #onDisconnect?: () => void

  /**
   * Connects to the host application
   *
   * @param dispatcher
   * @param onDisconnect
   */
  connect(dispatcher: Window | Worker | MessagePort | BroadcastChannel, onDisconnect?: () => void) {
    if (dispatcher instanceof Window) {
      dispatcher.addEventListener('message', (event: any) => {
        if (event.data.batch) {
          return event.data.batch.forEach((payload: any) => this.#postMessage(payload))
        }
        this.#postMessage(event.data)
      })
      this.#onDisconnect = onDisconnect
    } else if ('postMessage' in dispatcher) {
      dispatcher.onmessage = async (event: any) => {
        if (event.data.batch) {
          return event.data.batch.forEach((payload: any) => this.#postMessage(payload))
        }
        this.#postMessage(event.data)
      }
      this.#onDisconnect = onDisconnect
    }
    this.#dispatcher = dispatcher
    this.#on.dispatcher = dispatcher
  }

  /**
   * Disconnects from the host application
   */
  disconnect() {
    this.#on.execDisconnect()
    setTimeout(() => {
      if (this.#dispatcher instanceof BroadcastChannel || this.#dispatcher instanceof MessagePort) {
        this.#dispatcher?.close()
      }
      this.#dispatcher = undefined
    }, 1000)
    this.#onDisconnect?.()
  }

  /**
   * Register a custom path or override a default path
   *
   * @param path
   * @param callback
   */
  registerPath(path: string, callback: (requestId: string, ...args: any[]) => any) {
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
  #execDom(
    path: string,
    opts: {
      selector: string
      html?: string
      styles?: string
      classes?: string
      applyToAll?: boolean
      position?: InsertPosition
    }
  ) {
    const { selector, applyToAll } = opts

    switch (path) {
      case ELEMENT.EXISTS:
        return this.#element.exists(opts)
      case ELEMENT.ADD:
        if (!selector || !opts.html) return
        if (applyToAll)
          return this.#element.addToAll({
            selector,
            html: opts.html,
            position: opts.position,
          })
        return this.#element.add({
          selector,
          html: opts.html,
          position: opts.position,
        })
      case ELEMENT.FIND:
        if (applyToAll) return this.#element.getAll(opts)
        return this.#element.get(opts)
      case ELEMENT.REMOVE:
        if (applyToAll) return this.#element.removeAll(opts)
        return this.#element.remove(opts)
      case ELEMENT.REPLACE:
        if (applyToAll)
          return this.#element.replaceAll({
            selector,
            html: opts.html || '',
          })
        return this.#element.replace({
          selector,
          html: opts.html || '',
        })
      case ELEMENT.ADD_STYLES:
        if (applyToAll)
          return this.#element.addStylesToAll({
            selector,
            styles: opts.styles || '',
          })
        return this.#element.addStyles({
          selector,
          styles: opts.styles || '',
        })
      case ELEMENT.RESTORE_STYLES:
        if (applyToAll) return this.#element.restoreStylesToAll()
        return this.#element.restoreStyles(opts)
      case ELEMENT.ADD_CLASSES:
        if (applyToAll)
          return this.#element.addClassesToAll({
            selector,
            classes: opts.classes || '',
          })
        return this.#element.addClasses({
          selector,
          classes: opts.classes || '',
        })
      case ELEMENT.REMOVE_CLASSES:
        if (applyToAll)
          return this.#element.removeClassesToAll({
            selector,
            classes: opts.classes || '',
          })
        return this.#element.removeClasses({
          selector,
          classes: opts.classes || '',
        })
    }
  }

  async #postMessage(data: { id: string; type: string; path: string; args: any[] }) {
    try {
      const { id, type, path, args } = data
      if(!id || !type || !path) return
      // log the message
      this.#logger?.(data)
      // check if the path is a custom path
      if (this.#customPaths.has(path)) {
        let value = this.#customPaths.get(path)?.(id, ...args)
        if (this.#isPromise(value)) {
          value = await value
        }
        if (this.#dispatcher instanceof Window) {
          return this.#dispatcher?.postMessage({ id, type, data: value }, '*')
        }
        return this.#dispatcher?.postMessage({ id, type, data: value })
      }

      if (this.#isFetch(path)) {
        const [url, options] = args
        return this.#fetch(id, url, options)
      }

      if (this.#isOff(path)) {
        return this.#on.off(id)
      }

      if (this.#isOn(path)) {
        return this.#execOn(id, args?.[0], path)
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
          if (this.#dispatcher instanceof Window) {
            return this.#dispatcher?.postMessage({ id, type, data: value }, '*')
          }
          return this.#dispatcher?.postMessage({ id, type, data: value })
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
          if (this.#dispatcher instanceof Window) {
            return this.#dispatcher?.postMessage({ id, type, data: value }, '*')
          }
          return this.#dispatcher?.postMessage({ id, type, data: value })
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
          if (this.#dispatcher instanceof Window) {
            return this.#dispatcher?.postMessage({ id, type, data: value }, '*')
          }
          return this.#dispatcher?.postMessage({ id, type, data: value })
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
          if (this.#dispatcher instanceof Window) {
            return this.#dispatcher?.postMessage({ id, type, data: value }, '*')
          }
          return this.#dispatcher?.postMessage({ id, type, data: value })
        }
      }

      if (this.#isElement(path)) {
        const opts = args[0]
        let value = this.#execDom(path, opts)
        return this.#dispatcher?.postMessage({ id, type, data: value })
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

      if (this.#dispatcher instanceof Window) {
        return this.#dispatcher?.postMessage({ id, type, data: value }, '*')
      }
      this.#dispatcher?.postMessage({ id: data.id, type, data: value })
    } catch (e: any) {
      const type = 'response'
      if (this.#dispatcher instanceof Window) {
        this.#dispatcher?.postMessage({ id: data.id, type, error: e.message }, '*')
      } else {
        this.#dispatcher?.postMessage({ id: data.id, type, error: e.message })
      }
    }
  }

  #invoke(method: Function, path: string, args: any[], target?: any) {
    try {
      // if there is a . in the path pop the last item off the path and get the value of that
      // then call the method on that value
      let thisArg = window
      if (path?.includes('.')) {
        const thisPath = path?.split('.').slice(0, -1).join('.')
        thisArg = getValue(thisPath, target)
      }
      return method.apply(thisArg, args)
    } catch (e) {
      console.log(e)
    }
  }

  #isOn(path: string) {
    return path?.includes('.on')
  }

  #isOff(path: string) {
    return path?.includes('off.')
  }

  #isCookie(path: string) {
    return path?.startsWith('cookie')
  }

  #isSessionStorage(path: string) {
    return path?.startsWith('sessionStorage')
  }

  #isLocalStorage(path: string) {
    return path?.startsWith('localStorage')
  }

  #isCookieStore(path: string) {
    return path?.startsWith('cookieStore')
  }

  #isElement(path: string) {
    return path?.startsWith('element')
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
    const type = 'response'
    try {
      const response = await fetch(url, options)
      if (response.ok) {
        const data = await response.text()
        if (this.#dispatcher instanceof Window) {
          this.#dispatcher?.postMessage({ id, type, data: (data + '').trim() }, '*')
        } else {
          this.#dispatcher?.postMessage({ id, type, data: (data + '').trim() })
        }
        return { data }
      }
      return { error: response.statusText }
    } catch (e: any) {
      if (this.#dispatcher instanceof Window) {
        this.#dispatcher?.postMessage({ id, type: 'response', data: { error: e.message } }, '*')
      } else {
        this.#dispatcher?.postMessage({ id, type: 'response', data: { error: e.message } })
      }
      return { error: e.message }
    }
  }
}
