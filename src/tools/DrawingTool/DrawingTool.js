import paper from 'paper'
import BaseTool from '@/tools/BaseTool'
import wektor from '@/wektor'
const { Path } = paper

const specDefault = {
	options: {
		simplify: 2.5,
		flatten: 0,
		smooth: 0,
		minDistance: 0,
		maxDistance: 0,
		fixedDistance: 0,
	},

	dialog: {
		layout: {
			group: {
				align: 'comma-separated',
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
			},
			distance: {
				label: 'distance',
				align: 'comma-separated',
				'minDistance': {
					type: 'number',
					label: 'min',
				},
				'maxDistance': {
					type: 'number',
					label: 'max',
				},
				'fixedDistance': {
					type: 'number',
					label: 'fixed',
				}				
			}
		},
	},
}

class DrawingTool extends BaseTool {
	constructor(target, spec) {
		super(target)
		Object.assign(this, specDefault, spec)
		this.label = 'draw'
		this.shortcut = 'd'
	}
	
	onMouseDown(event) {
		this.path = new Path()
		this.path.add(event.point)
		this.path.data.finished = false
	}
	
	onMouseDrag(event) {
		this.path.add(event.point)
	}
	
	onMouseUp() {
		this.releasePath()
	}

	onDialogChange(target, key, value) {
		switch (key) {
			case 'minDistance':
			case 'maxDistance':
			case 'fixedDistance':
				this[key] = value
				break
		}
	}
	
	releasePath() {
		const { options, path } = this

		if (path.segments.length > 1) {
			options.simplify && path.simplify(options.simplify)
			options.smooth && path.smooth()
			options.flatten && path.flatten(options.flatten)
			path.data.finished = true
			this.onlySelect(path)
		} else {
			path.remove()
		}
		
		this.path = null
	}
}

export default DrawingTool