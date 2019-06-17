import autobind from '../utils/class-autobind'

export default class Cluster {
  constructor (boxes, {
    noOOB = true,
    debug = false,
    maxSolverIterations = 999,
    pushBehavior = 'both' // 'horizontal', 'vertical' or 'both'
  } = {}) {
    this.boxes = boxes

    this.noOOB = noOOB
    this.debug = debug
    this.maxSolverIterations = maxSolverIterations
    this.pushBehavior = pushBehavior

    this.update()
    autobind(this)
  }

  freeze () {
    if (this.frozen) return
    this.frozen = true
    this.boxes.forEach(box => box.freeze())
  }

  unfreeze () {
    if (!this.frozen) return
    this.frozen = false
    this.boxes.forEach(box => box.unfreeze())
  }

  update () {
    if (this.frozen) return
    this._updateBoundingBox()
    if (this.noOOB) this.ensureInBounds()
  }

  _updateBoundingBox () {
    const bb = Cluster.computeBoundingBox(this.boxes)
    Object.entries(bb).forEach(([key, value]) => {
      this[key] = value
    })
  }

  static computeBoundingBox (boxes) {
    let x = 0
    let y = 0
    let width = 0
    let height = 0

    boxes.forEach(box => {
      if (!box.boundingBox) box.update()

      x = Math.min(x, box.xmin)
      y = Math.min(y, box.ymin)
      width = Math.max(width, box.xmax)
      height = Math.max(height, box.ymax)
    })

    return {
      x,
      y,
      width,
      height,
      xmin: x,
      xmax: x + width,
      ymin: y,
      ymax: y + height
    }
  }

  // TODO: for now, only top and left boundaries are taken in account
  ensureInBounds () {
    const dx = -Math.min(0, this.xmin)
    const dy = -Math.min(0, this.ymin)

    if (!dx && !dy) return
    this.boxes.forEach(box => box.move(box.x + dx, box.y + dy))
    this._updateBoundingBox()
  }

  // NOTE: Cluster.pack can punctually take options
  // different than thoses passed at Cluster instanciation
  pack ({
    maxSolverIterations = this.maxSolverIterations,
    debug = this.debug,
    pushBehavior = this.pushBehavior
  } = {}) {
    // Sort all boxes from most recent moved to oldest move
    this.boxes = this.boxes.sort((a, b) => b.lastMove - a.lastMove)

    this.boxes.forEach((box, index) => {
      // As we want to preserve the frozen state upon packing,
      // we ensure that the box will stay where it has been frozen
      if (box.frozen) box.move(box.frozenBoundingBox.x, box.frozenBoundingBox.y)
      else box.update()

      if (debug) {
        box.packingOrder = index
        box.element.setAttribute('data-packing-order', index)
      }
    })

    let _itercount = 0
    let woke = this.boxes.filter(box => this.boxes.some(box.collide))
    while (woke.length && ++_itercount < maxSolverIterations) {
      const current = woke.shift()
      const colliding = this.boxes.filter(current.collide)
      if (!colliding || !colliding.length) continue

      colliding.forEach(box => {
        const delta = current.delta(box)
        const horizontal = (pushBehavior === 'horizontal')
          ? true
          : (pushBehavior === 'vertical')
            ? false
            : Math.abs(delta[0]) >= Math.abs(delta[1])

        if (debug) {
          console.log({
            current: current.packingOrder,
            collide: box.packingOrder,
            delta,
            direction: horizontal ? 'horizontal' : 'vertical'
          })
        }

        if (horizontal && delta[0] <= 0) box.move(current.xmax, box.y)
        if (horizontal && delta[0] > 0) box.move(current.xmin - box.width, box.y)
        if (!horizontal && delta[1] <= 0) box.move(box.x, current.ymax)
        if (!horizontal && delta[1] > 0) box.move(box.x, current.ymin - box.height)
        woke.push(box)
      })
    }

    this.update()
  }
}
