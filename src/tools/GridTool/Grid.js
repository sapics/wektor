import paper from 'paper'
import createDialog from '@/dialog'
const { Path, Group, Symbol, SymbolDefinition, SymbolItem, Color } = paper

class Grid extends Group {
	constructor(spec = {}) {
		super()

		const specDefault = {
			options: {
				spacing: {
					vertical: 5,
					horizontal: 5
				},
				lines: {
					style: {
						strokeColor: new Color('black'),
						strokeWidth: 1,
					}
				},
			},

			dialogData: {
				layout: {
					spacing: {
						label: 'spacing',
						align: 'comma-separated',
						'spacing.horizontal': {
							type: 'number',
							label: 'x:',
							space: 'thin',
							min: 1,
						},							
						'spacing.vertical': {
							type: 'number',
							label: 'y:',
							space: 'thin',
							min: 1,
						},					
					},
					'stroke': {
						label: 'lines',
						align: 'columns',
						'lines.style.strokeWidth': {
							type: 'number'
						},						
						'lines.style.strokeColor': {
							type: 'color',
						},												
					},
					'background': {
						align: 'comma-separated',
						label: 'fill',
						'background.fillColor': {
							type: 'color',
						},					
						'background.stroke': {
							align: 'columns',
							label: 'stroke',
							'background.strokeWidth': {
								type: 'number'
							},								
							'background.strokeColor': {
								type: 'color'
							},					
						},						
					}
				}		
			}			
		}

		spec = Object.assign(specDefault, spec)
		Object.assign(this, spec)

		this.initBackground()
		this.initLines()

		this.options.background = this.background

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
		switch (key) {
			case 'spacing.vertical':
			case 'spacing.horizontal':
				this.drawLines()
				break

			case 'lines.style.strokeColor':
			case 'lines.style.strokeWidth':
				this.styleLines()
				break
		}
	}

	getDialog() {
		const dialog = createDialog(this.options, this.dialogData.layout, (...args) => {
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

		for (let x = 0; x < width; x += this.options.spacing.horizontal) {		
			let newLine = this.lineVertical.clone()
			newLine.position = {
				x: this.background.bounds.topLeft.x + x,
				y: 0
			}
			this.lines.addChild(newLine) 
		}
	}

	styleLines() {
		this.lines.style = this.options.lines.style
	}

	clear() {
		this.lines.removeChildren(1, this.lines.children.length)
	}			
}

export default Grid