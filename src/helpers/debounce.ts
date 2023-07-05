export const debounce = (func: Function, timeout = 0) => {
  let timer: number
  return (...args: any) => {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      func(...args)
    }, timeout)
  }
}
