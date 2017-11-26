import {getBounds} from '@/utils.js'

class PointerLine {
	constructor(canvas, from, to) {
		Object.assign(this, {
			canvas,
			_from: from,
			_to: to,
			ctx: canvas.getContext('2d'),
		})
		
		this.draw()
	}

	get from() {
		return this._from
	}

	set from(value) {
		this._from = value
		this.redraw()
	}	

	get to() {
		return this._to
	}

	set to(value) {
		this._to = value
		this.redraw()
	}	

	clear() {
		const { ctx, canvas } = this
		ctx.clearRect(0, 0, canvas.width, canvas.height)
	}

	draw() {
		const { ctx, from, to } = this

		ctx.beginPath()
		ctx.moveTo(from.x, from.y)
		ctx.lineTo(to.x, to.y)
		ctx.stroke()
	}

	redraw() {
		this.clear()
		this.draw()
	}	
}

export default PointerLine