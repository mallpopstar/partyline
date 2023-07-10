const PORT_CONNECTION = 'port.connection'

export const sendMessagePort = (target: any, port: MessagePort) => {
  try {
    if (target instanceof Worker) {
      return target.postMessage({ type: PORT_CONNECTION }, [port])
    }

    if (target instanceof Window) {
      return target.postMessage({ type: PORT_CONNECTION }, '*', [port])
    }

    if ('postMessage' in target) {
      return target.postMessage({ type: PORT_CONNECTION }, '*', [port])
    }

    if ('connect' in target) {
      return target.connect(port)
    }
  } catch (e) {
    console.error(e)
  }
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const onMessagePort = (target: Window, handler: (port: MessagePort) => void) => {
  const messageHandler = (event: MessageEvent) => {
    const { data, ports } = event
    if (ports && ports.length > 0) {
      target.removeEventListener('message', messageHandler)
      if (data.type === PORT_CONNECTION) {
        if (ports.length > 0) {
          const port = ports[0]
          handler(port)
        }
      }
    }
  }
  target.addEventListener('message', messageHandler)
}
