import { query } from './query'

export interface IDocumentElement {
  add: (selector: string, html: string, position: InsertPosition) => void
  addToAll: (selector: string, html: string, position: InsertPosition) => void
  get: (selector: string) => string
  getAll(selector: string): string[]
  exists: (selector: string) => boolean
  remove: (selector: string) => void
  removeAll: (selector: string) => void
  replace: (selector: string, html: string) => void
  replaceAll: (selector: string, html: string) => void
  addStyles: (selector: string, styles: string) => void
  addStylesToAll: (selector: string, styles: string) => void
  restoreStyles: (selector: string) => void
  restoreStylesToAll: () => void
}

export class DocumentElement implements IDocumentElement {
  add(selector: string, html: string, position: InsertPosition): void {
    const element = document.querySelector(selector)
    if (element) {
      element.insertAdjacentHTML(position, html)
    }
  }

  addToAll(selector: string, html: string, position: InsertPosition): void {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      element.insertAdjacentHTML(position, html)
    })
  }

  get(selector: string, deep = false): string {
    const element = query(window, selector, deep)
    if (element) {
      return element.outerHTML
    }
    if (element) {
      return element.outerHTML
    }
    return ''
  }

  getAll(selector: string): string[] {
    const elements = document.querySelectorAll(selector)
    const htmls: string[] = []
    elements.forEach(element => {
      htmls.push(element.outerHTML)
    })
    return htmls
  }

  exists(selector: string | string[], deep = false): boolean {
    const selectors = Array.isArray(selector) ? selector : [selector]
    return selectors.some(s => !!query(window, s), deep)
  }

  remove(selector: string): void {
    const element = document.querySelector(selector)
    if (element) {
      element.remove()
    }
  }

  removeAll(selector: string): void {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      element.remove()
    })
  }

  replace(selector: string, html: string): void {
    const element = document.querySelector(selector)
    if (element) {
      element.innerHTML = html
    }
  }

  replaceAll(selector: string, html: string): void {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      element.innerHTML = html
    })
  }

  addStyles(selector: string, styles: string | { [key: string]: string }): void {
    try {
      const element = document.querySelector(selector) as HTMLElement
      if (element) {
        // restore styles
        element.setAttribute('style', element.getAttribute('data-restore-styles') || '')
        // convert styles to object
        const styleObj = typeof styles === 'string' ? JSON.parse(styles) : styles
        // set original styles to data-restore-styles attribute
        element.setAttribute('data-restore-styles', element.getAttribute('style') || '')
        // set new styles
        Object.keys(styleObj).forEach(key => {
          element.style.setProperty(key, styleObj[key])
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  addStylesToAll(selector: string, styles: string | { [key: string]: string }): void {
    const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>
    elements.forEach(element => {
      try {
        // restore styles
        element.setAttribute('style', element.getAttribute('data-restore-styles') || '')
        // convert styles to object
        const styleObj = typeof styles === 'string' ? JSON.parse(styles) : styles
        // set original styles to data-restore-styles attribute
        element.setAttribute('data-restore-styles', element.getAttribute('style') || '')
        // set new styles
        Object.keys(styleObj).forEach(key => {
          element.style.setProperty(key, styleObj[key])
        })
      } catch (e) {}
    })
  }

  restoreStyles(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      // check if data-restore-styles attribute exists
      if (!element.hasAttribute('data-restore-styles')) return
      element.setAttribute('style', element.getAttribute('data-restore-styles') || '')
    }
  }

  restoreStylesToAll(): void {
    const elements = document.querySelectorAll('[data-restore-styles]') as NodeListOf<HTMLElement>
    elements.forEach(element => {
      if (!element.hasAttribute('data-restore-styles')) return
      element.setAttribute('style', element.getAttribute('data-restore-styles') || '')
    })
  }

  removeClasses(selector: string, classes: string): void {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.classList.remove(...classes.split(' '))
    }
  }

  removeClassesToAll(selector: string, classes: string): void {
    const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>
    elements.forEach(element => {
      element.classList.remove(...classes.split(' '))
    })
  }
}
