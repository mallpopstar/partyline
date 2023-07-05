import mitt from '@/helpers/mitt'
const emitter = mitt()

export const onWebSocket = (callback: (response: any) => void) => {
  // TODO: Implement websocket interception
  const originalWebSocket = global.WebSocket

  global.WebSocket = function (url: string, protocols?: string | string[] | undefined) {
    console.log('Intercepting WebSocket request:', url)

    const socket = new originalWebSocket(url, protocols)

    socket.addEventListener('open', function (event: any) {
      console.log('Intercepting WebSocket connection', event)
    })

    socket.addEventListener('message', function (event: any) {
      console.log('Intercepting WebSocket message:', event.data)
      emitter.on('change', callback)
    })

    socket.addEventListener('close', function (event: any) {
      console.log('Intercepting WebSocket connection close', event.data)
    })

    return socket
  } as any
}
