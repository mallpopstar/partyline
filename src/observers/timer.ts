import mitt from '../helpers/mitt'

const hasRequestIdleCallback = typeof window !== 'undefined' && 'requestIdleCallback' in window
const interval = hasRequestIdleCallback ? 1000 : 3000
const forceInterval = 3000
let initialized = false
const emitter = mitt()

export const onInterval = (callback: () => void) => {
  if (!initialized) {
    initialized = true
    setInterval(() => {
      if (hasRequestIdleCallback) {
        window.requestIdleCallback(
          () => {
            emitter.emit('change', null)
          },
          {
            timeout: forceInterval,
          }
        )
      } else {
        emitter.emit('change', null)
      }
    }, interval)
  }

  emitter.on('change', callback)

  return () => {
    emitter.off('change', callback)
  }
}
