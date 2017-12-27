import paper from 'paper'
import SelectionTool from '../SelectionTool/SelectionTool.js'
import PathPreview from './PathPreview.js'
import specDefault from './specDefault.js'
import wektor from '@/wektor'

const {Path, Key} = paper

class BezierTool extends SelectionTool {
	constructor(target, spec) {
		spec = Object.assign({}, specDefault, spec)
		super(target, spec)
	}

	onDeactivate() {
		this.segment && (this.segment.selected = false)
		this.path && this.releasePath(false)
		this.releasePathPreview()
	}

	onKeyDown(event) {
		if (event.key === this.options.keys.release) {
			this.releasePath()
			event.preventDefault()
		}
	}

	onMouseDown(event) {
		this.target.deselectAll()

		// this holds the action we are starting in mouseDown. The action might not be finished untill mouseMove
		// and / or mouseUp (see onMouseUp) 
		this.action = null

		if (!this.path) {
			this.path = this.createPath()
			this.action = 'createPath'
		}

		if (this.options.pathPreview)
			this.pathPreview = this.pathPreview || new PathPreview(this.path)

		if (this.pathPreview)
			this.pathPreview.clear()

		if (this.options.snapToClose)
			event = this.snap(this.path, event)

		if (this.path.firstSegment && this.path.firstSegment.point.equals(event.point)) {
			this.path.closed = true
			wektor.history.add({
				redo: () => { this.path.closed = true },
				undo: () => { this.path.closed = false }
			})			
			this.segment = this.path.firstSegment
			this.onlySelect(this.segment)
			this.releasePath(false)
		} else {
			this.segment = this.addSegment(this.path, event)
			this.action = this.action || 'addSegment'
		}

		this.handle = {
			type: 'handle-out',
			segment: this.segment,
		}
	}

	onMouseUp(event) {
		switch (this.action) {
			case 'createPath':
				// we set x and y explicit, because if we use event.point.x in the undo/redo functions
				// event will reference to a new event
				const { x, y } = event.point
				let id = this.path.id
				wektor.history.add({
					redo: () => {
						this.path = this.createPath()
						// wer setting the id directly because we need the path.id to stay the same (see releasePath())
						// even if we remove and create the path while undo/redo. For us this is undo/redoing the
						// same path, for paper.js they are different und so have different id's by default
						this.path._id = id
						this.path.add([x, y])
						this.path.selected = true
						if (this.isActive) {
							this.pathPreview = new PathPreview(this.path)
							this.pathPreview.update(event)
						}
					},
					undo: () => { 
						this.path.remove()
						this.path = null
						this.releasePathPreview()
					}
				})
				break
			case 'addSegment':
				const segment = this.path.lastSegment
				wektor.history.add({
					redo: () => {
						this.path.addSegments([segment])
						this.onlySelect(this.path.lastSegment)
						this.pathPreview && this.pathPreview.update(event)
					},
					undo: () => {
						this.path.removeSegments(this.path.segments.length - 1)
						this.onlySelect(this.path.lastSegment)
						this.pathPreview && this.pathPreview.update(event)
					}
				})
				break
		}

		this.action = null
	}

	onMouseMove(event) {
		if (!this.path)
			return false

		if (this.options.snapToClose)
			event = this.snap(this.path, event)

		if (this.pathPreview)
			this.pathPreview.update(event)
	}

	onMouseDrag(event) {
		if (Key.isDown(this.options.keys.dragSegment))
			this.segment.point = event.point.subtract(this.segment.handleOut)
		else if (this.handle)
			this.dragHandle(this.handle, event)
		else if (this.segment)
			this.dragSegment(this.segment, event)
	}

	createPath() {
		return new Path()
	}

	releasePath(unselect = true) {
		const pathId = this.path.id

		const command = wektor.history.add({
			redo: () => {
				this.releasePathPreview()
				if (unselect) this.path.selected = false
				this.path = null
			},
			undo: () => {
				this.path = wektor.project.getItem({ id: pathId })
				this.path.selected = true
				if (this.isActive)
					this.pathPreview = new PathPreview(this.path)
			}
		})

		// trigger the command
		command.redo()
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

		if (distance < this.options.snapToClose.threshold)
			event.point = startPoint

		return event
	}
}

export default BezierTool