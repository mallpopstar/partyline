import { Receiver } from "./receiver";

export { connect, onConnection } from "./connection";

export { Receiver } from "./receiver";
export { Sender } from "./sender";
export type {
  ISender,
  IElement,
  IForm,
  IInput,
  INetwork,
  IPage,
  IStore,
  ElementCallback,
  FormCallback,
  InputCallback,
  NetworkCallback,
  StoreCallback,
} from "./sender";
export { createUniqueId } from "./helpers/createUniqueId";
export { $ } from "./helpers/query";

export const receiver = () => new Receiver();
