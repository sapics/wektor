<template>
	<div 
		:class="['hue', direction]"
		@mousedown="onMouseDown"
	></div>
</template>

<style lang="scss" scoped>
.hue.horizontal {
	background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}

.hue.vertical {
	background: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}
</style>

<script>
import pad from './pad'

export default {
	extends: pad,

	props: {
		color: Object,
		direction: {
			type: String,
			default: 'vertical'
		}
	},

	watch: {
		factorHorizontal(value) {
			if (this.direction === 'horizontal')
				this.updateHue(value)
		},

		factorVertical(value) {
			if (this.direction === 'vertical')
				this.updateHue(value)
		},	
	},

	methods: {
		updateHue(value) {
			this.color.hue = value * 360
			this.$parent.$emit('change')
		},
	},
}	
</script>