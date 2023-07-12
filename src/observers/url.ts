// import { debounce } from '../utils/debounce'
import mitt from '../helpers/mitt'

let initialized = false
const emitter = mitt()
let timer: any

function listen() {
  let lastUrl = window.location.href
  clearTimeout(timer)
  timer = setInterval(() => {
    if (lastUrl !== window.location.href) {
      emitter.emit('change', window.location.href)
    }
    lastUrl = window.location.href
  }, 500)
}

export const onUrlChange = (callback: () => void) => {
  if (!initialized) {
    initialized = true
    listen()
  }

  emitter.on('change', callback)

  return () => {
    emitter.off('change', callback)
  }
}

// const handler = debounce((evt: HashChangeEvent | PopStateEvent) => {
//   emitter.emit('change', evt)
// }, 250)

// export const onUrlChange = (callback: () => void) => {
//   if (!initialized) {
//     initialized = true
//     window.addEventListener('hashchange', handler, true)
//     window.addEventListener('popstate', handler, true)
//   }

//   emitter.on('change', callback)

//   return () => {
//     window.removeEventListener('hashchange', handler, true)
//     window.removeEventListener('popstate', handler, true)
//   }
// }
