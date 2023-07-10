import { CONNECTION } from './consts/connection'
import { ELEMENT } from './consts/element'
import { FORM } from './consts/form'
import { INPUT } from './consts/input'
import { NETWORK } from './consts/network'
import { STORE } from './consts/store'
import { WINDOW } from './consts/page'
import { createUniqueId } from './helpers/createUniqueId'

export type ElementCallback = (data: { selector: string; html: string }) => void
export type InputCallback = (data: { selector: string; value: string }) => void
export type FormCallback = (data: { selector: string; value: string }) => void
export type NetworkCallback = (data: string) => void
export type StoreCallback = (data: string) => void

export interface IElement {
  add: (opts: { selector: string; html: string; position?: InsertPosition; applyToAll?: boolean }) => Promise<any>
  exists: (opts: { selector: string }) => Promise<any>
  find: (opts: { selector: string }) => Promise<any>
  remove: (opts: { selector: string }) => Promise<any>
  query: (opts: { queryPath: string }) => Promise<any>

  // mutations
  replace: (opts: { selector: string; html: string; applyToAll?: boolean }) => Promise<any>
  addClasses: (opts: { selector: string; classes: string[]; applyToAll?: boolean }) => Promise<any>
  removeClasses: (opts: { selector: string; classes: string[]; applyToAll?: boolean }) => Promise<any>
  addStyles: (opts: { selector: string; styles: { [key: string]: string }; applyToAll?: boolean }) => Promise<any>
  restoreStyles: (opts?: { selector: string; applyToAll?: boolean }) => Promise<any>

  // event handlers
  onClick: (target: string | { [key: string]: string }, callback: ElementCallback) => Function
  onHover: (target: string | { [key: string]: string }, callback: ElementCallback) => Function
  onMouseDown: (target: string | { [key: string]: string }, callback: ElementCallback) => Function
  onMouseUp: (target: string | { [key: string]: string }, callback: ElementCallback) => Function
  onMouseOver: (target: string | { [key: string]: string }, callback: ElementCallback) => Function
  onMutate: (target: string | { [key: string]: string }, callback: ElementCallback) => Function
  onExists: (target: string | { [key: string]: string }, callback: ElementCallback) => Function
}

class Element implements IElement {
  constructor(private sender: ISender) {}

  async addStyles(opts: { selector: string; styles: string | { [key: string]: string }; applyToAll?: boolean }) {
    return await this.sender.send(ELEMENT.ADD_STYLES, opts)
  }

  async restoreStyles(opts?: { selector: string; applyToAll?: boolean }) {
    return await this.sender.send(ELEMENT.RESTORE_STYLES, opts)
  }

  async add(opts: { selector: string; html: string; position?: InsertPosition; applyToAll?: boolean }) {
    return await this.sender.send(ELEMENT.ADD, opts)
  }

  async exists(opts: { selector: string }) {
    return await this.sender.send(ELEMENT.EXISTS, opts)
  }

  async find(opts: { selector: string }) {
    return await this.sender.send(ELEMENT.FIND, opts)
  }

  async remove(opts: { selector: string }) {
    return await this.sender.send(ELEMENT.REMOVE, opts)
  }

  async addClasses(opts: { selector: string; classes: string[]; applyToAll?: boolean }) {
    return await this.sender.send(ELEMENT.ADD_CLASSES, opts)
  }

  async removeClasses(opts: { selector: string; classes: string[]; applyToAll?: boolean }) {
    return await this.sender.send(ELEMENT.REMOVE_CLASSES, opts)
  }

  async replace(opts: { selector: string; html: string; applyToAll?: boolean }) {
    return await this.sender.send(ELEMENT.REPLACE, opts)
  }

  async query(opts: { queryPath: string }) {
    return await this.sender.send(ELEMENT.QUERY, opts)
  }

  // event: string, target: string | { [key: string]: string }, callback: ElementCallback
  // event handlers
  onClick(selector: string | { [key: string]: string }, callback: ElementCallback): Function {
    return this.sender.subscribe(ELEMENT.ON_CLICK, selector, callback)
  }

  onHover(selector: string | { [key: string]: string }, callback: ElementCallback): Function {
    return this.sender.subscribe(ELEMENT.ON_HOVER, selector, callback)
  }

  onMouseDown(selector: string | { [key: string]: string }, callback: ElementCallback): Function {
    return this.sender.subscribe(ELEMENT.ON_MOUSEDOWN, selector, callback)
  }

  onMouseUp(selector: string | { [key: string]: string }, callback: ElementCallback): Function {
    return this.sender.subscribe(ELEMENT.ON_MOUSEUP, selector, callback)
  }

  onMouseOver(selector: string | { [key: string]: string }, callback: ElementCallback): Function {
    return this.sender.subscribe(ELEMENT.ON_MOUSE_OVER, selector, callback)
  }

  onMutate(selector: string | { [key: string]: string }, callback: ElementCallback): Function {
    return this.sender.subscribe(ELEMENT.ON_MUTATION, selector, callback)
  }

