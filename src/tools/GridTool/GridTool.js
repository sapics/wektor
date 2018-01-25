import BaseTool from '@/tools/BaseTool'
import specDefault from './spec'
import { makeUniqueId } from '@/utils.js'
import Grid from './Grid'
import paper from 'paper'

class GridTool extends BaseTool {
	constructor(target, spec) {
		spec = Object.assign({}, specDefault, spec)
		super(target, spec)
	}

	onMouseDown(event) {
		// mousedown will close our new dialog directly after we opend it so we have to stop the event
		event.stopPropagation()

		this.mouseDownPoint = event.point

		// var group = new Grid()
	}

	onMouseDrag(event) {
		if (!this.newGridRect) {
			this.newGridRect = new paper.Path.Rectangle({
				from: this.mouseDownPoint,
				to: event.point,
				strokeWidth: 0,
				fillColor: null,
				selected: true,
				data: { iterable: false },
			})
		} else {
			const { topLeft, topRight, bottomLeft, bottomRight } = new paper.Rectangle(this.mouseDownPoint, event.point)
			this.newGridRect.segments = [topLeft, topRight, bottomRight, bottomLeft]
		}
	}

	onMouseUp(event) {
		let bounds 
		if (this.newGridRect) {
			bounds = this.newGridRect.bounds
			console.log(bounds)
			this.newGridRect.remove()
			this.newGridRect = null
		} else {
			bounds = {
				x: event.point.x,
				y: event.point.y,
				width: 500,
				height: 500,
			}
		}

		new Grid({ bounds })
	}
}

export default GridTool