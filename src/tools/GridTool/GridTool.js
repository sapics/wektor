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

	onActivate() {
		this.tooltip = '<span class="italic">Click</span> and <span class="italic">drag</span> on the canvas to create a new grid.'
	}

	onMouseDown(event) {
		this.mouseDownPoint = event.point
	}

	onMouseDrag(event) {
		if (!this.newGridRect) {
			this.newGridRect = new paper.Path.Rectangle({
				from: this.mouseDownPoint,
				to: event.point,
				guide: true,
				strokeWidth: 0,
				fillColor: null,
				selected: true,
			})
		} else {
			const { topLeft, topRight, bottomLeft, bottomRight } = new paper.Rectangle(this.mouseDownPoint, event.point)
			this.newGridRect.segments = [topLeft, topRight, bottomRight, bottomLeft]
		}
	}

	onMouseUp(event) {
		let bounds

		if (!this.newGridRect) return true

		bounds = this.newGridRect.bounds
		console.log(bounds)
		this.newGridRect.remove()
		this.newGridRect = null

		this.tooltip = '<span class="italic">Right-click</span> on the grid to alter it.'
		new Grid({ bounds })
	}
}

export default GridTool