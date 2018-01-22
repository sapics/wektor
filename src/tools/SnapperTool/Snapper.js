import paper from 'paper'
import { wektor, ChangeFlag } from '@/wektor'

function getPaperItemFromId(id) {
	if (id === undefined) return
	const paperItem = wektor.project.getItem({ id })
	return paperItem
}

class Mirror extends paper.Group {
	constructor() {
		super()
		this.locked = true
		this.data.open = false
	}

	mirrorItem(item) {
		if (this.mirrorsItem(item) && !item.children) return

		if (item.children) {
			const childrenHandler = () => {
				for (const child of item.children) {
					this.mirrorItem(child)
				}
			}
			wektor.changeTracker.on('children', item, childrenHandler)
			childrenHandler()

			const insertionHandler = () => {
				if (!item.parent) {
					wektor.changeTracker.off('children', item, childrenHandler)
					wektor.changeTracker.off('insertion', item, insertionHandler)
				}
			}
			wektor.changeTracker.on('insertion', item, insertionHandler)
		} else {
			const clone = item.clone()
			clone.data.original = item
			clone.data.iterable = true
			clone.locked = true
			this.addChild(clone)

			if (item.data.iterable !== false)
				this.update(clone, item)

			const insertionHandler = () => {
				if (!item.parent) {
					clone.remove()
					wektor.changeTracker.off('insertion', item, insertionHandler)
					wektor.changeTracker.off('geometry', item, geometryHandler)
					wektor.changeTracker.off('style', item, styleHandler)
				}
			}

			const geometryHandler = () => {
				if (item.data.iterable !== false)
					this.update(clone, item)				
			}

			const styleHandler = () => {
				clone.style = item.style
			}

			wektor.changeTracker.on('insertion', item, insertionHandler)
			wektor.changeTracker.on('geometry', item, geometryHandler)
			wektor.changeTracker.on('style', item, styleHandler)		
		}
	}

	update(item, original) {
		item.segments = original.segments
	}

	mirrorsItem(item) {
		return this.getItem({
			data: {
				original: item,
			}
		})
	}
}

class Snapper extends Mirror {
	constructor(spec) {
		super()
		const self = this

		const specDefault = {
			options: {
				item: null,
				grid: null,
				set name(value) {
					self.name = value
				},
				get name() {
					return self.name
				},
			},

			dialog: {
				payload: {
					locked: true,
					position: {x: 400, y: 400},
				},
				layout: {
					name: {
						type: 'text',
						label: 'name:',
					},
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

		Object.assign(this, specDefault, spec)
		this.name = `Snapper ${this.id}`
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
		if (!this.grid || !item || !original) return

		original.opacity = 0	
		item.removeSegments()
		item.closed = original.closed

		for (const segment of original.segments) {
			item.addSegment( this.snapSegment(segment) )
		}
	}

	initSnapItem(item) {
		// item.opacity = 0
		this.mirrorItem(item)
	}

	update(item, original) {
		this.snapItem(item, original)
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