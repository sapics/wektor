export default {
	data() {
		return {
			resizeEl: null, // use this property to specify a custom el to be resized
			resizeDelta: { x: 0, y: 0 },
			width: 0,
			height: 0,
		}
	},

	methods: {
		startResize(event) {
			const el = this.resizeEl || this.$el
			const { x, y } = event
			const { right, bottom } =  el.getBoundingClientRect()

			this.resizeDelta = {
				x: x - right,
				y: y - bottom
			}

			window.addEventListener('mousemove', this.resize)
			window.addEventListener('mouseup', this.endResize)
		},

		resize(event) {
			const el = this.resizeEl || this.$el

			const { x, y } = event
			const { top, left } = el.getBoundingClientRect()

			const newWidth = (x - this.resizeDelta.x) - left
			const newHeight = (y - this.resizeDelta.y) - top

			el.style.width = newWidth + 'px'
			el.style.height = newHeight + 'px'
			this.width = newWidth
			this.height = newHeight
			this.$emit('resize')
		},

		endResize() {
			this.$emit('end-resize')
			window.removeEventListener('mousemove', this.resize)
			window.removeEventListener('mouseup', this.endResize)
		},
	},
}