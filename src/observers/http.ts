// @ts-nocheck
import mitt from '../helpers/mitt'

let initialized = false
const emitter = mitt()

export const onHTTP = (callback: (response: any) => void) => {
  if (!initialized) {
    initialized = true
    const xhrInterceptor = xhr => {
      const XHR = XMLHttpRequest.prototype
      const open = XHR.open
      const send = XHR.send
      const setRequestHeader = XHR.setRequestHeader
      XHR.open = function (method, url) {
        this._method = method
        this._url = url
        this._requestHeaders = {}
        this._startTime = new Date().toISOString()
        // eslint-disable-next-line prefer-rest-params
        return open.apply(this, arguments)
      }
      XHR.setRequestHeader = function (header, value) {
        this._requestHeaders[header] = value
        // eslint-disable-next-line prefer-rest-params
        return setRequestHeader.apply(this, arguments)
      }
      XHR.send = function (postData) {
        this.addEventListener('load', function () {
          const endTime = new Date().toISOString()
          const url = this._url ? this._url.toLowerCase() : this._url
          if (url) {
            const data = this.response
            emitter.emit('change', { url, data })
          }
        })
        // eslint-disable-next-line prefer-rest-params
        return send.apply(this, arguments)
      }
    }
    xhrInterceptor(XMLHttpRequest)
  }
  emitter.on('change', callback)
  return () => {
    emitter.off('change', callback)
  }
}
