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
			item.bounds.topLeft,
			item.bounds.topRight,
			item.bounds.bottomRight
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
			guide: true,
		})		
	}

	handleMouseDown(event) {
		let handle

		handle = this.hitTest(event.point, { bounds: true, tolerance: 5 })
		if (handle) {
			this.initTransform(this.transformScale, event, handle)
			return true
		}

		handle = this.hitTest(event.point, { bounds: true, tolerance: 20 })
		if (handle) {
			if (['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(handle.name)) {
				this.initTransform(this.transformRotate, event, handle)
				return true
			}		
		}

		let hit = this.item.hitTest(event.point, { stroke: true, fill: true, segment: true, tolerance: 5 })
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

	initTransform(transformFn, event, handle) {
		this.set({
			transformFn,
			handle,
			oppositeHandle: handle ? this.getOppositeHandle(handle) : null,
			delta: this.position.subtract(event.point),
			startRotation: this.rotation,
		})	

		this.oppositeHandle && (this.pivot = this.oppositeHandle.point)
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

		if (distanceX === 0) return

		this.bounds.width = newWidth

		if (distanceX < 0)
			this.pivot = this.bounds.rightCenter
		else
			this.pivot = this.bounds.leftCenter

		this.position = this.oppositeHandle.point
	}

	transformScaleY(event) {
		const distanceY = event.point.y - this.oppositeHandle.point.y
		const newHeight = Math.abs(distanceY)

		if (distanceY === 0) return

		this.bounds.height = newHeight

		if (distanceY < 0)
			this.pivot = this.bounds.bottomCenter
		else
			this.pivot = this.bounds.topCenter
			
		this.position = this.oppositeHandle.point
	}

	transformScaleXY(event) {
		const newBounds = new Rectangle(this.oppositeHandle.point, event.point)

		// if the size is zero the item will disappear from the canvas
		// even if we change its size again
		if (newBounds.size.width <= 0 || newBounds.size.height <= 0)
			return false

		this.bounds = newBounds	
	}

	transformRotate(event) {
		this.pivot = this.bounds.center
		this.rotation = this.pivot.subtract(event.point).angle - this.delta.angle + this.startRotation
	}

	updateItem() {
		this.item.pivot = this.pivot
		this.item.bounds = this.bounds
		this.item.rotation = this.rotation
		this.item.emit('change')
	}
}

export default Transformbox