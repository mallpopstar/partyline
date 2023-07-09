import { Cookie } from './storage/cookie'
import { onFetch } from './observers/fetch'
import { onHTTP } from './observers/http'
import { onInterval } from './observers/timer'
import { onUrlChange } from './observers/url'
import { query } from './dom/query'

export class Observer {
  dispatcher?: Window | Worker | MessagePort | BroadcastChannel
  #handlers: Map<string, any> = new Map()
  #disconnects: Map<string, any> = new Map()
  #cookie: Cookie = new Cookie()

  // constructor(port: Message Port) {
  //   this.port = port
  // }

  pointerEvent(id: string, selector: string, path: string) {
    const el = document.querySelector(selector)
    if (!el || !path) return

    const event = (path?.split('.').pop() + '').replace('on', '').toLowerCase()
    const handler = (evt: any) => {
      this.dispatcher?.postMessage({
        id,
        type: 'response',
        path,
        data: {
          selector,
          html: evt.currentTarget.outerHTML,
        },
      })
    }

    this.#handlers.set(id, () => {
      const el = document.querySelector(selector)
      if (el) {
        el.removeEventListener(event, handler)
      }
    })
    el.addEventListener(event, handler)
  }

  inputEvent(id: string, selector: string, path: string) {
    const el = document.querySelector(selector)
    if (!el || !path) return

    // get event from path
    const event = path?.split('.').pop() + ''
    let prevValue: string
    let timer: any = null
    const handler = (evt: any) => {
      const value = evt.currentTarget.value
      clearTimeout(timer)
      if (value === prevValue) return
      prevValue = value
      timer = setTimeout(() => {
        this.dispatcher?.postMessage({ id,type: 'response', path, data: { selector, value } })
      }, 250)
    }

    this.#handlers.set(id, () => {
      const el = document.querySelector(selector)
      if (el) {
        el.removeEventListener(event, handler)
      }
    })
    el.addEventListener(event, handler)
  }

  submit(id: string, selector: string) {
    const el = document.querySelector(selector)
    if (!el) return

    const handler = (evt: any) => {
      const form = evt.currentTarget
      const data = new FormData(form)
      const entries = data.entries()
      const values: any = {}
      for (let entry of entries) {
        values[entry[0]] = entry[1]
      }
      this.dispatcher?.postMessage({ id, type: 'response', path: 'on.formSubmit', data: values })
    }

    this.#handlers.set(id, () => {
      const el = document.querySelector(selector)
      if (el) {
        el.removeEventListener('submit', handler)
      }
    })
    el.addEventListener('submit', handler, true)
  }

  urlChange(id: string, match: string, path: string) {
    const regex = new RegExp(match)
    const handler = () => {
      const url = window.location.href
      if (match && !regex.test(url)) {
        return
      }
      if (this.dispatcher instanceof Window) {
        this.dispatcher.postMessage({ id, type: 'response', path, data: url }, '*')
      } else {
        this.dispatcher?.postMessage({ id, type: 'response', path, data: url })
      }
    }

    this.#handlers.set(id, onUrlChange(handler))
    handler()
  }

  fetch(id: string, match: string) {
    const regex = new RegExp(match)

    const handler = (response: { url: string; data: any }) => {
      const { url, data } = response
      if (match && !regex.test(url)) return
      this.dispatcher?.postMessage({ id, type: 'response', path: 'on.fetch', url, data })
    }

    this.#handlers.set(id, onFetch(handler))
  }

  httpRequest(id: string, match: string) {
    const regex = new RegExp(match)

    const handler = (data: { url: string; text: string }) => {
      const url = data.url
      if (match && !regex.test(url)) return
      this.dispatcher?.postMessage({ id, type: 'response', path: 'on.http', url, data })
    }

    this.#handlers.set(id, onHTTP(handler))
  }

  mutation(id: string, match: string) {
    // watch for text changes in the DOM selction
    if (!match) return

    let prevContent: string | null = null
    const handler = () => {
      const foundEl = query(window, match)
      const content = foundEl?.outerHTML ?? ''
      if (content === prevContent) return
      prevContent = content

      this.dispatcher?.postMessage({ id, type: 'response', path: 'on.dom', data: content })
    }

    this.#handlers.set(id, onInterval(handler))
  }

  sessionStorageChange(id: string, match: string, path: string) {
    // watch for text changes in the DOM selction
    if (!match) return

    let oldVal: string | null = null
    const handler = () => {
      try {
        const val = sessionStorage.getItem(match)
        if (val === oldVal) return
        oldVal = val

        this.dispatcher?.postMessage({ id, type: 'response', path, data: val })
      } catch (e) {
        console.log(path, match, e)
      }
    }

    this.#handlers.set(id, onInterval(handler))
  }

  localStorageChange(id: string, match: string, path: string) {
    // watch for text changes in the DOM selction
    if (!match) return

    let oldVal: string | null = null
    const handler = () => {
      try {
        const val = localStorage.getItem(match)
        if (val === oldVal) return
        oldVal = val

        this.dispatcher?.postMessage({ id, type: 'response', path, data: val })
      } catch (e) {}
    }

    this.#handlers.set(id, onInterval(handler))
  }

  cookieChange(id: string, match: string, path: string) {
    // watch for text changes in the DOM selction
    if (!match) return

    let oldVal: string | null = null
    const handler = () => {
      try {
        const val = this.#cookie.getItem(match)
        if (val === oldVal) return
        oldVal = val

        this.dispatcher?.postMessage({ id, type: 'response', path, data: val })
      } catch (e) {}
    }

    this.#handlers.set(id, onInterval(handler))
  }

  cookieStorageChange(id: string, match: string, path: string) {
    // watch for text changes in the DOM selction
    if (!match) return

    let cookieStorage = (window as any).cookieStorage
    let oldVal: string | null = null
    const handler = () => {
      try {
        const val = cookieStorage.getItem(match)
        if (val === oldVal) return
        oldVal = val

        this.dispatcher?.postMessage({ id, type: 'response', path, data: val })
      } catch (e) {}
    }

    this.#handlers.set(id, onInterval(handler))
  }

  /**
   * Watch for DOM show/hide
   * @param id
   * @param match
   * @returns
   */
  toggleShowHide(id: string, match: string) {
    if (!match) return

    // const regex = new RegExp(match)
    let el: HTMLElement | null = null

    const handler = () => {
      const foundEl = query(window, match, true)
      if (!!el === !!foundEl) return

      el = foundEl
      const html = foundEl?.outerHTML
      this.dispatcher?.postMessage({ id, type: 'response', path: 'on.dom', data: html })
    }

    this.#handlers.set(id, onInterval(handler))
  }

  off(id: string) {
    const handler = this.#handlers.get(id)
    this.#handlers.delete(id)
    if (handler instanceof Function) handler()
  }

  disconnect(id: string) {
    const handler = () => {
      this.dispatcher?.postMessage({ id, type: 'response', path: 'on.disconnect' })
      this.#handlers.forEach((_, id) => {
        this.off(id)
      })
    }
    this.#disconnects.set(id, handler)
  }

  execDisconnect() {
    // loop through disconnects and remove
    this.#disconnects.forEach(handler => handler())
    // clear disconnects
    this.#disconnects.clear()
  }
}
