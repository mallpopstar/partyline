import { Receiver } from './receiver'
import { Sender } from './sender'

// function createWebWorker(workerFunction: () => void) {
//   const blob = new Blob([`(${workerFunction.toString()})()`], {
//     type: 'text/javascript',
//   })
//   const url = URL.createObjectURL(blob)
//   return new Worker(url)
// }

async function main() {
  const dispatchType: 'window' | 'broadcast' | 'message' = 'message'
  const m = new MessageChannel()
  const b = new BroadcastChannel('test')
  const r = new Receiver()
  // @ts-ignore
  if (dispatchType === 'message') {
    r.connect(m.port1)
    // @ts-ignore
  } else if (dispatchType === 'window') {
    r.connect(window)
    // @ts-ignore
  } else if (dispatchType === 'broadcast') {
    r.connect(b)
  }

  r.onRequest('hello', (requestId, message) => {
    console.log('==>', requestId, message)
    return { message: '¡Hola de vuelta a ti!' }
  })

  const s = new Sender()
  // @ts-ignore
  if (dispatchType === 'message') {
    s.connect(m.port2)
    // @ts-ignore
  } else if (dispatchType === 'window') {
    s.connect(window)
    // @ts-ignore
  } else if (dispatchType === 'broadcast') {
    s.connect(b)
  }

  s.input.onInput('[type="text"]', data => {
    console.log('input', data)
  })

  s.form.onSubmit('form', data => {
    console.log('form submitted', data)
  })

  s.network.onFetch('', data => {
    console.log('¡FETCH! handler', data)
  })

  s.network.onHTTP('', data => {
    console.log('¡HTTP! handler', data)
  })

  s.store.onLocalStorageChange('counter', (data: string) => {
    console.log('local storage change', data)
  })

  s.element.onMutate('#counter', data => {
    console.log('mutation', data)
  })

  s.element.onExists('.myclass', data => {
    console.log('exists change', data)
  })

  s.page.onUrlChange('', url => {
    console.log('url changed ->', url)
  })

  s.element.add({
    selector: 'body',
    html: '<div class="myclass">Label</div>',
  })

  s.element.addStyles({
    selector: '.myclass',
    styles: {
      color: 'red',
    },
    applyToAll: true,
  })

  s.element.replace({
    selector: '.myclass',
    html: 'Button',
    applyToAll: true,
  })

  s.element.addClasses({
    selector: '.myclass',
    classes: ['button'],
    applyToAll: true,
  })

  s.sendRequest('hello', { message: '¡Hola tú!' }).then(response => {
    console.log('custom response', response)
  })

  console.log('listening for clicks on ".myclass"')
  const offClick = s.element.onClick('.myclass', html => {
    console.log('element clicked', html)
    s.element.remove({
      selector: '.myclass',
    })
    offClick()
  })

  // using the button increment the counter
  const button = document.getElementById('inc') as HTMLButtonElement
  const counter = document.getElementById('counter') as HTMLSpanElement
  let count = 0
  button.addEventListener('click', () => {
    count++
    counter.innerHTML = count + ''
    localStorage.setItem('counter', count + '')
  })

  // prevent the form from submitting
  const form = document.getElementById('form') as HTMLFormElement
  form.addEventListener('submit', e => {
    e.preventDefault()
  })

  // const w = createWebWorker(() => {
  //   console.log('worker started')
  //   this.onmessage = event => {
  //     // console.log('!!worker message!!', event)
  //     const [port] = event.ports as MessagePort[]
  //     // const s = new Sender()
  //     // s.connect(port)

  //     // const off = s.page.onUrlChange('', url => {
  //     //   console.log('url changed ->', url)
  //     //   off()
  //     // })
  //     port.postMessage({path: 'page.onUrlChange', filter: ''})
  //   }
  //   // this.postMessage('port', [m.port])
  // })
  // w.onmessage = event => {
  //   console.log('worker message', event.data)
  // }
  // w.postMessage('port', [m.port2])
  // https://catfact.ninja/fact
  setTimeout(() => {
    fetch('https://catfact.ninja/fact')
      .then(response => response.json())

    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
    const xhr = new XMLHttpRequest()
    xhr.open('GET', 'https://catfact.ninja/fact')
    xhr.send()
    // xhr.onreadystatechange = () => {
    //   if (xhr.readyState === 4 && xhr.status === 200) {
    //     // 4 = DONE
    //     console.log('xhr response', xhr.responseText)
    //   }
    // }
  }, 1000)
}

main()
