import paper from 'paper'
const { Path, Group, Symbol, SymbolDefinition, SymbolItem, Color } = paper

const dialog = {
	layout: {
		'options.spacing.vertical': {
			type: 'number',
			label: 'spacing vertical',
		},
		'background.style.fillColor': {
			type: 'color'
		},	
	}
}

const specDefault = {
	options: {
		spacing: {
			vertical: 5
		},
		lines: {
			style: {
				strokeColor: new Color({
					red: 0,
					green: 0,
					blue: 0,
				}),
				strokeWidth: 1,
			}
		}
	},
	dialog,
}

class DeepProxy {
	constructor(target, changeHandler) {
		function makeProxyHandler(keyPath) {
			return {
				get(target, key) {
					if (typeof target[key] === 'object' && target[key] !== null && target.constructor.name === 'Object') {
						const newKeyPath = keyPath ? `${keyPath}.${key}` : key
						return new Proxy(target[key], makeProxyHandler(newKeyPath))
					} else {
						return target[key]
					}
				},			
				set: (target, key, value) => {
					target[key] = value
					changeHandler && changeHandler({
						target, 
						key, 
						value, 
						keyPath: keyPath ? `${keyPath}.${key}` : key
					})
					return true
				},
			}
		}

		return new Proxy(target, makeProxyHandler())	
	}
}

class Grid extends Group {
	constructor(spec) {
		super()
		spec = Object.assign({}, specDefault, spec)
		spec.options = new DeepProxy(spec.options, (...args) => {
			this.handleOptionChange(...args)
		})
		Object.assign(this, spec)

		this.initBackground()
		this.initLines()
		this.drawLines()
	}

	initBackground() {
		this.background = new Path({
			name: 'background',
			segments: [
				[0, 0], [200, 0], [200, 200], [0, 200]
			],
			closed: true,
			style: this.backgroundStyle,
			position: (window.view && window.view.center) || [0, 0],
			// linking the Grid's dialog will enable opening the Grid's dialog when clicking on the beackground
			// (see Wektor.vue's onContextmenu())
			dialog: this.dialog,
		})

		this.background.on('change', () => {
			this.drawLines()
		})

		const symbolDefinition = new SymbolDefinition(this.background)
		this.background.position = window.view.center
		this.clippingMask = new SymbolItem(symbolDefinition)

		this.addChild(this.background)
	}

	initLines() {
		this.lines = new Group({
			children: [this.clippingMask],
			clipped: true,
		})

		this.lineVertical = new Path.Line({
			from: window.view.bounds.topLeft,
			to: window.view.bounds.bottomLeft,
			style: {
				strokeWidth: 1,
				strokeColor: 'black'
			}
		})
		this.lineVertical.pivot = this.lineVertical.bounds.topLeft
		this.lineVerticalSymbolDefinition = new SymbolDefinition(this.lineVertical)
	}

	handleOptionChange({target, key, value, keyPath}) {
		if (this._assign) return

		console.log(keyPath)

		if (['spacing.vertical'].includes(keyPath))
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

	drawLines() {
		if (this._construct) return false

		this.clear()
		const { width, height } = this.background.bounds

		const lineVerticalSymbolDefinition = this.lineVerticalSymbolDefinition

		for (let x = 0; x < width; x += this.options.spacing.vertical) {		
			let newLine = this.lineVertical.clone() // new SymbolItem(lineVerticalSymbolDefinition)
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