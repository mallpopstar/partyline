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

  #getEventName(rawEvent: string) {
    return (rawEvent?.split('.').pop() + '').replace('on', '').toLowerCase()
  }

  #postMessage(message: { id: string; data: any }) {
    const origin = this.dispatcher instanceof Window ? '*' : undefined
    this.dispatcher?.postMessage(
      { id: message.id, type: 'event', data: message.data },
      origin as any
    )
  }

  pointerEvent(id: string, match: string, internalEvent: string) {
    try {
      const el = document.querySelector(match)
      if (!el || !internalEvent) return

      const eventName = this.#getEventName(internalEvent)
      const handler = (evt: any) => {
        this.#postMessage({ id, data: { selector: match, html: evt.currentTarget.outerHTML } })
      }

      this.#handlers.set(id, () => {
        const el = document.querySelector(match)
        if (el) {
          el.removeEventListener(eventName, handler)
        }
      })
      el.addEventListener(eventName, handler)
    } catch (e) {
      console.warn(e)
    }
  }

  inputEvent(id: string, match: string, event: string) {
    try {
      const el = document.querySelector(match)
      if (!el || !event) return
      
      // get event from path
      const eventName = this.#getEventName(event)
      console.log('inputEvent', el, match, eventName)
      let prevValue: string
      let timer: any = null
      const handler = (evt: any) => {
        const value = evt.currentTarget.value
        clearTimeout(timer)
        if (value === prevValue) return
        prevValue = value
        timer = setTimeout(() => {
          this.#postMessage({ id, data: { selector: match, value } })
        }, 250)
      }

      this.#handlers.set(id, () => {
        const el = document.querySelector(match)
        if (el) {
          el.removeEventListener(eventName, handler)
        }
      })
      el.addEventListener(eventName, handler)
    } catch (e) {
      console.warn(e)
    }
  }

  submit(id: string, match: string) {
    try {
      const el = document.querySelector(match)
      if (!el) return

      const handler = (evt: any) => {
        const form = evt.currentTarget
        const data = new FormData(form)
        const entries = data.entries()
        const values: any = {}
        for (const entry of entries) {
          values[entry[0]] = entry[1]
        }
        this.#postMessage({ id, data: values })
      }

      this.#handlers.set(id, () => {
        const el = document.querySelector(match)
        if (el) {
          el.removeEventListener('submit', handler)
        }
      })
      el.addEventListener('submit', handler, true)
    } catch (e) {
      console.warn(e)
    }
  }

  urlChange(id: string, match: string) {
    try {
      const regex = new RegExp(match)
      const handler = () => {
        const url = window.location.href
        if (match && !regex.test(url)) {
          return
        }
        this.#postMessage({ id, data: url })
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
        this.#postMessage({ id, data: { url, data } })
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
        this.#postMessage({ id, data })
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
        this.#postMessage({ id, data: content })
      }

      this.#handlers.set(id, onInterval(handler))
    } catch (e) {
      console.warn(e)
    }
  }

  sessionStorageChange(id: string, match: string) {
    try {
      // watch for text changes in the DOM selction
      if (!match) return

      let oldVal: string | null = null
      const handler = () => {
        try {
          const val = sessionStorage.getItem(match)
          if (val === oldVal) return
          oldVal = val

          this.#postMessage({ id, data: val })
        } catch (e) {
          console.log(match, e)
        }
      }

      this.#handlers.set(id, onInterval(handler))
    } catch (e) {
      console.warn(e)
    }
  }

  localStorageChange(id: string, match: string) {
    try {
      // watch for text changes in the DOM selction
      if (!match) return

      let oldVal: string | null = null
      const handler = () => {
        try {
          const val = localStorage.getItem(match)
          if (val === oldVal) return
          oldVal = val
          this.#postMessage({ id, data: val })
        } catch (e) {
          // console.log(match, e)
        }
      }

      this.#handlers.set(id, onInterval(handler))
    } catch (e) {
      console.warn(e)
    }
  }

  cookieChange(id: string, match: string) {
    try {
      // watch for text changes in the DOM selction
      if (!match) return

      let oldVal: string | null = null
      const handler = () => {
        try {
          const val = this.#cookie.getItem(match)
          if (val === oldVal) return
          oldVal = val
          this.#postMessage({ id, data: val })
        } catch (e) {
          // console.log(match, e)
        }
      }

      this.#handlers.set(id, onInterval(handler))
    } catch (e) {
      console.warn(e)
    }
  }

  cookieStorageChange(id: string, match: string) {
    try {
      // watch for text changes in the DOM selction
      if (!match) return

      const cookieStorage = (window as any).cookieStorage
      let oldVal: string | null = null
      const handler = () => {
        try {
          const val = cookieStorage.getItem(match)
          if (val === oldVal) return
          oldVal = val
          this.#postMessage({ id, data: val })
        } catch (e) {
          // console.log(match, e)
        }
      }

      this.#handlers.set(id, onInterval(handler))
    } catch (e) {
      // console.warn(e)
    }
  }

  /**
   * Visibility change on DOM element. Possible added or removed from DOM.
   * @param id
   * @param match
   * @returns
   */
  presentChange(id: string, match: string) {
    try {
      if (!match) return

      // const regex = new RegExp(match)
      let el: HTMLElement | null = null

      const handler = () => {
        const foundEl = query(window, match, true)
        if (!!el === !!foundEl) return

        el = foundEl
        const html = foundEl?.outerHTML
        this.#postMessage({ id, data: html })
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
        this.#postMessage({ id, data: null })
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
