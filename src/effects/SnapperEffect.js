import BaseEffect from './BaseEffect'
import paper from 'paper'
import wektor from '@/wektor'

class SnapperEffect extends BaseEffect {
	constructor(input, spec) {
		spec = Object.assign({
			options: {
				grid: null,
				snap: {
					segments: true,
					handles: true,
				},
			},
			dialog: {
				layout: {
					grid: {
						type: 'item',
						label: 'grid',
						selector: { class: 'Grid' },
					},
					'snap.segments': {
						type: 'boolean',
						label: 'snap segments',
					},
					'snap.handles': {
						type: 'boolean',
						label: 'snap handles',
					},
				},
			},
			applyOnChanges: ['geometry'],
			mirrorChanges: ['style'],			
		}, spec)

		super(input, spec)	
	}

	openDialog(...args) {
		super.openDialog(...args)
		const hasGrids = wektor.project.getItem({ class: 'Grid' })
		if (!hasGrids)
			wektor.speak(`Snapper needs a grid. You can create one with the <span class="italic">grid tool</span>, then go back to Snapper's settings and select it.`)
	}

	onDialogChange(target, key, value) {
		switch (key) {
			case 'grid':
				this.grid = value
				break
			case 'snap.segments':
			case 'snap.handles':
				this.applyAll()
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
			output.segments = input.segments.map(segment => this.snap(segment))
		} else {
			output.segments = input.segments
		}
	}

	snap(segment) {
		const point = this.options.snap.segments ? this.snapPoint(segment.point) : segment.point
		const snappedSegment = new paper.Segment(point)
		if (this.options.snap.handles) {
			snappedSegment.handleIn = this.snapPoint( segment.handleIn.add(segment.point) ).subtract(snappedSegment.point)
			snappedSegment.handleOut = this.snapPoint( segment.handleOut.add(segment.point) ).subtract(snappedSegment.point)
		} else {
			snappedSegment.handleIn = segment.handleIn
			snappedSegment.handleOut = segment.handleOut
		}
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