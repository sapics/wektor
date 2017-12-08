<template>
	<div
		class="alpha"
		@mousedown="onMouseDown"	
		:style="{background}"	
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
			pointerColor: 'black',
			backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAL0lEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP4DAb6Ifv78Of50MGoAA+PQDwMAuX5VedFT3cEAAAAASUVORK5CYII=")',
		}
	},

	computed: {
		color() {
			return this.value
		},

		internalValue: {
			get() {
				return this.color.alpha
			},
			set(value) {
				this.$emit('input', {...this.color, alpha: value})
			}
		},

		pointerCss() {
			return { ...this.pointerPos, borderColor: this.pointerColor }
		},

		background() {
			const side = this.direction === 'vertical' ? 'top' : 'right'
			const { red, green, blue } = this.color
			const colorStr = `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`
			return `linear-gradient(to ${side}, transparent, ${colorStr}), ${this.backgroundImage}`			
		}
	},
}	
</script>