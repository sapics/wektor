import BaseEffect from './BaseEffect'
import paper from 'paper'

class SnapperEffect extends BaseEffect {
	constructor(input, spec) {
		spec = Object.assign({
			options: {
				grid: null,
			},
			dialog: {
				layout: {
					grid: {
						type: 'drop',
						label: 'drop grid'
					},
				},
			},
			applyOnChanges: ['geometry'],
			// mirrorChanges: ['style'],			
		}, spec)

		super(input, spec)	
	}

	onDialogChange(target, key, value) {
		switch (key) {
			case 'grid':
				this.grid = value
				break
		}
	}

	set grid(grid) {
		const handler = () => this.applyAll()

		if (this._grid) 
			this._grid.off('change', handler)

		grid.on('change', handler)
		this._grid = grid
		this.applyAll()
	}

	get grid() {
		return this._grid
	}

	apply(input, output) {
		if (this.grid) {
			output.removeSegments()
			output.segments = input.segments.map(segment => this.snapSegment(segment))
		} else {
			output.segments = input.segments
		}
	}

	snapSegment(segment) {
		const snappedSegment = new paper.Segment( this.snapPoint(segment.point) )
		snappedSegment.handleIn = this.snapPoint( segment.handleIn.add(segment.point) ).subtract(snappedSegment.point)
		snappedSegment.handleOut = this.snapPoint( segment.handleOut.add(segment.point) ).subtract(snappedSegment.point)
		return snappedSegment
	}

	snapHandle(segment, type) {
		const handlePoint = segment[type]
		return this.snapPoint()
	}

	snapPoint(point) {
		const grid = this.grid
		let minDistance = -1
		let closestCrossing = null
		for (const crossing of grid.crossings) {
			const distance = point.subtract(crossing.point).length
			if (minDistance === -1 || distance < minDistance) {
				minDistance = distance
				closestCrossing = crossing
			}
		}
		return closestCrossing.point
	}	
}

export default SnapperEffect