import { Sender } from './sender'
import { receiver } from '.'

async function main() {
  const m = new MessageChannel()
  // const b = new BroadcastChannel('test')
  const r = receiver()
  r.connect(m.port1)
  // r.connect(window)
  // r.connect(b)
  r.registerPath('hello', (requestId, message) => {
    console.log('==>', requestId, message)
    return { message: '¡Hola de vuelta a ti!' }
  })

  const s = new Sender()
  s.connect(m.port2)
  // s.connect(window)
  // s.connect(b)
  s.page.onUrlChange('', url => {
    console.log('url changed', url)
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
  })

  s.element.replace({
    selector: '.myclass',
    html: 'Button',
  })

  s.element.addClasses({
    selector: '.myclass',
    classes: ['button'],
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
}

main()
