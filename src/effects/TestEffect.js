import BaseEffect from './BaseEffect'

class TestEffect extends BaseEffect {
	constructor(input, spec) {
		spec = Object.assign({
			options: {
				hueIncrement: 100,
			},
			dialog: {
				layout: {
					hueIncrement: {
						type: 'number',
						label: 'hue += '
					}
				},
			},
			applyOnChanges: ['style'],
			mirrorChanges: ['geometry'],			
		}, spec)

		super(input, spec)
	}

	apply(input, output) {
		if (input.fillColor) {
			output.fillColor = input.fillColor
			output.fillColor.hue += 100
		}
	}	
}

export default TestEffect