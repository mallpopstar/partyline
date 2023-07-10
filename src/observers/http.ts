// @ts-nocheck
import mitt from '@/helpers/mitt'

let initialized = false
const emitter = mitt()

export const onHTTP = (callback: (response: any) => void) => {
  if (!initialized) {
    initialized = true
    const xhrInterceptor = xhr => {
      var XHR = XMLHttpRequest.prototype
      var open = XHR.open
      var send = XHR.send
      var setRequestHeader = XHR.setRequestHeader
      XHR.open = function (method, url) {
        this._method = method
        this._url = url
        this._requestHeaders = {}
        this._startTime = new Date().toISOString()
        return open.apply(this, arguments)
      }
      XHR.setRequestHeader = function (header, value) {
        this._requestHeaders[header] = value
        return setRequestHeader.apply(this, arguments)
      }
      XHR.send = function (postData) {
        this.addEventListener('load', function () {
          var endTime = new Date().toISOString()
          var url = this._url ? this._url.toLowerCase() : this._url
          if (url) {
            var data = this.response
            emitter.emit('change', { url, data })
          }
        })
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
