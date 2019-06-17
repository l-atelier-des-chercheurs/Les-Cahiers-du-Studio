export default o => (typeof window.HTMLElement === 'object')
  ? o instanceof window.HTMLElement
  : o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
