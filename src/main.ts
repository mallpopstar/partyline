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
    console.log('response', response)
  })

  console.log('listening for clicks on ".myclass"')
  const offClick = s.element.onClick('.myclass', html => {
    console.log('element clicked', html)
    s.element.remove({
      selector: '.myclass',
    })
    offClick()
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
}

main()
