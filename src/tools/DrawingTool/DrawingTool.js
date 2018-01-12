import paper from 'paper'
import BaseTool from '@/tools/BaseTool'
const { Path } = paper

const specDefault = {
	options: {
		simplify: 2.5,
		flatten: 0,
		smooth: 0,
		distance: {
			min: 0,
			max: 0,
		},
	},

	dialog: {
		layout: {
			simplify: {
				type: 'number',
				label: 'simplify',
			},
			smooth: {
				type: 'boolean',
				label: 'smooth',
			},
			flatten: {
				type: 'number',
				label: 'flatten',
			},
			distance: {
				label: 'distance:',
				align: 'comma-separated',
				'distance.min': {
					type: 'number',
					label: 'min',
				},
				'distance.max': {
					type: 'number',
					label: 'max',
				}
			}
		},
	},
}

class DrawingTool extends BaseTool {
	constructor(spec) {
		super()
		Object.assign(this, specDefault, spec)
		this.label = 'draw'
		this.shortcut = 'd'
	}
	
	onMouseDown() {
		this.path = new Path()
	}
	
	onMouseDrag(event) {
		this.path.add(event.point)
	}
	
	onMouseUp() {
		this.releasePath()
	}
	
	releasePath() {
		this.path.simplify()
		this.path = null
	}
}

export default DrawingTool