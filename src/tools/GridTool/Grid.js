import paper from 'paper'
import createDialog from '@/dialog'
const { Path, Group, Symbol, SymbolDefinition, SymbolItem, Color } = paper

const dialogData = {
	layout: {
		'options.spacing.vertical': {
			type: 'number',
			label: 'spacing vertical',
			payload: { min: 1 }
		},
		'options.lines.style.strokeColor': {
			type: 'color',
			label: 'lines'
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
					red: 1,
					green: 0,
					blue: 0,
				}),
				strokeWidth: 1,
			}
		}
	},
	dialogData,
}

class Grid extends Group {
	constructor(spec) {
		super()
		spec = Object.assign({}, specDefault, spec)
		Object.assign(this, spec)
		console.log(this.dialogData)

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
			position: (window.view && window.view.center) || [0, 0],
		})

		// when the background is hit (see wektorUi's onContextMenu the Grid's dialog will be opened)
		// define this via an arrow function, otherwise 'this' in the getDialog function wont be Grid but the background Path 
		this.background.getDialog = () => this.getDialog()

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
		})
		this.lineVertical.pivot = this.lineVertical.bounds.topLeft
		this.lineVerticalSymbolDefinition = new SymbolDefinition(this.lineVertical)
	}

	handleDialogChange(target, key, value) {
		const redrawList = [
			'options.spacing.vertical',
			'options.lines.style.strokeColor'
		]

		if (redrawList.includes(key))
			this.drawLines()
	}

	getDialog() {
		const dialog = createDialog(this, this.dialogData.layout, (...args) => {
			this.handleDialogChange(...args)
		})
		const id = this.constructor.name + this.id
		return { ...dialog, id } 
	}	

	drawLines() {
		this.clear()
		const { width, height } = this.background.bounds

		this.lineVertical.style = this.options.lines.style

		if (this.options.spacing.vertical <= 1) this.options.spacing.vertical = 1

		for (let x = 0; x < width; x += this.options.spacing.vertical) {		
			let newLine = this.lineVertical.clone()
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