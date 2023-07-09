import { query } from './query'

export interface IDocumentElement {
  add: (opts: { selector: string; html: string; position?: InsertPosition }) => void
  addToAll: (opts: { selector: string; html: string; position?: InsertPosition }) => void
  get: (opts: { selector: string }) => string
  getAll(opts: { selector: string }): string[]
  exists: (opts: { selector: string }) => boolean
  remove: (opts: { selector: string }) => void
  removeAll: (opts: { selector: string }) => void
  replace: (opts: { selector: string; html: string }) => void
  replaceAll: (opts: { selector: string; html: string }) => void
  addStyles: (opts: { selector: string; styles: string }) => void
  addStylesToAll: (opts: { selector: string; styles: string }) => void
  restoreStyles: (opts: { selector: string }) => void
  restoreStylesToAll: () => void
}

export class DocumentElement implements IDocumentElement {
  add(opts: { selector: string; html: string; position?: InsertPosition }): void {
    const element = document.querySelector(opts.selector)
    if (element) {
      element.insertAdjacentHTML(opts.position || 'beforeend', opts.html)
    }
  }

  addToAll(opts: { selector: string; html: string; position?: InsertPosition }): void {
    const elements = document.querySelectorAll(opts.selector)
    elements.forEach(element => {
      element.insertAdjacentHTML(opts.position || 'beforeend', opts.html)
    })
  }

  get(opts: { selector: string; deep?: boolean }): string {
    const element = query(window, opts.selector, opts.deep || false)
    if (element) {
      return element.outerHTML
    }
    if (element) {
      return element.outerHTML
    }
    return ''
  }

  getAll(opts: { selector: string }): string[] {
    const elements = document.querySelectorAll(opts.selector)
    const htmls: string[] = []
    elements.forEach(element => {
      htmls.push(element.outerHTML)
    })
    return htmls
  }

  exists(opts: { selector: string; deep?: boolean }): boolean {
    return !!query(window, opts.selector, opts.deep || false)
  }

  remove(opts: { selector: string }): void {
    const element = document.querySelector(opts.selector)
    if (element) {
      element.remove()
    }
  }

  removeAll(opts: { selector: string }): void {
    const elements = document.querySelectorAll(opts.selector)
    elements.forEach(element => {
      element.remove()
    })
  }

  replace(opts: { selector: string; html: string }): void {
    const element = document.querySelector(opts.selector)
    if (element) {
      element.innerHTML = opts.html || ''
    }
  }

  replaceAll(opts: { selector: string; html: string }): void {
    const elements = document.querySelectorAll(opts.selector)
    elements.forEach(element => {
      element.innerHTML = opts.html || ''
    })
  }

  addClasses(opts: { selector: string; classes: string | string[] }): void {
    const element = document.querySelector(opts.selector) as HTMLElement
    if (element) {
      element.classList.add(...(typeof opts.classes === 'string' ? opts.classes.split(' ') : opts.classes))
    }
  }

  addClassesToAll(opts: { selector: string; classes: string | string[] }): void {
    const elements = document.querySelectorAll(opts.selector) as NodeListOf<HTMLElement>
    elements.forEach(element => {
      element.classList.add(...(typeof opts.classes === 'string' ? opts.classes.split(' ') : opts.classes))
    })
  }

  addStyles(opts: { selector: string; styles: string | { [key: string]: string } }): void {
    try {
      const element = document.querySelector(opts.selector) as HTMLElement
      if (element) {
        // restore styles
        element.setAttribute('style', element.getAttribute('data-restore-styles') || '')
        // convert styles to object
        const styleObj = typeof opts.styles === 'string' ? JSON.parse(opts.styles) : opts.styles
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

  addStylesToAll(opts: { selector: string; styles: string | { [key: string]: string } }): void {
    const elements = document.querySelectorAll(opts.selector) as NodeListOf<HTMLElement>
    elements.forEach(element => {
      try {
        // restore styles
        element.setAttribute('style', element.getAttribute('data-restore-styles') || '')
        // convert styles to object
        const styleObj = typeof opts.styles === 'string' ? JSON.parse(opts.styles) : opts.styles
        // set original styles to data-restore-styles attribute
        element.setAttribute('data-restore-styles', element.getAttribute('style') || '')
        // set new styles
        Object.keys(styleObj).forEach(key => {
          element.style.setProperty(key, styleObj[key])
        })
      } catch (e) {}
    })
  }

  restoreStyles(opts: { selector: string }): void {
    const element = document.querySelector(opts.selector) as HTMLElement
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

  removeClasses(opts: { selector: string; classes: string }): void {
    const classes = opts.classes + ''
    const element = document.querySelector(opts.selector) as HTMLElement
    if (element) {
      element.classList.remove(...classes.split(' '))
    }
  }

  removeClassesToAll(opts: { selector: string; classes: string }): void {
    const classes = opts.classes + ''
    const elements = document.querySelectorAll(opts.selector) as NodeListOf<HTMLElement>
    elements.forEach(element => {
      element.classList.remove(...classes.split(' '))
    })
  }
}
