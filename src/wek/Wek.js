import Stielauge from './Stielauge'
import wektor from '@/wektor'
import paper from 'paper'
const { Path, Group, Point } = paper

class Wek extends Group {
	constructor() {
		super({ iterable: false, selectable: false })

		this.relativePositions = {
			eyes: {
				left: [45, 86],
				right: [105, 86],
			},
			above: {
				left: [46, 89],
				right: [105, 89],
			},
		}

		this.on('click', event => {
			if (event.event.button === 2) return false
			this.selected = true
		})

		this.on('contextmenu', () => {
			const dialogId = this.constructor.name + this.id
			wektor.openDialog({
				id: dialogId,
				layout: {
					group: {
						align: 'columns',
						label: 'stroke',			
						strokeWidth: {
							type: 'number',
							unit: 'px',
							units: 'distances',				
						},
						strokeColor: {
							type: 'color',
						},						
					},					
					fillColor: {
						type: 'color',
						label: 'fill color',
					},
				},
				values: this,
				reference: this,
			})
		})

		this.create()
		this.fillColor = 'white'
		this.strokeColor = 'black'
		this.strokeWidth = 1
	}
	
	create() {
		this.below = new paper.Group({
			name: 'below',
			iterable: false,
			children: [
				// ears
				new Path({
					name: 'earLeft',
					pathData: 'M17,90 c0,0-0.2-12.4-5.3-22S4.1,58.9,3,59.5c-1.1,0.6-3.5,2.1,3.8,11.1c-2.9-2.5-4.3-3-5.2-2.5c-0.4,0.2-2.3,0.7,0.3,7.2 c2.6,6.5,7.5,25.2,8.6,27.7c3,6.8,7.2,11.9,7.2,11.9',
				}),
				new Path({
					name: 'earRight',
					pathData: 'M133,89.7 c0,0,0.2-12.4,5.3-22s7.6-9.1,8.7-8.5c1.1,0.6,3.5,2.1-3.8,11.1c2.9-2.5,4.3-3,5.2-2.5c0.4,0.2,2.3,0.7-0.3,7.2 c-2.6,6.5-7.5,25.2-8.6,27.7c-3,6.8-7.2,11.9-7.2,11.9',
				}),                
				
				// face
				new Path({
					name: 'face',
					pathData: 'M132.9,97 c0,53.3-25.9,96.5-57.8,96.5S17.2,150.3,17.2,97S21.1,0.5,75.1,0.5C128.1,0.5,132.9,43.7,132.9,97z',
				}),
				
				// cheeks
				new Path('M28.8,114 c0,0,14.4,10.7,25.4-7.5'),
				new Path('M95.2,109.7 c0,0,5.8,10.1,21.7,10.1'),
				
				// eyesocket left
				new Path('M58.9,83.8 c0,0-3.2-10.3-12.4-10.3c-7,0-9,2.7-12.3,9.7'),
				
				// eyesocket right
				new Path('M93.5,84.3 c0,0,3.2-10.3,12.4-10.3c7,0,9,2.7,12.3,9.7'),
				
				// mouth
				new Path('M92.8,139.7 c-4.1-6.5-10.6-13.8-12.1-15.1c-1.5-1.5-3.5-1.6-4.6,0.2l-2.4,3.7l-1.2-2.7c-0.8-1.8-2.9-1.9-4.4-0.9c-2,1.4-8.9,6-15.4,14.8'),
				new Path('M50.1,138.7c2.9,2.3,9.8,0.7,16.7-5.5c3.5,1.8,10.5,1.9,13.2,0.2c3.4,5.6,12.3,7.6,15.5,5.6'),
				new Path('M73,151.4 c10.7-0.1,19.2-11.3,19.2-11.3s-11.5,0.3-19.1,0.1c-7.7-0.1-19.7-0.2-19.7-0.2S62.4,151.5,73,151.4z'),
				new Path('M73.6,140.2 c0,0,0.7-5-2.3-5.7c-3-0.7-3.7,5.7-3.7,5.7s0.3-4.9-2-6'),
				new Path('M84.5,140.1 c0-2.3-0.3-2.7-0.3-2.7'),
				new Path('M81.3,135.1 c-1.8,0.5-1.9,5.1-1.9,5.1'),
				new Path('M79.4,140.3 c0-5.3-1.8-6-1.8-6'),
				new Path('M75.9,134.5 c-1.7,0.5-2.3,5.7-2.3,5.7'),
				new Path('M62.6,136.5 c-0.6,2.2-0.5,3.6-0.5,3.6'),

				// nose
				new Path('M67.9,114.6 c0,0-3.9,3.9-0.6,10.8'),
				new Path('M84.8,112.9 c0,0,4.5,6-1.2,13.7'),
			],
			strokeColor: 'black',
		})
		for (const child of this.below.children) {
			child.set({
				iterable: false,
				selectable: false,
			})
			child.on('contextmenu', event => this.emit('contextmenu', event))
		}

		const eyes = this.createEyes()

		this.aboveLeft = new Group({
			name: 'aboveLeft',
			guide: true,
			children: [
				new Path({
					name: 'overlayLeft',
					pathData: 'M33.8,83.3l24.4,0.5c4.8,0,7.3,5.7,7.3,5.7V101H33.8V83.3z',
					strokeWidth: 0,
					guide: true,
				}),
				new Path({
					name: 'eyeLine',
					pathData: 'M65.5,89.5 c0,0-2.5-5.7-7.3-5.7l-24.4-0.5c-5.3,0.3-6.5-5.5-6.5-5.5',
					guide: true,
				}),
			],
		})
		
		this.aboveRight = new Group({
			name: 'aboveRight',
			guide: true,
			children: [
				new Path({
					name: 'overlayRight',
					pathData: 'M118.6,83.8l-24.4,0.5c-4.8,0-7.3,5.7-7.3,5.7V101h31.7V83.8z',
					strokeWidth: 0,
					guide: true,
				}),
				new Path({
					name: 'eyeLine',
					pathData: 'M86.9,89.9c0,0,2.5-5.7,7.3-5.7l24.4-0.5c5.3,0.3,6.5-5.5,6.5-5.5',
					guide: true,
				})
			],
		})

		this.aboveLeft.insertAbove(eyes.left)
		this.aboveRight.insertAbove(eyes.right)
		this.addChild(this.below)
	}
	
