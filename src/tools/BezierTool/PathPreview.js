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
		})
	}

	update(event) {
		this.segments = [this.path.lastSegment, event.point]
	}

	clear() {
		this.removeSegments()
	}
}

export default PathPreview