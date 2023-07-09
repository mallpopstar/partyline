const PORT_CONNECTION = 'port.connection'

export const connect = (target: any, port: MessagePort) => {
  try {
    if (target instanceof Worker) {
      target.postMessage({ type: PORT_CONNECTION }, [port])
      return
    }

    if (target instanceof Window) {
      target.postMessage({ type: PORT_CONNECTION }, '*', [port])
      return
    }

    if ('postMessage' in target) {
      target.postMessage({ type: PORT_CONNECTION }, '*', [port])
      return
    }

    if ('connect' in target) {
      target.connect(port)
      return
    }
  } catch (e) {
    console.error(e)
  }
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const onConnection = (target: Window, handler: (port: MessagePort) => void) => {
  const messageHandler = (event: MessageEvent) => {
    const { data, ports } = event
    debugger
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