  onExists(selector: string | { [key: string]: string }, callback: ElementCallback): Function {
    return this.sender.subscribe(ELEMENT.ON_EXISTS, selector, callback)
  }
}

export interface IInput {
  onBlur: (target: string | { [key: string]: string }, callback: InputCallback) => Function
  onChange: (target: string | { [key: string]: string }, callback: InputCallback) => Function
  onFocus: (target: string | { [key: string]: string }, callback: InputCallback) => Function
  onInput: (target: string | { [key: string]: string }, callback: InputCallback) => Function
}

class Input implements IInput {
  constructor(private sender: ISender) {}

  onBlur(target: string | { [key: string]: string }, callback: InputCallback): Function {
    return this.sender.subscribe(INPUT.ON_BLUR, target, callback)
  }

  onChange(target: string | { [key: string]: string }, callback: InputCallback): Function {
    return this.sender.subscribe(INPUT.ON_CHANGE, target, callback)
  }

  onFocus(target: string | { [key: string]: string }, callback: InputCallback): Function {
    return this.sender.subscribe(INPUT.ON_FOCUS, target, callback)
  }

  onInput(target: string | { [key: string]: string }, callback: InputCallback): Function {
    return this.sender.subscribe(INPUT.ON_INPUT, target, callback)
  }
}

export interface IForm {
  onSubmit: (target: string | { [key: string]: string }, callback: FormCallback) => Function
}

class Form implements IForm {
  constructor(private sender: ISender) {}

  onSubmit(target: string | { [key: string]: string }, callback: FormCallback): Function {
    return this.sender.subscribe(FORM.ON_SUBMIT, target, callback)
  }
}

export interface INetwork {
  fetch: (url: string, options?: any) => Promise<any>

  // event handlers
  onFetch: (match: string | { [key: string]: string }, callback: NetworkCallback) => Function
  onHTTP: (match: string | { [key: string]: string }, callback: NetworkCallback) => Function
}

class Network implements INetwork {
  constructor(private sender: ISender) {}

  async fetch(url: string, options?: any) {
    return await this.sender.send(NETWORK.FETCH, url, options)
  }

  // event handlers
  onFetch(match: string | { [key: string]: string }, callback: NetworkCallback): Function {
    return this.sender.subscribe(NETWORK.ON_FETCH, match, callback)
  }

  onHTTP(match: string | { [key: string]: string }, callback: NetworkCallback): Function {
    return this.sender.subscribe(NETWORK.ON_HTTP, match, callback)
  }
}

export interface IStore {
  getCookie: (name: string) => Promise<any>
  getCookieStoreItem: (name: string) => Promise<any>
  getLocalStorageItem: (name: string) => Promise<any>
  getSessionStorageItem: (name: string) => Promise<any>

  setCookie: (name: string, value: any, options?: any) => Promise<any>
  setCookieStoreItem: (name: string, value: any, options?: any) => Promise<any>
  setLocalStorageItem: (name: string, value: any) => Promise<any>
  setSessionStorageItem: (name: string, value: any) => Promise<any>

  onCookieChange: (key: string, callback: StoreCallback) => Function
  onCookieStoreChange: (key: string, callback: StoreCallback) => Function
  onLocalStorageChange: (key: string, callback: StoreCallback) => Function
  onSessionStorageChange: (key: string, callback: StoreCallback) => Function
}

class StoreSender implements IStore {
  constructor(private sender: ISender) {}

  async getCookie(name: string) {
    return await this.sender.send(STORE.GET_COOKIE, name)
  }

  async getCookieStoreItem(name: string) {
    return await this.sender.send(STORE.GET_COOKIE_STORE_ITEM, name)
  }

  async getLocalStorageItem(name: string) {
    return await this.sender.send(STORE.GET_LOCAL_STORAGE_ITEM, name)
  }

  async getSessionStorageItem(name: string) {
    return await this.sender.send(STORE.GET_SESSION_STORAGE_ITEM, name)
  }

  async setCookie(name: string, value: any, options?: any) {
    return await this.sender.send(STORE.SET_COOKIE, name, value, options)
  }

  async setCookieStoreItem(name: string, value: any, options?: any) {
    return await this.sender.send(STORE.SET_COOKIE_STORE_ITEM, name, value, options)
  }

  async setLocalStorageItem(name: string, value: any) {
    return await this.sender.send(STORE.SET_LOCAL_STORAGE_ITEM, name, value)
  }

  async setSessionStorageItem(name: string, value: any) {
    return await this.sender.send(STORE.SET_SESSION_STORAGE_ITEM, name, value)
  }

  onCookieChange(key: string, callback: StoreCallback): Function {
    return this.sender.subscribe(STORE.ON_COOKIE_CHANGE, key, callback)
  }

  onCookieStoreChange(key: string, callback: StoreCallback): Function {
    return this.sender.subscribe(STORE.ON_COOKIE_STORE_CHANGE, key, callback)
  }

