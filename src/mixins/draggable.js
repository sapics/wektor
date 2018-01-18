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
			this.position = { 
				x: event.x - this.dragDelta.x,
				y: event.y - this.dragDelta.y 
			}
		},		

		endDrag(event) {
			this.drag = false
			document.removeEventListener('mousemove', this.onDrag)	
		},	
	}
}