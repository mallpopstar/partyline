import mitt from '@/helpers/mitt'

let initialized = false
const emitter = mitt()

export const onFetch = (callback: (response: any) => void) => {
  emitter.on('change', callback)

  if (!initialized) {
    initialized = true

    // Fetch interceptor
    const originalFetch = window.fetch

    window.fetch = async function (url, init) {
      // Do something before the request is made
      // console.log('Intercepting fetch request')

      // Make the request
      return originalFetch(url, init).then(response => {
        // Do something with the response
        // console.log('Intercepting fetch response')

        const clonedResponse = response.clone()
        if (clonedResponse.ok) {
          setTimeout(async () => {
            try {
              const data = await clonedResponse.json()
              emitter.emit('change', { url: clonedResponse.url, data })
            } catch (e) {
              console.log('Error parsing response', e)
            }
          }, 0)
        }

        return response
      })
    }

    return () => {
      // SHOULD WE REPLACE THE ORIGINAL FETCH?
      // window.fetch = originalFetch
      emitter.off('change', callback)
    }
  }

  return () => {
    emitter.all.clear()
  }
}
