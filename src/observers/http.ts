// @ts-nocheck
import mitt from '@/helpers/mitt'

let initialized = false
const emitter = mitt()

export const onHTTP = (callback: (response: any) => void) => {
  if (!initialized) {
    // console.log('🆘 🆘 🆘 Initializing HTTP observer 🆘 🆘 🆘', window)
    // console.log('🆘 🆘 🆘 Initializing HTTP observer 🆘 🆘 🆘', window.XMLHttpRequest)
    // initialized = true
    // var open = window.XMLHttpRequest.prototype.open

    // var send = window.XMLHttpRequest.prototype.send
    // function openReplacement(method, url, async, user, password) {
    //   this.requestUrl = url
    //   console.log('Intercepting XHR request:', url)
    //   return open.apply(this, arguments)
    // }
    // function sendReplacement(data) {
    //   if (this.onreadystatechange) {
    //     this._onreadystatechange = this.onreadystatechange
    //   }
    //   /**
    //    * PLACE HERE YOUR CODE WHEN REQUEST IS SENT
    //    */
    //   this.onreadystatechange = onReadyStateChangeReplacement

    //   this.addEventListener('load', function () {
    //     console.log('Intercepting XHR response:', this.requestUrl, this.responseText)
    //     emitter.emit('change', {
    //       url: this.requestUrl,
    //       text: this.responseText,
    //     })
    //   })

    //   return send.apply(this, arguments)
    // }
    // function onReadyStateChangeReplacement() {
    //   /**
    //    * PLACE HERE YOUR CODE FOR READYSTATECHANGE
    //    */
    //   if (this._onreadystatechange) {
    //     return this._onreadystatechange.apply(this, arguments)
    //   }
    // }
    // window.XMLHttpRequest.prototype.open = openReplacement
    // window.XMLHttpRequest.prototype.send = sendReplacement

    // emitter.on('change', callback)

    // return () => {
    //   // SHOULD WE REPLACE THE ORIGINAL HTTP?
    //   window.XMLHttpRequest.prototype.open = open
    //   window.XMLHttpRequest.prototype.send = send
    // }

    ;(function (xhr) {
      console.log('start intercept')
      console_log('start intercept')
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
          var myUrl = this._url ? this._url.toLowerCase() : this._url
          if (myUrl) {
            // if (myUrl.indexOf('https://i.instagram.com/api/v1') !== -1) {
            console.log(myUrl)
            var responseData = this.response
            console.log(responseData)
            emitter.on('change', () => callback(responseData))
            // document.dispatchEvent(new CustomEvent('yourCustomEvent', { url: myUrl, detail: responseData }))
            // }
          }
        })
        return send.apply(this, arguments)
      }
    })(XMLHttpRequest)
  }
}
