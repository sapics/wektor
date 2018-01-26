import BaseEffect from './BaseEffect'
import paper from 'paper'

class ShakeEffect extends BaseEffect {
	constructor(input) {
		super(input, {
			applyOnChanges: ['geometry'],
			mirrorChanges: ['style'],			
		})
	}

	apply(input, output) {
		output.segments = input.segments.map(segment => {
			const randomPoint = paper.Point.random().multiply({ x: 20, y: 20 })
			return {
				handleIn: segment.handleIn,
				handleOut: segment.handleOut,
				point: segment.point.add(randomPoint),
			}
		})
		output.selected = false
	}
}

export default ShakeEffect