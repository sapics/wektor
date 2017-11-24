<template>
	<div
		@mousedown="onMouseDown"
	></div>
</template>

<script>
export default {
	data() {
		return {
			factorHorizontal: null,
			factorVertical: null,
		}
	},

	methods: {
		onMouseDown(event) {
			event.stopPropagation()
			this.bindListeners()
		},

		bindListeners() {
			window.addEventListener('mousemove', this.onChange)
			window.addEventListener('mouseup', this.unbindListeners)
		},

		unbindListeners(event) {
			event.stopPropagation()
			window.removeEventListener('mousemove', this.onChange)
			window.removeEventListener('mouseup', this.unbindListeners)
		},

		onChange(event) {
			event.preventDefault()

			const el = this.$el
			const {top, left, width, height} = el.getBoundingClientRect()
			const {pageX, pageY} = event
			const x = pageX - left
			const y = pageY - top
			
			const factorVertical = 1 / height * y
			const factorHorizontal = 1 / width * x

			this.factorHorizontal = this.cropFactor(factorHorizontal)
			this.factorVertical = this.cropFactor(factorVertical)
		},

		cropFactor(factor) {
			if (factor < 0) factor = 0
			if (factor > 1) factor = 1
			return factor			
		},		
	}	
}	
</script>