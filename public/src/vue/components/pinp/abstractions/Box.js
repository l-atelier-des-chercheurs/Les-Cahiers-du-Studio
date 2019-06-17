import Draggabilly from 'draggabilly'
import autobind from '../utils/class-autobind'

export default class Box {
  constructor (element, {
    container = document.documentElement,
    grid = [1, 1],
    debug = false
  } = {}) {
    if (!element) {
      throw new TypeError(`Box constructor expects HTMLElement, ${typeof element} given`)
    }

    this.grid = grid
    this.debug = debug

    this.element = element
    this.element.style.position = 'absolute'
    this.container = container

    this.lastMove = Date.now()

    this.dragInstance = new Draggabilly(element, { grid, containment: container })
    this.dragInstance.on('dragStart', () => { this.isDragging = true })
    this.dragInstance.on('dragMove', () => { this.lastMove = Date.now() })
    this.dragInstance.on('dragEnd', () => { this.isDragging = false })

    autobind(this)
  }

  destroy () {
    this.dragInstance.destroy()
  }

  collide (box) {
    return this.collideOnXAxis(box) && this.collideOnYAxis(box)
  }

  delta (box) {
    return [
      this.center.x - box.center.x,
      this.center.y - box.center.y
    ]
  }

  freeze () {
    if (this.frozen) return
    this.frozen = true
    this.frozenBoundingBox = this._computeBoundingBox()
    if (this.debug) this.element.classList.add('frozen')
  }

  unfreeze () {
    this.frozen = false
    if (this.debug) this.element.classList.remove('frozen')
  }

  collideOnYAxis (box) {
    if (!box) return
    if (box === this) return false

    return this.xmax > box.xmin && this.xmin < box.xmax
  }

  collideOnXAxis (box) {
    if (!box) return
    if (box === this) return false

    return this.ymax > box.ymin && this.ymin < box.ymax
  }

  move (x, y) {
    if (this.isDragging) return

    this.dragInstance.setPosition(x, y)
    this.lastMove = Date.now()
    this.update()
  }

  update () {
    this.boundingBox = this._computeBoundingBox()

    // NOTE: in addition to Box.boundingBox, all boundingBox keys are accessible directly via Box[key]
    Object.keys(this.boundingBox).forEach(key => {
      this[key] = this.boundingBox[key]
    })
  }

  // WARNING: due to Element.getBoundingClientRect causing layout repaint,
  // Box.boundingBox is memoized and only recomputed on Box.update call
  _computeBoundingBox () {
    const { width, height } = this.element.getBoundingClientRect()
    const x = this.dragInstance.position.x
    const y = this.dragInstance.position.y
    return Object.freeze({
      x,
      y,
      width,
      height,
      xmin: x,
      ymin: y,
      xmax: x + width,
      ymax: y + height,
      center: {
        x: x + width / 2,
        y: y + height / 2
      }
    })
  }
}
