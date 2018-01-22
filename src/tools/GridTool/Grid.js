import paper from 'paper'
import wektor from '@/wektor'
import { deepExtend } from '@/utils'

const { Path, Group, Symbol, SymbolDefinition, SymbolItem, Color } = paper

class Grid extends Group {
	constructor(spec = {}) {
		super()

		this.options = deepExtend({}, {
			spacing: {
				vertical: 15,
				horizontal: 15
			},
			lines: {
				style: {
					strokeColor: new Color('black'),
					strokeWidth: 1,
				}
			},			
		}, spec.options)

		this.dialog = deepExtend({}, {
			layout: {
				spacing: {
					label: 'spacing',
					align: 'comma-separated',
					'spacing.vertical': {
						type: 'number',
						label: 'x:',
						space: 'thin',
						min: 1,
					},							
					'spacing.horizontal': {
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
		}, spec.dialog)

		this.backgroundBounds = spec.bounds || {
			x: paper.view.size.width / 2,
			y: paper.view.size.height / 2,
			width: 200,
			height: 200
		}

		this.cache = {}

		this.name = 'Grid' + this.id
		this.data.open = false

		this.initBackground()
		this.initLines()

		this.options.background = this.background

		this.drawLines()
	}

	initBackground() {
		this.background = new Path.Rectangle({
			name: 'background',
			rectangle: this.backgroundBounds,
			closed: true,
			style: {
				strokeColor: 'black',
				strokeWidth: 1
			}
		})

		// when the background is hit (see wektorUi's onContextMenu) the Grid's dialog will be opened
		// define this via an arrow function, otherwise 'this' in the getDialog function wont be Grid but the background Path 
		// this.background.getDialog = () => this.getDialog()
		this.background.on('contextmenu', event => {
			this.handleContextmenu(event)
		})

		this.background.on('change', event => {
			this.drawLines()
		})

		const symbolDefinition = new SymbolDefinition(this.background)
		this.clippingMask = new SymbolItem(symbolDefinition)

		// making a symbol definition out of this.background somehow sets back the background's position
		// so we have to set the bounds again
		this.background.bounds = this.backgroundBounds

		this.addChild(this.background)
	}

	initLines() {
		this.linesVertical = new Group()
		this.linesHorizontal = new Group()

		this.lines = new Group({
			children: [this.clippingMask, this.linesVertical, this.linesHorizontal],
			clipped: true,
			data: {
				iterable: false,
			}
		})

		this.lineVertical = new Path.Line({
			from: window.view.bounds.topLeft,
			to: window.view.bounds.bottomLeft,
			data: {
				iterable: false,
			}
		})
		this.lineVertical.pivot = this.lineVertical.bounds.topLeft

		this.lineHorizontal = new Path.Line({
			from: window.view.bounds.topLeft,
			to: window.view.bounds.topRight,
			data: {
				iterable: false,
			}
		})
		this.lineHorizontal.pivot = this.lineHorizontal.bounds.topLeft	
	}

	handleDialogChange(target, key, value) {
		switch (key) {
			case 'spacing.vertical':
				this.drawLinesVertical()
				this.emit('change')
				break
			case 'spacing.horizontal':
				this.drawLinesHorizontal()
				this.emit('change')
				break

			case 'lines.style.strokeColor':
			case 'lines.style.strokeWidth':
				this.styleLines()
				break
		}
	}

	handleContextmenu() {
		wektor.openDialog({
			id: this.constructor.name + this.id,
			values: this.options,
			reference: this.background,
			...this.dialog,
			// we can't pass the handler directly because we need the right this-context
			changeHandler: (...args) => this.handleDialogChange(...args)
		})
	}	

	drawLines() {
		this.drawLinesVertical()
		this.drawLinesHorizontal()
		this.emit('change')
	}

	drawLinesVertical() {
		const { width, height } = this.background.bounds
		const { spacing } = this.options

		this.linesVertical.removeChildren()

		this.lineVertical.style = this.options.lines.style
		if (spacing.vertical <= 1) spacing.vertical = 1
		for (let x = 0; x < width; x += spacing.vertical) {		
			const newLine = this.lineVertical.clone()
			newLine.data = {
				iterable: false,
			}
			newLine.position = {
				x: Math.round(this.background.bounds.topLeft.x) + x,
				y: 0
			}
			this.linesVertical.addChild(newLine) 
		}	

		// crossings have to be recalculated
		this.cache.crossings = null				
	}

	drawLinesHorizontal() {
		const { width, height } = this.background.bounds
		const { spacing } = this.options

		this.linesHorizontal.removeChildren()

		this.lineHorizontal.style = this.options.lines.style
		if (spacing.horizontal <= 1) spacing.horizontal = 1
		for (let y = 0; y < height; y += spacing.horizontal) {
			const newLine = this.lineHorizontal.clone()
			newLine.data = {
				iterable: false,
			}
			newLine.position = {
				x: 0,
				y: Math.round(this.background.bounds.topLeft.y) + y,
			}
			this.linesHorizontal.addChild(newLine) 			
		}

		// crossings have to be recalculated
		this.cache.crossings = null		
	}

	styleLines() {
		this.lines.style = this.options.lines.style
	}

	clear() {
		this.linesVertical.removeChildren()
		this.lineHorizontal.removeChildren()
	}

	get crossings() {
		if (this.cache.crossings) 
			return this.cache.crossings

		const allCrossings = []

		for (const lineVertical of this.linesVertical.children) {
			for (const lineHorizontal of this.linesHorizontal.children) {
				const crossings = lineVertical.getCrossings(lineHorizontal)
				allCrossings.push(...crossings)
			}
		}

		this.cache.crossings = allCrossings
		return allCrossings
	}		
}

export default Grid