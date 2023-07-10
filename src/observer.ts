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

  #postMessage(message: { id: string; path: string; data: any }) {
    const origin = this.dispatcher instanceof Window ? '*' : undefined
    this.dispatcher?.postMessage(
      { id: message.id, type: 'event', path: message.path, data: message.data },
      origin as any
    )
  }

  pointerEvent(id: string, selector: string, path: string) {
    try {
      const el = document.querySelector(selector)
      if (!el || !path) return

      const event = (path?.split('.').pop() + '').replace('on', '').toLowerCase()
      const handler = (evt: any) => {
        this.#postMessage({ id, path, data: { selector, html: evt.currentTarget.outerHTML } })
      }

      this.#handlers.set(id, () => {
        const el = document.querySelector(selector)
        if (el) {
          el.removeEventListener(event, handler)
        }
      })
      el.addEventListener(event, handler)
    } catch (e) {
      console.warn(e)
    }
  }

  inputEvent(id: string, selector: string, path: string) {
    try {
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
          this.#postMessage({ id, path, data: { selector, value } })
        }, 250)
      }

      this.#handlers.set(id, () => {
        const el = document.querySelector(selector)
        if (el) {
          el.removeEventListener(event, handler)
        }
      })
      el.addEventListener(event, handler)
    } catch (e) {
      console.warn(e)
    }
  }

  submit(id: string, selector: string) {
    try {
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
        this.#postMessage({ id, path: 'on.formSubmit', data: values })
      }

      this.#handlers.set(id, () => {
        const el = document.querySelector(selector)
        if (el) {
          el.removeEventListener('submit', handler)
        }
      })
      el.addEventListener('submit', handler, true)
    } catch (e) {
      console.warn(e)
    }
  }

  urlChange(id: string, match: string, path: string) {
    try {
      const regex = new RegExp(match)
      const handler = () => {
        const url = window.location.href
        if (match && !regex.test(url)) {
          return
        }
        this.#postMessage({ id, path, data: url })
      }

      this.#handlers.set(id, onUrlChange(handler))
      handler()
    } catch (e) {
      console.warn(e)
    }
  }

  fetch(id: string, match: string) {
    try {
      const regex = new RegExp(match)

      const handler = (response: { url: string; data: any }) => {
        const { url, data } = response
        if (match && !regex.test(url)) return
        this.#postMessage({ id, path: 'on.fetch', data: { url, data } })
      }

      this.#handlers.set(id, onFetch(handler))
    } catch (e) {
      console.warn(e)
    }
  }

  httpRequest(id: string, match: string) {
    try {
      const regex = new RegExp(match)

      const handler = (data: { url: string; text: string }) => {
        const url = data.url
        if (match && !regex.test(url)) return
        this.#postMessage({ id, path: 'on.http', data })
      }

      this.#handlers.set(id, onHTTP(handler))
    } catch (e) {
      console.warn(e)
    }
  }

  mutation(id: string, match: string) {
    try {
      // watch for text changes in the DOM selction
      if (!match) return

      let prevContent: string | null = null
      const handler = () => {
        const foundEl = query(window, match)
        const content = foundEl?.outerHTML ?? ''
        if (content === prevContent) return
        prevContent = content
        this.#postMessage({ id, path: 'on.dom', data: content })
      }

      this.#handlers.set(id, onInterval(handler))
    } catch (e) {
      console.warn(e)
    }
  }

  sessionStorageChange(id: string, match: string, path: string) {
    try {
      // watch for text changes in the DOM selction
      if (!match) return

      let oldVal: string | null = null
      const handler = () => {
        try {
          const val = sessionStorage.getItem(match)
          if (val === oldVal) return
          oldVal = val

          this.#postMessage({ id, path, data: val })
        } catch (e) {
          console.log(path, match, e)
        }
      }

      this.#handlers.set(id, onInterval(handler))
    } catch (e) {
      console.warn(e)
    }
  }

  localStorageChange(id: string, match: string, path: string) {
    try {
      // watch for text changes in the DOM selction
      if (!match) return

      let oldVal: string | null = null
      const handler = () => {
        try {
          const val = localStorage.getItem(match)
          if (val === oldVal) return
          oldVal = val
          this.#postMessage({ id, path, data: val })
        } catch (e) {}
      }

      this.#handlers.set(id, onInterval(handler))
    } catch (e) {
      console.warn(e)
    }
  }

  cookieChange(id: string, match: string, path: string) {
    try {
      // watch for text changes in the DOM selction
      if (!match) return

      let oldVal: string | null = null
      const handler = () => {
        try {
          const val = this.#cookie.getItem(match)
          if (val === oldVal) return
          oldVal = val
          this.#postMessage({ id, path, data: val })
        } catch (e) {}
      }

      this.#handlers.set(id, onInterval(handler))
    } catch (e) {
      console.warn(e)
    }
  }

  cookieStorageChange(id: string, match: string, path: string) {
    try {
      // watch for text changes in the DOM selction
      if (!match) return

      let cookieStorage = (window as any).cookieStorage
      let oldVal: string | null = null
      const handler = () => {
        try {
          const val = cookieStorage.getItem(match)
          if (val === oldVal) return
          oldVal = val
          this.#postMessage({ id, path, data: val })
        } catch (e) {}
      }

      this.#handlers.set(id, onInterval(handler))
    } catch (e) {
      console.warn(e)
    }
  }

  /**
   * Watch for DOM show/hide
   * @param id
   * @param match
   * @returns
   */
  toggleShowHide(id: string, match: string) {
    try {
      if (!match) return

      // const regex = new RegExp(match)
      let el: HTMLElement | null = null

      const handler = () => {
        const foundEl = query(window, match, true)
        if (!!el === !!foundEl) return

        el = foundEl
        const html = foundEl?.outerHTML
        this.#postMessage({ id, path: 'on.dom', data: html })
      }

      this.#handlers.set(id, onInterval(handler))
    } catch (e) {
      console.warn(e)
    }
  }

  off(id: string) {
    try {
      const handler = this.#handlers.get(id)
      this.#handlers.delete(id)
      if (handler instanceof Function) handler()
    } catch (e) {
      console.warn(e)
    }
  }

  disconnect(id: string) {
    try {
      const handler = () => {
        this.#postMessage({ id, path: 'on.disconnect', data: null })
        this.#handlers.forEach((_, id) => {
          this.off(id)
        })
      }
      this.#disconnects.set(id, handler)
    } catch (e) {
      console.warn(e)
    }
  }

  execDisconnect() {
    try {
      // loop through disconnects and remove
      this.#disconnects.forEach(handler => handler())
      // clear disconnects
      this.#disconnects.clear()
    } catch (e) {
      console.warn(e)
    }
  }
}
