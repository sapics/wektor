import paper from 'paper'
const {Path} = paper

class PointerLine extends Path {
	constructor(context, referenceEl) {
		super({
			strokeColor: 'black',
			strokeWidth: 1,
		})

		this.set({context, referenceEl})
		this.setSegments()
	}

	setSegments() {
		const {referenceEl, context} = this
		const from = context.position

		let to
		if (referenceEl.bounds) {
			to = referenceEl.bounds.center
		} else if (referenceEl.getBoundingClientRect) {
			const {x, y, width, height} = referenceEl.getBoundingClientRect()
			to = {
				x: x + width / 2,
				y: y + height / 2
			}
		}

		this.segments = [
			from,
			to
		]	
	}
}

export default PointerLine