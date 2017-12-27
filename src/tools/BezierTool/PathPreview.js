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
			data: {
				// prevent the path preview from beeing listed in the layers panel
				iterable: false,
			},
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