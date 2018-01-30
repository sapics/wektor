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
		startResize(event, el) {
			this.resizeEl = el || this.$el

			const { x, y } = event
			const { right, bottom } =  this.resizeEl.getBoundingClientRect()

			this.resizeDelta = {
				x: x - right,
				y: y - bottom
			}

			document.body.style['pointer-events'] = 'none'
			window.addEventListener('mousemove', this.resize)
			window.addEventListener('mouseup', this.endResize)
		},

		resize(event) {
			event.stopPropagation()

			const { x, y } = event
			const { top, left } = this.resizeEl.getBoundingClientRect()

			const newWidth = (x - this.resizeDelta.x) - left
			const newHeight = (y - this.resizeDelta.y) - top

			this.resizeEl.style.width = newWidth + 'px'
			this.resizeEl.style.height = newHeight + 'px'
			this.width = newWidth
			this.height = newHeight
			this.$emit('resize')
		},

		endResize() {
			document.body.style['pointer-events'] = 'auto'
			this.$emit('endResize')
			document.body.classList.remove('cursor-default')
			window.removeEventListener('mousemove', this.resize)
			window.removeEventListener('mouseup', this.endResize)
		},
	},
}