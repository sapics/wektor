import ShapeTool from './ShapeTool'
import paper from 'paper'

class EllipseTool extends ShapeTool {
	constructor() {
		super()
		this.label = 'ellipse'
		this.shortcut = 'e'
	}

	createShape() {
		return new paper.Path.Circle({
			radius: 1,
		})
	}
}

export default EllipseTool