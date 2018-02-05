import paper from 'paper'
const {Path} = paper

class PathPreview extends Path {
	constructor(path, event) {
		super()
		this.set({
			path,
			selected: true,
			strokeWidth: 0,
			fillColor: null,
			guide: true,
		})
	}

	update(event) {
		this.segments = [this.path.lastSegment, event.point]
		// when the path is cleared it'll get unselected automatically
		// so we have to reselect
		this.selected = true
	}

	clear() {
		this.removeSegments()
	}
}

export default PathPreview