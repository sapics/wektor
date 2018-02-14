import paper from 'paper'
import { isFunction, toCamelCase } from '../../utils.js'

const {Path, Rectangle} = paper

class Transformbox extends paper.Path {
	constructor(item) {
		super()

		// temporarily rotate the item to 0 so we can retrieve it's bounds correctly ...
		const rotation = item.rotation
		item.rotation = 0

		const segments = [
			item.bounds.bottomLeft,
			item.bounds.leftCenter,
			item.bounds.topLeft,
			item.bounds.topCenter,
			item.bounds.topRight,
			item.bounds.rightCenter,
			item.bounds.bottomRight,
			item.bounds.bottomCenter,
		]

		// ... and rotate it back
		item.rotation = rotation

		this.set({ 
			segments, 
			item, 
			pivot: item.pivot,			
			rotation,
			selected: true, 
			closed: true,
			strokeWidth: 0,
			applyMatrix: false,
			iterable: false,
			fillColor: new paper.Color(1, 0, 0, 0.0000001),
			cursor: 'move',
		})	

		this.on({
			mouseenter: event => { this.hover = true },
			mouseleave: event => { this.hover = false }
		})
	}

	handleMouseDown(event) {
		let handle

		handle = this.hitTest(event.point, { bounds: true, tolerance: 5 })
		if (handle) {
			this.initTransform(this.transformScale, event, handle)
			return true
		}

		// handle = this.hitTest(event.point, { bounds: true, tolerance: 20 })
		// if (handle) {
		// 	if (['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(handle.name)) {
		// 		this.initTransform(this.transformRotate, event, handle)
		// 		return true
		// 	}		
		// }

		let hit = this.hitTest(event.point, { stroke: true, fill: true })
		if (hit) {
			this.initTransform(this.transformMove, event)
			return true
		}

		return false
	}

	handleMouseDrag(event) {
		if (this.transformFn) {
			this.transformFn(event)
			this.updateItem()
		}
	}

	handleMouseMove(event) {
		const handle = this.hitTest(event.point, { bounds: true, tolerance: 5 })
		if (handle)
			this.cursor = this.getHandleCursor(handle)
		else if (this.hover)
			this.cursor = 'move'
		else
			this.cursor = null
	}	

	initTransform(transformFn, event, handle) {
		this.set({
			transformFn,
			handle,
			oppositeHandle: handle ? this.getOppositeHandle(handle) : null,
			delta: this.position.subtract(event.point),
			startRotation: this.rotation,
		})
	}

	getHandleCursor(handle) {
		const map = {
			'top-left': 'nwse-resize',
			'top-center': 'ns-resize',
			'top-right': 'nesw-resize',
			'bottom-left': 'nesw-resize',
			'bottom-center': 'ns-resize',
			'bottom-right': 'nwse-resize',
			'left-center': 'ew-resize',
			'right-center': 'ew-resize'			
		}
		return map[handle.name]
	}

	getOppositeHandle(handle) {
		const map = {
			'top-left': 'bottom-right',
			'top-center': 'bottom-center',
			'top-right': 'bottom-left',
			'bottom-left': 'top-right',
			'bottom-center': 'top-center',
			'bottom-right': 'top-left',
			'left-center': 'right-center',
			'right-center': 'left-center'
		}
		const name = map[handle.name]
		return {
			name,
			point: this.bounds[toCamelCase(name)]
		}
	}

	transformMove(event) {
		this.position = event.point.add(this.delta)
	}

	transformScale(event) {
		if (!this.handle) return

		switch (this.handle.name) {
			case 'top-center':
			case 'bottom-center':
				this.transformScaleY(event)
				break

			case 'left-center':
			case 'right-center':
				this.transformScaleX(event)
				break

			case 'top-left':
			case 'top-right':
			case 'bottom-left':
			case 'bottom-right':
				this.transformScaleXY(event)
		}
	}

	transformScaleX(event) {
		const distanceX = event.point.x - this.oppositeHandle.point.x
		const newWidth = Math.abs(distanceX)

		if (newWidth < 2) return

		const newBounds = new paper.Rectangle({
			from: {
				x: this.oppositeHandle.point.x,
				y: this.bounds.topLeft.y
			},
			to: {
				x: event.point.x,
				y: this.bounds.bottomRight.y
			},
		})	

		this.bounds = newBounds
	}

	transformScaleY(event) {
		const distanceY = event.point.y - this.oppositeHandle.point.y
		const newHeight = Math.abs(distanceY)
		
		if (newHeight < 2) return

		const newBounds = new paper.Rectangle({
			from: {
				x: this.bounds.bottomRight.x,
				y: this.oppositeHandle.point.y
			},
			to: {
				x: this.bounds.topLeft.x,
				y: event.point.y
			},
		})

		this.bounds = newBounds		
	}

	transformScaleXY(event) {
		const newBounds = new Rectangle(this.oppositeHandle.point, event.point)

		// if the size is zero the item will disappear from the canvas
		// even if we change its size again
		if (newBounds.size.width <= 2 || newBounds.size.height <= 2)
			return false

		this.bounds = newBounds	
	}

	transformRotate(event) {
		this.pivot = this.bounds.center
		this.rotation = this.pivot.subtract(event.point).angle - this.delta.angle + this.startRotation
	}

	set cursor(cursor) {
		this._cursor = cursor
		this.activateCursor(cursor)
	}

	get cursor() {
		return this._cursor
	}

	activateCursor(cursor) {
		document.body.style.cursor = cursor || null
	}	

	updateItem() {
		this.item.pivot = this.pivot
		this.item.bounds = this.bounds
		this.item.rotation = this.rotation
		this.item.emit('change')
	}

	remove() {
		this.cursor = null
		super.remove()
	}
}

export default Transformbox