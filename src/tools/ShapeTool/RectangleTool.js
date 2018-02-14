import ShapeTool from './ShapeTool'
import paper from 'paper'

class RectangleTool extends ShapeTool {
	constructor() {
		super()
		this.label = 'rectangle'
		this.shortcut = 'r'
	}

	createShape() {
		return new paper.Path.Rectangle({
			point: [0, 0],
			width: 1,
			height: 1,
		})
	}
}

export default RectangleTool