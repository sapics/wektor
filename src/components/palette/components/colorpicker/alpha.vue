<template>
	<div
		class="alpha"
		@mousedown="onMouseDown"	
		:style="{background: gradient}"	
	>
	</div>
</template>

<style lang="scss" scoped>
.alpha {
	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAL0lEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP4DAb6Ifv78Of50MGoAA+PQDwMAuX5VedFT3cEAAAAASUVORK5CYII=");
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
		},
	},

	data() {
		return {
			gradient: null,
			backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAL0lEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP4DAb6Ifv78Of50MGoAA+PQDwMAuX5VedFT3cEAAAAASUVORK5CYII=")',
		}
	},

	watch: {
		factorHorizontal(value) {
			if (this.direction === 'horizontal')
				this.updateAlpha(value)
		},

		factorVertical(value) {
			if (this.direction === 'vertical')
				this.updateAlpha(value)
		},	
	},

	mounted() {
		this.updateGradient()
		this.$parent.$on('change', this.updateGradient)
	},

	methods: {
		updateAlpha(value) {
			this.color.alpha = 1 - value
			this.$parent.$emit('change')
		},

		updateGradient() {
			const side = this.direction === 'vertical' ? 'top' : 'right'
			const color = `hsl(${this.color.hue}, 100%, 50%)`
			this.gradient = `linear-gradient(to ${side}, transparent, ${color}), ${this.backgroundImage}`
		},
	},
}	
</script>