import paper from 'paper'
import { wektor, ChangeFlag } from '@/wektor'

function getPaperItemFromId(id) {
	if (id === undefined) return
	const paperItem = wektor.project.getItem({ id })
	return paperItem
}

const specDefault = {
	options: {
		item: null,
		grid: null
	},

	dialog: {
		payload: {
			locked: true,
			position: {x: 400, y: 400},
		},
		layout: {
			item: {
				type: 'drop',
				label: 'drop item',
			},
			grid: {
				type: 'drop',
				label: 'drop grid',
				allowedTypes: 'Grid'
			}
		}
	}
}

class Snapper extends paper.Group {
	constructor(spec) {
		super()

		Object.assign(this, specDefault, spec)
	}

	snap() {
		for (const child of this.children) {
			this.snapItem(child, child.data.original)
		}
	}

	snapItem(item, original) {
		if (!this.grid) return

		item.removeSegments()
		item.closed = original.closed

		for (const segment of original.segments) {
			item.addSegment( this.snapSegment(segment) ).selected = true
		}
	}

	initSnapItem(item) {
		const clone = new item.constructor()
		clone.data.original = item
		this.addChild(clone)
		wektor.changeTracker.onItemChange(item.id, ChangeFlag.GEOMETRY, () => {
			this.snapItem(clone, item)
		})
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

	openDialog(event) {
		const spec = {
			id: this.constructor.name + this.id,
			values: this.options,
			...this.dialog,
			changeHandler: (...args) => this.handleDialogChange(...args)
		}

		if (event) {
			// the event might be a paper-event so we access the original event
			event = event.event || event
			spec.payload.position = { x: event.x, y: event.y }
		}

		wektor.openDialog(spec)
	}

	handleDialogChange(target, key, value) {
		switch (key) {
			case 'grid':
				var paperId = (value && value.id)
				var paperItem = getPaperItemFromId(paperId)
				if (paperItem) {
					this[key] = paperItem
					paperItem.on('change', () => this.snap())
					// this.snap()
				}
				break				
			case 'item':
				var paperId = (value && value.id)
				var paperItem = getPaperItemFromId(paperId)
				if (paperItem) {
					this[key] = paperItem
					this.initSnapItem(paperItem)
					// this.snap()
				}
				break
		}
	}
}

export default Snapper