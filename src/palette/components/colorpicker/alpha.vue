<template>
	<div
		class="alpha"
		@mousedown="onMouseDown"		
	>
		<div class="alpha-gradient" :style="{background}"></div>
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
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='lightgray'%3E%3Crect x='0' y='0' width='10' height='10' /%3E%3Crect x='10' y='10' width='10' height='10' /%3E%3C/svg%3E");
	background-repeat: repeat;
	background-size: 1em 1em;
	background-color: white;

	.alpha-gradient {
		width: 100%;
		height: 100%;
		background: green;
	}

	.pointer {
		background: white;
		position: absolute;
		margin-top: -1px;
		width: 100%;
		height: 5px;
		border-top: 1px solid black;
		border-bottom: 1px solid black;
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
			range: { min: 1, max: 0.00001 }, // we need the value to increase from bottom to top
			pointerColor: 'black',
			backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' view='0 0 20 20'%3E%3Crect x='0' y='0' width='10' height='10' fill='gray' /%3E%3Crect x='10' y='10' width='10' height='10' fill='gray' /%3E%3C/svg%3E")`,
			backgroundImageOLD: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAL0lEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP4DAb6Ifv78Of50MGoAA+PQDwMAuX5VedFT3cEAAAAASUVORK5CYII=")',
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
			return `linear-gradient(to ${side}, transparent, ${colorStr})`			
		}
	},

	mounted() {
		this.pointerSize.height -= 1
	},
}	
</script>