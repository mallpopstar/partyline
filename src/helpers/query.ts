const generatePathFromProxy = (_0: any): any => {
  const pathParts: string[] = []

  const handler: ProxyHandler<any> = {
    get(_0, propKey) {
      pathParts.push(propKey.toString())
      return new Proxy(() => {}, handler)
    },
    apply(_0, _1, argArray) {
      const formattedArgs = argArray.map(arg => JSON.stringify(arg)).join(', ')
      const lastPart = pathParts[pathParts.length - 1]
      if (lastPart === 'toString') {
        return pathParts.slice(0, -1).join('.')
      }
      pathParts[pathParts.length - 1] = `${lastPart}(${formattedArgs})`
      return new Proxy(() => {}, handler)
    },
    // Add a valueOf() method to return the string path when the proxy is coerced to a primitive value
    // valueOf() {
    //   return pathParts.join('.')
    // },
  }
  return new Proxy(() => {}, handler)
}

export const $ = (html: string) => {
  const hostProxy = new Proxy(() => {}, {})
  const via = generatePathFromProxy(hostProxy)
  return via.$(html) as Document
}
