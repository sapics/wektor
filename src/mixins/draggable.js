import { pointToCssPercent, constrainElPosition } from '@/utils'
import wektor from '@/wektor'

export default {
	data() {
		return {
			drag: false,
			position: { x: 0, y: 0 },
			dragDelta: { x: 0, y: 0 },
		}
	},

	methods: {
		startDrag(event) {
			const el = this.$refs.dialog
			const {top, left} = el.getBoundingClientRect()
			this.dragDelta = {
				x: event.x - left,
				y: event.y - top
			}
			document.addEventListener('mousemove', this.onDrag)		
		},

		onDrag(event) {
			this.drag = true
			event.preventDefault()

			const position = {
				x: event.x - this.dragDelta.x,
				y: event.y - this.dragDelta.y,
			}

			const bounds = {
				top: position.y,
				left: position.x,
				bottom: position.y + this.height,
				right: position.x + this.width,
				width: this.width,
				height: this.height,
			}

			const windowSize = {
				width: window.innerWidth || document.documentElement.clientWidth,
				height: window.innerHeight || document.documentElement.clientHeight,
			}

			this.position = constrainElPosition(windowSize, bounds, position)
		},		

		endDrag(event) {
			this.drag = false
			document.removeEventListener('mousemove', this.onDrag)	
		},	
	}
}