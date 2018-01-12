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

class Mirror extends paper.Group {
	mirrorItem(item) {
		if (this.mirrorsItem(item)) return

		if (item.hasChildren()) {
			wektor.changeTracker.onItemChange(item.id, ChangeFlag.CHILDREN, () => {
				this.mirrorItem(item)
			})
			for (const child of item.children) {
				this.mirrorItem(child)
			}
		} else {
			const clone = item.clone()
			clone.data.originalId = item.id
			this.addChild(clone)
		}
	}

	mirrorsItem(item) {
		return this.getItem({
			data: {
				originalId: item.id,
			}
		})
	}
}

class Snapper extends Mirror {
	constructor(spec) {
		super()

		Object.assign(this, specDefault, spec)
	}

	snap(items) {
		items = items || this.children

		for (const item of items) {
			if (item.hasChildren())
				this.snap(item.children)
			else 
				this.snapItem(item, item.data.original)
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
		item.opacity = 0
		this.mirrorItem(item)
	}

	// initSnapItem(item) {
	// 	if (item.hasChildren()) {
	// 		for (const child of item.children)
	// 			this.initSnapItem(child)
	// 			wektor.changeTracker.onItemChange(item.id, ChangeFlag.CHILDREN, () => {
	// 				this.initSnapItem(item)
	// 			})	
	// 	} else {
	// 		if (this.getItem({ data: { originalId: item.id } })) {
	// 			return
	// 		}
	// 		const clone = item.clone()
	// 		item.opacity = 0
	// 		clone.data.original = item
	// 		clone.data.originalId = item.id
	// 		clone.locked = true
	// 		this.addChild(clone)

	// 		wektor.changeTracker.onItemChange(item.id, ChangeFlag.GEOMETRY, () => {
	// 			this.snapItem(clone, item)
	// 		})
	// 	}
	// }

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