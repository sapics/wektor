import paper from 'paper'
import SelectionTool from '../SelectionTool/SelectionTool.js'
import PathPreview from './PathPreview.js'
import specDefault from './specDefault.js'

const {Path, Key} = paper

class BezierTool extends SelectionTool {
	constructor(target, spec) {
		spec = Object.assign({}, specDefault, spec)
		super(target, spec)
	}

	onDeactivate() {
		this.segment && (this.segment.selected = false)
		this.releasePath(false)
	}

	onKeyDown(event) {
		if (event.key === this.spec.keys.release) {
			this.releasePath()
			event.preventDefault()
		}
	}

	onMouseDown(event) {
		if (!this.path)
			this.path = this.createPath()

		if (this.spec.pathPreview)
			this.pathPreview = this.pathPreview || new PathPreview(this.path)

		if (this.pathPreview)
			this.pathPreview.clear()

		if (this.spec.snapToClose)
			event = this.snap(this.path, event)

		if (this.path.firstSegment && this.path.firstSegment.point.equals(event.point)) {
			this.path.closed = true
			this.segment = this.path.firstSegment
			this.onlySelect(this.segment)
			this.releasePath(false)
		} else {
			this.segment = this.addSegment(this.path, event)
		}

		this.handle = {
			type: 'handle-out',
			segment: this.segment,
		}
	}

	onMouseMove(event) {
		if (!this.path)
			return false

		if (this.spec.snapToClose)
			event = this.snap(this.path, event)

		if (this.pathPreview)
			this.pathPreview.update(event)
	}

	onMouseDrag(event) {
		if (Key.isDown(this.spec.keys.dragSegment))
			this.segment.point = event.point.subtract(this.segment.handleOut)
		else if (this.handle)
			this.dragHandle(this.handle, event)
		else if (this.segment)
			this.dragSegment(this.segment, event)
	}

	createPath() {
		return this.target.addChild(new Path())
	}

	releasePath(unselect = true) {
		this.releasePathPreview()

		if (unselect)
			this.path.selected = false

		this.path = null
	}

	releasePathPreview() {
		if (this.pathPreview) {
			this.pathPreview.remove()
			this.pathPreview = null
		}
	}

	snap(path, event) {
		if (!path)
			return

		if (path.segments.length < 2)
			return event

		const startPoint = path.firstSegment.point
		const distance = startPoint.subtract(event.point).length

		if (distance < this.spec.snapToClose.threshold)
			event.point = startPoint

		return event
	}
}

export default BezierTool