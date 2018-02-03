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

		// undoing wektors history will eventually remove the path so we have to clean up
		// (a path having an undefined index means it has been removed)
		wektor.on('undo', () => {
			if (this.path && this.path.index === undefined) {
				this.releasePath()
			}
		})
	}

	onDeactivate() {
		this.segment && (this.segment.selected = false)
		this.path && this.releasePath(false)
	}

	onKeyDown(event) {
		if (event.key === this.options.keys.release) {
			this.releasePath(false)
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
			const path = this.path
			wektor.history.add({
				redo: () => { path.closed = true },
				undo: () => { path.closed = false }
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
			case 'addSegment':
				// storing the path in a new variable is important, because using this.path 
				// in the undo/redo functions will point to the current path of this tool
				const path = this.path
				const segment = this.path.lastSegment
				wektor.history.add({
					redo: () => {
						if (path) {
							path.addSegments([segment])
							if (path === this.path) {
								this.onlySelect(this.path.lastSegment)
								this.pathPreview && this.pathPreview.update(event)
							}
						} else {
							console.warn(`Unable to find path.`)
						}
					},
					undo: () => {
						if (path) {
							path.removeSegments(path.segments.length - 1)
							if (path === this.path) {
								this.onlySelect(this.path.lastSegment)
								this.pathPreview && this.pathPreview.update(event)								
							}
						} else {
							console.warn(`Unable to find path.`)
						}
					}
				})
				break
		}

		this.action = null
	}

	onMouseMove(event) {
		if (!this.path) return

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
		this.releasePathPreview()
		if (unselect) { 
			this.path.selected = false
		} else {
			// unselect selected segments
			this.path.selected = false
			this.path.selected = true
		}
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

		if (distance < this.options.snapToClose.threshold)
			event.point = startPoint

		return event
	}
}

export default BezierTool