  onLocalStorageChange(key: string, callback: StoreCallback): Function {
    return this.sender.subscribe(STORE.ON_LOCAL_STORAGE_CHANGE, key, callback)
  }

  onSessionStorageChange(key: string, callback: StoreCallback): Function {
    return this.sender.subscribe(STORE.ON_SESSION_STORAGE_CHANGE, key, callback)
  }
}

export interface IPage {
  getUrl: () => Promise<any>

  // event handlers
  onUrlChange: (filter: string, callback: (url: string) => void) => Function
}

class Page implements IPage {
  constructor(private sender: ISender) {}

  async getUrl() {
    return await this.sender.send(WINDOW.GET_URL)
  }

  onUrlChange(filter: string, callback: (url: string) => void) {
    return this.sender.subscribe(WINDOW.ON_URL_CHANGE, filter, callback)
  }
}

export interface ISender {
  id: string
  send: (path: string, ...args: any[]) => Promise<any>
  subscribe: (event: string, selector: string | { [key: string]: string }, callback: any) => () => void
  connect: (port: MessagePort) => void
  disconnect: () => void
  element: IElement
  form: IForm
  input: IInput
  network: INetwork
  store: IStore
  // page: IPage;
}

export class Sender implements ISender {
  id = createUniqueId()
  /** @private */
  dispatcher?: Window | Worker | MessagePort | BroadcastChannel
  /** @private */
  batchTimer: any = null
  /** @private */
  batchMessages: any = []
  /** @private */
  promises: Map<string, any> = new Map()
  /** @private */
  eventHandlers: Map<string, any> = new Map()

  element: IElement
  form: IForm
  input: IInput
  network: INetwork
  store: IStore
  page: IPage

  constructor() {
    this.element = new Element(this)
    this.form = new Form(this)
    this.input = new Input(this)
    this.network = new Network(this)
    this.store = new StoreSender(this)
    this.page = new Page(this)
  }

  // #postMessage(message: { id: string; path: string; data: any }) {
  //   if (this.dispatcher instanceof Window) {
  //     this.dispatcher.postMessage({ id, path: 'off.' + event, args: [target] }, '*')
  //   } else {
  //     this.dispatcher?.postMessage({ id, path: 'off.' + event, args: [target] })
  //   }
  // }

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
  batch(params: { id: string; type: string; path: string; args: any[] }) {
    this.batchMessages.push(params)
    clearTimeout(this.batchTimer)
    // if batch is full, send it max is 10
    if (this.batchMessages.length >= 10) {
      if (this.dispatcher instanceof Window) {
        this.dispatcher.postMessage({ batch: this.preparePayload(this.batchMessages) }, '*')
      } else {
        this.dispatcher?.postMessage({
          batch: this.preparePayload(this.batchMessages),
        })
      }
      this.batchMessages.length = 0
      return
    }
    this.batchTimer = setTimeout(() => {
      try {
        if (this.dispatcher instanceof Window) {
          this.dispatcher.postMessage({ batch: this.preparePayload(this.batchMessages) }, '*')
        } else {
          this.dispatcher?.postMessage({
            batch: this.preparePayload(this.batchMessages),
          })
        }
      } catch (e: any) {
        if (import.meta.env.DEV) {
          console.error(e.message)
        }
      }
      this.batchMessages.length = 0
    }, 1)
  }

  async send<T = any>(path = '', ...args: any[]) {
    const id = createUniqueId()
    const type = 'request'
    this.batch({ id, type, path, args })
    return this.createTimeoutPromise<T>(id, path)
  }

  subscribe(event: string, target: string | { [key: string]: string }, callback: any) {
    const id = createUniqueId()
    const type = 'subscription'
    this.eventHandlers.set(id, callback)
    this.batch({ id, type, path: event, args: [target] })
    return () => {
      this.eventHandlers.delete(id)
      setTimeout(() => {
        if (this.dispatcher instanceof Window) {
          this.dispatcher.postMessage({ id, path: 'off.' + event, args: [target] }, '*')
        } else {
          this.dispatcher?.postMessage({ id, path: 'off.' + event, args: [target] })
        }
      }, 0)
    }
  }

  connect(dispatcher: Window | Worker | MessagePort | BroadcastChannel) {
    if (dispatcher instanceof Window || dispatcher instanceof BroadcastChannel) {
      dispatcher.addEventListener('message', (e: any) => {
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
      })
      this.dispatcher = dispatcher as any
    } else {
      dispatcher.onmessage = e => {
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
      this.dispatcher = dispatcher
    }

    return new Promise(resolve => setTimeout(resolve, 0))
  }

  disconnect() {
    if (this.dispatcher) {
      // loop through all promises and reject them
      if (this.dispatcher instanceof Window) {
        this.dispatcher.postMessage({ id: this.id, type: 'request', path: CONNECTION.DISCONNECT }, '*')
      } else {
        this.dispatcher.postMessage({ id: this.id, type: 'request', path: CONNECTION.DISCONNECT })
      }
    }
  }

  static create(): ISender {
    return new Sender()
  }
}
