export function getValue(path: string, target?: any) {
  try {
    const pathArray = path?.split('.')
    let current = target || globalThis
    for (let i = 0; i < pathArray.length; i++) {
      const key = pathArray[i]
      if (!current[key]) {
        return undefined
      }
      current = current[key]
    }
    return current
  } catch (e: any) {
    return e.message
  }
}
