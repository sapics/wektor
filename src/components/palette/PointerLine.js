import {getBounds} from '@/utils.js'

class PointerLine {
	constructor(canvas, el, referenceEl) {
		console.log(el.position)

		Object.assign(this, {
			canvas,
			el,
			referenceEl,
			ctx: canvas.getContext('2d'),
		})

		this.draw()
	}

	draw() {
		const {ctx, el, referenceEl} = this
		const from = el.position
		const bounds = getBounds(referenceEl)
		const to = bounds.center

		ctx.beginPath()
		ctx.moveTo(from.x, from.y)
		ctx.lineTo(to.x, to.y)
		ctx.stroke()
	}	
}

export default PointerLine