	createEyes() {
		const left = new Stielauge(this, {
			position: this.relativePositions.eyes.left,
		})
		
		const right = new Stielauge(this, {
			position: this.relativePositions.eyes.right,
		})
		
		this.eyes = { left, right }
		return { left, right }
	}
	
	update(event) {
		const { left, right } = this.eyes
		left.update(event)
		right.update(event)
	}
	
	set position(value) {
		super.position = value
		const { left, right } = this.eyes
		left.position = this.bounds.topLeft.add( this.relativePositions.eyes.left )
		right.position = this.bounds.topLeft.add( this.relativePositions.eyes.right )
		this.aboveLeft.position = this.bounds.topLeft.add( this.relativePositions.above.left )
		this.aboveRight.position = this.bounds.topLeft.add( this.relativePositions.above.right )
	}
	
	get position() {
		return super.position
	}
	
	set fillColor(value) {
		this._fillColor = value
		try {
			const { face, earLeft, earRight } = this.below.children
			const { overlayLeft } = this.aboveLeft.children
			const { overlayRight } = this.aboveRight.children
			for (const item of [face, earLeft, earRight, overlayLeft, overlayRight])
				item.fillColor = value
		} catch (e) {
			// children might not be created yet
		}
	}

	get fillColor() {
		return this._fillColor
	}
	
	set strokeColor(value) {
		super.strokeColor = value
		this.aboveLeft.strokeColor = value
		this.aboveRight.strokeColor = value
	}

	get strokeColor() {
		return super.strokeColor
	}

	set strokeWidth(value) {
		super.strokeWidth = value
		this.aboveLeft.children['eyeLine'].strokeWidth = value
		this.aboveRight.children['eyeLine'].strokeWidth = value		
	}

	get strokeWidth() {
		return super.strokeWidth
	}
}	

export default Wek