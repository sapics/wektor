import { getDistance } from '@/utils'

export default {
	data() {
		return {
			position: null,
			width: null,
			height: null,			
			pointerCornerDelta: { x: 0, y: 0 },
		}
	},

	computed: {
		pointerCorner() {
			const { position, pointerCornerDelta } = this
			if (!position || !pointerCornerDelta) return
			return {
				x: this.position.x - pointerCornerDelta.x,
				y: this.position.y - pointerCornerDelta.y
			}
		}		
	},

	watch: {
		position() {
			this.updatePointerCorner()
		},
	},

	methods: {
		updatePointerCorner(checkVisibility = false) {
			const { position, width, height, reference } = this
			const el = this.$refs.dialog

			if (!(position && reference && reference.position)) return

			const top = position.y
			const left = position.x
			const bottom = position.y + height
			const right = position.x + width

			const bounds = {
				top, 
				bottom, 
				left, 
				right,
				topLeft: { y: top, x: left },
				topRight: { y: top, x: right },
				bottomLeft: { y: bottom, x: left },
				bottomRight: { y: bottom, x: right },
			}

			let corner
			let corners = []

			// pointerLines from top-corners just look better so we'll bias them by defining the 
			// dialogs vertical position as below even if it really is in between
			const topBias = 0 // 20 // px
			const isAbove = (bounds.bottom + topBias) < reference.position.y
			const isBelow = (bounds.top - topBias) > reference.position.y
			const isLeft = (bounds.right < reference.position.x)
			const isRight = (bounds.left > reference.position.x)

			if (isAbove) {
				if (isRight) {
					corner = bounds.bottomLeft
					corners = [corner, bounds.topLeft, bounds.bottomRight]
				} else if (isLeft) {
					corner = bounds.bottomRight
					corners = [corner, bounds.topRight, bounds.bottomLeft]
				} else {
					corners = [bounds.bottomLeft, bounds.bottomRight]
				}
			} else if (isBelow) {
				if (isRight) {
					corner = bounds.topLeft
					corners = [corner, bounds.topRight, bounds.bottomLeft]
				} else if (isLeft) {
					corner = bounds.topRight
					corners = [corner, bounds.topLeft, bounds.bottomRight]
				} else {
					corners = [bounds.topLeft, bounds.topRight]
				}
			} else {
				if (isRight) {
					corner = bounds.topLeft
					corners = [corner, bounds.bottomLeft]
				} else if (isLeft) {
					corner = bounds.topRight
					corners = [corner, bounds.bottomRight]
				}
				// else: dialog overlays reference, no pointerline possible			
			}

			if (checkVisibility) {
				corner = null
				for (let i = 0; i < corners.length; i++) {
					const point = corners[i]
					const topMostEl = document.elementFromPoint(point.x, point.y)
					if (el === topMostEl) {
						corner = point
						break
					}
				}
				corners = []
			} 

			if (!corner) {
				const distances = corners.map(corner => getDistance(corner, reference.position))
				const nearestCorner = corners[ distances.indexOf(Math.min(...distances)) ]
				corner = nearestCorner
			}

			if (!corner) {
				this.pointerCornerDelta = null
			} else {
				this.pointerCornerDelta = {
					x: position.x - corner.x,
					y: position.y - corner.y
				}	
			}		
		},	
	},
}