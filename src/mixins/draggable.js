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
			console.log('start drag')
			const el = this.$refs.dialog
			const {top, left} = el.getBoundingClientRect()
			this.dragDelta = {
				x: event.x - left,
				y: event.y - top
			}
			window.addEventListener('mousemove', () => {
				console.log('fuu')
			}, true)
			window.addEventListener('mousemove', this.onDrag)
			window.addEventListener('mouseup', this.endDrag)		
		},

		onDrag(event) {
			if (!this.drag) {
				this.drag = true
				document.body.style['pointer-events'] = 'none'
			}
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
			document.body.style['pointer-events'] = 'auto'
			window.removeEventListener('mousemove', this.onDrag)
			window.removeEventListener('mouseup', this.endDrag)
		},	
	}
}