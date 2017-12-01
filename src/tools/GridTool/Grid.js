import paper from 'paper'
const { Path, Group, Symbol, SymbolDefinition, SymbolItem } = paper

const dialog = {
	layout: {
		options: {
			spacingVertical: {
				type: 'number',
				label: 'spacing vertical',
			},
			lines: {
				strokeWidth: {
					type: 'number',
					label: 'strokeWidth'
				}
			},
		},
		background: {
			style: {
				type: 'stroke',
				label: 'background'
			}
		}
	}
}

const specDefault = {
	options: {
		spacingVertical: 5,
		lines: {
			strokeWidth: 1,
		},
	},
	dialog,
}

class DeepProxy {
	constructor(target, changeHandler) {
		const proxyHandler = {
			get(target, key) {
				if (typeof target[key] === 'object' && target[key] !== null) {
					return new Proxy(target[key], proxyHandler)
				} else {
					return target[key]
				}
			},			
			set: (target, key, value) => {
				target[key] = value
				changeHandler && changeHandler(target, key, value)
				return true
			},
		}

		return new Proxy(target, proxyHandler)	
	}
}

class Grid extends Group {
	constructor(spec) {
		super()
		spec = Object.assign({}, specDefault, spec)
		spec.options = new DeepProxy(spec.options, (...args) => {
			this.handleOptionChange(...args)
		})

		this._assign = true
		Object.assign(this, spec)
		this._assign = false

		this.background = this.createBackgroundRectangle()
		const backgroundSymbolDefinition = new SymbolDefinition(this.background)
		this.background.position = window.view.center
		const clippingMask = new SymbolItem(backgroundSymbolDefinition)
		this.lines = new Group({
			children: [clippingMask],
			clipped: true
		})
		this.addChild(this.background)
		this.drawLines()
	}

	handleOptionChange(options, key, value) {
		if (this._assign) return

		if (['spacingVertical', 'strokeWidth'].includes(key))
			this.drawLines()
	}

	get dialog() {
		return this._dialog
	}	

	set dialog(dialog) {
		const values = this
		const id = this.constructor.name + this.id
		this._dialog = { values, id, ...dialog } 
	}

	createBackgroundRectangle() {
		const background = new Path({
			name: 'background',
			segments: [
				[0, 0], [200, 0], [200, 200], [0, 200]
			],
			closed: true,
			style: this.backgroundStyle,
			position: (window.view && window.view.center) || [0, 0],
			dialog: this.dialog,
		})
		background.on('change', () => {
			this.drawLines()
		})
		return background
	}

	drawLines() {
		if (this._construct) return false

		this.clear()
		const { width, height } = this.background.bounds

		// vertical
		const lineVertical = new Path.Line({
			from: window.view.bounds.topLeft,
			to: window.view.bounds.bottomLeft,
			style: this.options.lines,
		})
		lineVertical.pivot = lineVertical.bounds.topLeft

		const lineVerticalSymbolDefinition = new SymbolDefinition(lineVertical)

		for (let x = 0; x < width; x += this.options.spacingVertical) {		
			let newLine = new SymbolItem(lineVerticalSymbolDefinition)
			newLine.pivot = newLine.bounds.topLeft
			newLine.position = {
				x: this.background.bounds.topLeft.x + x,
				y: 0
			}
			this.lines.addChild(newLine) 
		}
	}

	clear() {
		this.lines.removeChildren(1, this.lines.children.length)
	}			
}

export default Grid