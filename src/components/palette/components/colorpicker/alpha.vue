<template>
	<div
		class="alpha"
		@mousedown="onMouseDown"	
		:style="{background: gradient}"	
	>
		<div 
			class="pointer" 
			ref="pointer"
			:style="pointerCss"
		></div>
	</div>
</template>

<style lang="scss" scoped>
.alpha {
	position: relative;
	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAL0lEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP4DAb6Ifv78Of50MGoAA+PQDwMAuX5VedFT3cEAAAAASUVORK5CYII=");

	.pointer {
		background: white;
		position: absolute;
		width: 100%;
		margin-top: -1px;
		height: 5px;
		border-top: 1px solid;
		border-bottom: 1px solid;
		box-sizing: border-box;
	}
}
</style>

<script>
import pad from './pad'
import { getContrast } from '@/utils'

export default {
	extends: pad,

	props: ['value'],

	data() {
		return {
			range: { min: 1, max: 0 }, // we need the value to increase from bottom to top
			gradient: null,
			pointerColor: 'black',
			backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAL0lEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP4DAb6Ifv78Of50MGoAA+PQDwMAuX5VedFT3cEAAAAASUVORK5CYII=")',
		}
	},

	computed: {
		pointerCss() {
			return { ...this.pointerPos, borderColor: this.pointerColor }
		}
	},

	// watch: {
	// 	value(value) {
	// 		this.color.alpha = value
	// 		this.$parent.$emit('change')
	// 	}
	// },

	mounted() {
		// this.value = this.color.alpha
		// this.update()
		// this.$parent.$on('change', this.update)
		// this.pointerSize.height -= 2
	},

	methods: {
		update() {
			this.updateGradient()
			this.updatePointerColor()
		},

		updatePointerColor() {
			// const contrast = getContrast(this.color, false) 
			// this.pointerColor = contrast < 0.5 ? 'black' : 'white'	
		},

		updateGradient() {		
			const side = this.direction === 'vertical' ? 'top' : 'right'
			const color = this.color.toCSS(true) // forcing convertion to hex will ignore alpha which we need here
			this.gradient = `linear-gradient(to ${side}, transparent, ${color}), ${this.backgroundImage}`
		},
	},
}	
</script>