import paper from 'paper'
const { Path, Group, Symbol, SymbolDefinition, SymbolItem, Color } = paper

const dialog = {
	layout: {
		'options.spacing.vertical': {
			type: 'number',
			label: 'spacing vertical',
		},
		'lineVertical.style.strokeColor': {
			type: 'color'
		},
		// 'background.style.fillColor': {
		// 	type: 'color'
		// },	
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
				})
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

		this._assign = true
		Object.assign(this, spec)
		this._assign = false

		this.background = this.createBackgroundRectangle()
		const backgroundSymbolDefinition = new SymbolDefinition(this.background)
		this.background.position = window.view.center
		const clippingMask = new SymbolItem(backgroundSymbolDefinition)
		this.lines = new Group({
			children: [clippingMask],
			clipped: true,
		})

		this.lineVertical = new Path.Line({
			from: window.view.bounds.topLeft,
			to: window.view.bounds.bottomLeft,
			style: this.options.lines.style
		})
		this.lineVerticalSymbolDefinition = new SymbolDefinition(this.lineVertical)

		this.addChild(this.background)
		this.drawLines()
	}

	handleOptionChange({target, key, value, keyPath}) {
		if (this._assign) return

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

		// // vertical
		// const lineVertical = this.lineVertical
		// lineVertical.pivot = lineVertical.bounds.topLeft

		const lineVerticalSymbolDefinition = this.lineVerticalSymbolDefinition

		for (let x = 0; x < width; x += this.options.spacing.vertical) {		
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