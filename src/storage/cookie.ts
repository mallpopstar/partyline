export class Cookie implements Storage {
  #converter: { read: (value: string) => string; write: (value: string) => string }
  #path: string = '/'
  #defaultAttributes = {
    path: this.#path,
  }

  constructor() {
    this.#converter = {
      read: function (value: string) {
        if (value[0] === '"') {
          value = value.slice(1, -1)
        }
        return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
      },
      write: function (value: string) {
        return encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent)
      },
    }
  }

  #assign: (...args: any[]) => any = function (target: any/*, ...args: any[]*/) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i]
      for (var key in source) {
        target[key] = source[key]
      }
    }
    return target
  }

  #getCookie(key: string) {
    // return null
    if (typeof document === 'undefined' || (arguments.length && !key)) {
      return null
    }

    // To prevent the for loop in the first place assign an empty array
    // in case there are no cookies at all.
    var cookies = document.cookie ? document.cookie.split('; ') : []
    var jar: any = {}
    for (var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split('=')
      var value = parts.slice(1).join('=')

      try {
        var foundKey = decodeURIComponent(parts[0])
        jar[foundKey] = this.#converter.read(value)
        // jar[foundKey] = this.converter.read(value, foundKey)

        if (key === foundKey) {
          break
        }
      } catch (e) {}
    }

    return key ? jar[key] : jar
  }

  #setCookie(key: string, value: string, attributes?: any) {
    attributes = this.#assign({}, this.#defaultAttributes, attributes)

    if (typeof attributes.expires === 'number') {
      attributes.expires = new Date(Date.now() + attributes.expires * 864e5)
    }
    if (attributes.expires) {
      attributes.expires = attributes.expires.toUTCString()
    }

    key = encodeURIComponent(key)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape)

    var stringifiedAttributes = ''
    for (var attributeName in attributes) {
      if (!attributes[attributeName]) {
        continue
      }

      stringifiedAttributes += '; ' + attributeName

      if (attributes[attributeName] === true) {
        continue
      }

      // Considers RFC 6265 section 5.2:
      // ...
      // 3.  If the remaining unparsed-attributes contains a %x3B (";")
      //     character:
      // Consume the characters of the unparsed-attributes up to,
      // not including, the first %x3B (";") character.
      // ...
      stringifiedAttributes += '=' + attributes[attributeName].split(';')[0]
    }

    return (document.cookie = key + '=' + this.#converter.write(value) + stringifiedAttributes)
  }

  get length(): number {
    return document.cookie.split(';').length
  }

  clear(): void {
    this.setItem('', '')
  }

  getItem(key: string): string | null {
    return this.#getCookie(key)
  }

  key(index: number): string | null {
    return document.cookie.split(';')[index].split('=')[0]
  }

  removeItem(key: string): void {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }

  setItem(key: string, value: string): void {
    this.#setCookie(key, value)
  }
}
