import BaseEffect from './BaseEffect'
import paper from 'paper'
import { getRandomInt } from '@/utils'

class ShakeEffect extends BaseEffect {
	constructor(input, spec) {
		spec = Object.assign({
			options: {
				shakiness: 10,
			},
			dialog: {
				layout: {
					shakiness: {
						type: 'number',
						label: 'shakiness:'
					},
					redo: {
						type: 'button',
						label: 'shake',
						click: () => {
							this.applyAll()
						}
					},
				},
			},
			applyOnChanges: ['geometry'],
			mirrorChanges: ['style'],			
		}, spec)

		super(input, spec)
	}

	apply(input, output) {
		const { shakiness } = this.options

		output.segments = input.segments.map(segment => {
			const max = shakiness / Math.sqrt(2)
			const randomPoint = {
				x: getRandomInt(-max, max),
				y: getRandomInt(-max, max),
			}

			return {
				handleIn: segment.handleIn,
				handleOut: segment.handleOut,
				point: segment.point.add(randomPoint),
			}
		})
		output.selected = false
	}

	onDialogChange(target, key, value) {
		switch (key) {
			case 'shakiness':
				this.applyAll()
				break
		}
	}	
}

export default ShakeEffect