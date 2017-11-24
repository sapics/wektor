import BaseTool from './BaseTool.js'

class ShapeTool extends BaseTool {
	onMouseDown(event) {
		if (this.shape)
			this.releaseShape()

		this.startPoint = event.point
	}

	onMouseDrag(event) {
		if (!this.shape) {
			this.shape = this.target.addChild(this.createShape(event))
		}

		this._shape.pivot = this._startPoint
		this._scaleItemXY(this._shape, event)		

		this._shape.visible = true
		this._shape.selected = true		
	}

	releaseShape(unselect = true) {
		if (unselect)
			this.shape.selected = false
		this.shape = null
	}
}

export default ShapeTool