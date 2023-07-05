import { Receiver } from './receiver'

export { connect, onConnection } from './connection'

export { CONNECTION } from './consts/connection'
export { ELEMENT } from './consts/element'
export { ELEMENTS } from './consts/elements'
export { FORM } from './consts/form'
export { INPUT } from './consts/input'
export { NETWORK } from './consts/network'
export { STORE } from './consts/store'
export { WINDOW } from './consts/window'
export { Receiver } from './receiver'
export { Sender } from './sender'
export type { ISender } from './sender'
export { uuid } from './helpers/uuid'
export { $ } from './helpers/query'

export const receiver = () => new Receiver()
