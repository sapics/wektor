import BaseTool from '../BaseTool.js'
import { Transformbox } from '../SelectionTool'

class ShapeTool extends BaseTool {
	onMouseDown(event) {
		if (this.shape)
			this.releaseShape()

		this.startPoint = event.point
	}

	onMouseDrag(event) {
		if (!this.shape) {
			this.shape = this.createShape(event)
			this.shape.selected = true
			this.transformbox = new Transformbox(this.shape)
			this.transformbox.position = event.point
			this.transformbox.initTransform(this.transformbox.transformScale, event, {
				name: 'bottom-right',
				point: event.point,
				type: 'bounds',
			})
		}

		this.transformbox.handleMouseDrag(event)
		this.cursor = 'crosshair'
	}

	onMouseUp(event) {
		this.releaseShape()
	}

	releaseShape() {
		this.shape = null
		this.transformbox.remove()
		this.transformbox = null
	}
}

export default ShapeTool