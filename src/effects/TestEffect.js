import BaseEffect from './BaseEffect'

class TestEffect extends BaseEffect {
	constructor(input) {
		super(input, {
			applyOnChanges: ['style'],
			mirrorChanges: ['segments'],
		})
	}

	apply(input, output) {
		if (input.fillColor) {
			output.fillColor = input.fillColor
			output.fillColor.hue += 100
		}
	}	
}

export default TestEffect