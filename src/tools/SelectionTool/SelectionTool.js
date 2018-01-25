import paper from 'paper'
import BaseTool from '../BaseTool.js'
import Transformbox from './Transformbox.js'
import specDefault from './specDefault.js'

const {Key, Segment, Point} = paper

class SelectionTool extends BaseTool {
	constructor(target, spec) {
		spec = Object.assign({}, specDefault, spec)
		super(target, spec)
	}

	onActivate() {
		this.item = this.target.getItem({
			selected: true,
			match: ({item}) => item && item.data.iterable !== false,
		})
	}

	onDeactivate() {
		this.releaseTransformbox()
	}

	checkTransformboxEvents(event) {
		if (!this.item) return
		const transformbox = this.item.data.transformbox

		return transformbox.event(event)
	}

	emitChange(payload) {
		this.item && this.item.emit('change', payload)		
	}

	onMouseDown(event) {
		this.mousedown = null
		this.action = null

		if (this.transformbox) {
			const couldHandleMouseDown = this.transformbox.handleMouseDown(event)
			if (!couldHandleMouseDown)
				this.item && this.releaseItem()
			return
		}

		// catch right click
		if (event.event.button === 2)
			return

		// catch double click
		if (event.event.detail === 2) {
			this.onDoubleClick(event)
			return
		}

		const hitResultSelected = this.getHit(this.target, event, { 
			match: ({item}) => item.selected && item.data.iterable !== false,
			segments: true,
			handles: true,
		})

		const hitResult = hitResultSelected || this.getHit(this.target, event, { 
			fill: true, 
			stroke: true, 
			segments: true, 
			handles: true,
			match: ({item}) => item.data.iterable !== false,
		})

		if (!event.modifiers.shift)
			this.target.deselectAll()

		if (!hitResult) {
			this.item && this.releaseItem()
			this.mousedown = event.point 
		}

		switch (hitResult.type) {
			case 'stroke':
			case 'fill':
				this.item = hitResult.item
				// this.item.applyMatrix = false
				this.onlySelect(this.item)
				this.segment = this.handle = null
				break	
						
			case 'segment':
				this.item = hitResult.item
				this.segment = hitResult.segment
				this.onlySelect(this.segment)
				this.handle = null
				break

			case 'handle-in':
			case 'handle-out':
				this.onlySelect(this.segment)
				this.handle = hitResult
				break
		}
	}

	onMouseUp(event) {
		this.setSelection()
		this.releaseSelectionRect()
	}

	onDoubleClick(event) {
		const hit = this.getHit(this.target, event, { stroke: true, fill: true, segments: true })

		if (!hit) return
		
		switch (hit.type) {
			case 'segment':
				this.convertSegment(hit.segment)
				break
			case 'stroke':
			case 'fill':
				if (!this.transformbox)
					this.createTransformbox(this.item)
				break
		}
	}

	onMouseDrag(event) {
		if (this.transformbox)
			this.transformbox.handleMouseDrag(event)
		else if (this.handle)
			this.dragHandle(this.handle, event)
		else if (this.segment)
			this.dragSegment(this.segment, event)
		else if (this.mousedown)
			this.drawSelection(this.mousedown, event)
	}

	drawSelection(startPoint, event) {
		if (!this.selectionRect) {
			this.selectionRect = new paper.Path.Rectangle({
				from: startPoint,
				to: event.point,
				style: {
					strokeWidth: 1,
					dashArray: [1, 1],
					strokeColor: 'gray',
				},
				data: { 
					iterable: false,
				},
			})
		} else {
			const { topLeft, topRight, bottomLeft, bottomRight } = new paper.Rectangle(startPoint, event.point)
			this.selectionRect.segments = [topLeft, topRight, bottomRight, bottomLeft]
		}
	}

	setSelection() {
		if (!this.selectionRect) return

		const selectedItems = this.target.getItems({
			overlapping: this.selectionRect.bounds,
			match: item => item.className !== 'Layer'
		})

		this.onlySelect(selectedItems)
	}

	releaseItem(unselect = true) {
		unselect && (this.item.selected = false)
		this.releaseTransformbox(this.item)
		this.item = this.segment = this.handle = null		
	}

	createTransformbox(item) {
		const transformbox = new Transformbox(item)
		this.onlySelect(this.item)
		this.transformbox = transformbox
		return transformbox	
	}	

	releaseTransformbox() {
		if (this.transformbox) {
			this.transformbox.remove()
			this.transformbox = null
		}
	}

	releaseSelectionRect() {
		if (this.selectionRect) {
			this.selectionRect.remove()
			this.selectionRect = null
		}
	}

	dragSegment(segment, event) {
		segment.point = this.item.globalToLocal(event.point)
		this.emitChange({ type: 'segment', action: 'drag', segment, event })
	}

	addSegment(path, event) {
		const segment = new Segment(event.point)
		this.onlySelect(segment)
		const result = path.add(segment)
		this.emitChange({ type: 'segment', action: 'add', segment, event })
		return result
	}

	convertSegment(segment) {
		const tangent = segment.path.getTangentAt(segment.path.getOffsetOf(segment.point))

		if (segment.hasHandles()) {
			segment.clearHandles()
		} else {
			segment.handleIn = new Point([-20, 0]).rotate(tangent.angle)
			segment.handleOut = new Point([20, 0]).rotate(tangent.angle)
		}
	}

	insertSegment(item, event) {
		if (!item) return
		const result = item.hitTest(event.point, {stroke: true, curves: true, tolerance: 5})
		if (!result) return
		item.curves[result.location.index].divideAt(result.location)
	}

	deleteSegment(item, event) {
		let result = item.hitTest(event.point, {segments: true, tolerance: 5})

		if (!result)
			return

		result.segment.remove()
	}

	dragHandle(handle, event) {
		const handleDistance = event.point.subtract(handle.segment.point)
		const oppositeHandleType = (handle.type === 'handle-in' ? 'handle-out' : 'handle-in')
		const segment = handle.segment

		if (Key.isDown('command') || Key.isDown('meta')) {
			// smooth join but different handle lengths
			segment[this.toPropertyName(oppositeHandleType)].angle = segment[this.toPropertyName(handle.type)].angle - 180
		} else if (!Key.isDown('alt')) {
			// smooth join, symmetric handles
			segment[this.toPropertyName(oppositeHandleType)] = handleDistance.multiply(-1)
		}

		segment[this.toPropertyName(handle.type)] = handleDistance
		this.emitChange({ type: 'handle', action: 'drag', handle, event })
	}
}

export default SelectionTool