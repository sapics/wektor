import Stielauge from './Stielauge'
import paper from 'paper'
const { Path, Group, Point } = paper

class Wek extends Group {
	constructor() {
		super({ guide: true })

		this.relativePositions = {
			eyes: {
				left: [45, 86],
				right: [105, 86],
			},
			above: [75, 90],
		}

		this.create()
	}
	
	create() {
		this.below = new Group({
			name: 'below',
			guide: true,
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
				new Path('M91.4,144.3 c1.9-4.6-6.1-15-9.7-20.3c-1-1.5-3.2-1.6-4.5-0.3l-2.5,4c-0.4,0.6-1.2,0.5-1.5-0.2L72,124c-0.4-1-1.7-1.3-2.5-0.6l-17.7,16.2'),
				new Path('M55.9,139.3 c0,0,9.7-0.5,18.5,0.6c8.7,1.1,11,0.8,16.8,4.1'),
				new Path('M52.5,140.1 c0,0,6.8,14.3,20,14c13.3-0.2,18.9-9.6,18.9-9.6l-4.1-6.4c0,0-6.1-3.5-6.9-8.7c-2.2,3.1-11,6.3-14.7,2.7c-4,9.5-13.2,7-13.2,7'),
				new Path('M64.7,134.5 c1.2,1.8,0.7,4.5,0.7,4.5s0.2-5.4,2.8-5.6'),
				new Path('M70.6,133.9 c0,0,1.3,0.5,1,5.6c0.1-0.1,0.4-6,3.8-6.7c3.4-0.7,3.7,4.9,3.3,7.3c0.2-1.4,0.4-6.2,3.7-6.2'),    
				
				// nose
				new Path('M67.9,114.6 c0,0-3.9,3.9-0.6,10.8'),
				new Path('M84.8,112.9 c0,0,4.5,6-1.2,13.7'),
			],
			strokeColor: 'black',
		})
		
		const eyes = this.createEyes()
		
		this.above = new Group({
			name: 'above',
			guide: true,
			children: [
				new Path.Rectangle({
					name: 'overlayLeft',
					width: 25,
					height: 20,
					position: [46, 93.5],
					fillColor: 'white',
					strokeWidth: 0,
				}),
				new Path.Rectangle({
					name: 'overlayRight',
					width: 25,
					height: 20,
					position: [106, 94],
					fillColor: 'white',
					strokeWidth: 0,
				}),                
				new Path('M65.5,89.5 c0,0-2.5-5.7-7.3-5.7l-24.4-0.5c-5.3,0.3-6.5-5.5-6.5-5.5'),
				new Path('M86.9,89.9c0,0,2.5-5.7,7.3-5.7l24.4-0.5c5.3,0.3,6.5-5.5,6.5-5.5'),
			],
			strokeColor: 'black',
		})
		
		this.addChildren([this.below])
	}
	
	createEyes() {
		const left = new Stielauge({
			position: this.relativePositions.eyes.left,
		})
		left.guide = true
		
		const right = new Stielauge({
			position: this.relativePositions.eyes.right,
		})
		left.guide = true
		
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
		this.above.position = this.bounds.topLeft.add( this.relativePositions.above )
	}
	
	get position() {
		return super.position
	}
	
	set fillColor(value) {
		try {
			const { face, earLeft, earRight } = this.below.children
			const { overlayLeft, overlayRight } = this.above.children
			for (const item of [face, earLeft, earRight, overlayLeft, overlayRight])
				item.fillColor = value
		} catch (e) {
			// children might not be created yet
		}
	}
	
	set strokeColor(value) {
		super.strokeColor = value
		this.above.strokeColor = value
	}
}

export default Wek