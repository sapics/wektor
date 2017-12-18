import SelectionTool from '@/tools/SelectionTool'

class SinglePathSelectionTool extends SelectionTool {
	dragSegment(segment, event) {
		const isFirst = (segment === this.item.firstSegment )
		const isLast = (segment === this.item.lastSegment)

		if (isFirst || isLast) {
			event.point = {
				x: segment.point.x,
				y: event.point.y
			}
		}

		segment.point = this.item.globalToLocal(event.point)
		this.emitChange({ type: 'segment', action: 'drag', segment, event })
	}

	onMouseDown(event) {
		// always select all segments no matter what is clicked
		super.onMouseDown(event)
		if (this.item) {
			for (const segment of this.item.segments) {
				segment.selected = true
			}
		}

		if (this.segment || this.handle) {
			event.stopPropagation()
		}
	}

	releaseItem() {
		// override SelectionTool's releasItem function 
		// to prevent unselecting the tool's item	
		this.segment = this.handle = null	
	}	
}

export default SinglePathSelectionTool