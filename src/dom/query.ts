export const query = (targetWindow: Window, selector: string, deep = false): any => {
  try {
    const el = targetWindow.document.querySelector(selector)
    if (el) {
      return el
    }

    if (deep) {
      const frames = targetWindow.frames
      for (let i = 0; i < frames.length; i++) {
        const el = query(frames[i].window, selector, deep)
        if (el) {
          return el
        }
      }
    }
  } catch (error) {
    // logger.warn('could not access this window')
  }
}
