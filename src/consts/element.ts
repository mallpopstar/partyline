const ELEMENT_NS = 'element'

export const ELEMENT = {
  // Methods
  ADD: ELEMENT_NS + '.add',
  FIND: ELEMENT_NS + '.find',
  EXISTS: ELEMENT_NS + '.exists',
  REMOVE: ELEMENT_NS + '.remove',
  REPLACE: ELEMENT_NS + '.replace',
  ADD_STYLES: ELEMENT_NS + '.addStyles',
  RESTORE_STYLES: ELEMENT_NS + '.restoreStyles',
  ADD_CLASSES: ELEMENT_NS + '.addClasses',
  REMOVE_CLASSES: ELEMENT_NS + '.removeClasses',
  QUERY: ELEMENT_NS + '.query',

  // Events
  ON_EXISTS: ELEMENT_NS + '.onExists',
  ON_MUTATION: ELEMENT_NS + '.onMutation',
  ON_CLICK: ELEMENT_NS + '.onClick',
  ON_MOUSE_OVER: ELEMENT_NS + '.onMouseOver',
  ON_HOVER: ELEMENT_NS + '.onHover',
  ON_MOUSEDOWN: ELEMENT_NS + '.onMouseDown',
  ON_MOUSEUP: ELEMENT_NS + '.onMouseUp',
}
