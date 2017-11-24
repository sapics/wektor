<template>
	<div
		class="saturation"
		:style="{'background-color': bgColor}"
		@mousedown="onMouseDown"		
	>
	</div>
</template>

<style lang="scss" scoped>
.saturation {
	background: linear-gradient(to right, white, transparent), linear-gradient(to top, black, transparent);
}
</style>

<script>
import pad from './pad'

export default {
	extends: pad,

	props: {
		color: Object,
	},

	data() {
		return {
			bgColor: null,
		}
	},	

	watch: {
		factorHorizontal(value) {
			this.color.saturation = value
			this.$parent.$emit('change')
		},

		factorVertical(value) {
			this.color.brightness = 1 - value
			this.$parent.$emit('change')
		},		
	},

	mounted() {
		this.updateBgColor()
		this.$parent.$on('change', this.updateBgColor)
	},	

	methods: {
		updateBgColor() {
			this.bgColor = `hsl(${this.color.hue}, 100%, 50%)`
		},
	},	
}
</script>