<template>
	<div
		class="saturation"
		:style="{'background-color': bgColor}"
		@mousedown="onMouseDown"		
	>
		<div 
			ref="pointer"
			class="pointer"
			:style="pointerCss" 
		></div>
	</div>
</template>

<style lang="scss" scoped>
.saturation {
	position: relative;
	overflow: hidden;
	background: linear-gradient(0deg, black, transparent), linear-gradient(90deg, white, transparent);

	.pointer {
		position: absolute;
		box-sizing: border-box;
		width: 10px;
		height: 10px;
		border: 1px solid black;
	}	
}
</style>

<script>
import pad from './pad'
import { getContrast } from '@/utils'

export default {
	extends: pad,

	props: {
		direction: {
			type: String,
			default: 'both'
		}
	},

	data() {
		return {
			range: {
				x: {
					min: 0,
					max: 1
				},
				y: {
					min: 1, // we need the value to increase from bottom to top
					max: 0
				}
			},
		}
	},

	computed: {
		color() {
			return this.value
		},

		internalValue: {
			get() {
				return {
					x: this.color.saturation,
					y: this.color.brightness
				}
			},
			set(value) {
				const { x: saturation, y: brightness } = value
				this.$emit('input', { ...this.color, saturation, brightness })
			}
		},

		pointerCss() {
			return { ...this.pointerPos, borderColor: this.pointerColor }
		},

		bgColor() {
			return `hsl(${this.color.hue}, 100%, 50%)`
		},

		pointerColor() {
			const contrastToBlack = getContrast(this.color, { red: 0, green: 0, blue: 0 })
			return contrastToBlack < 0.25 ? 'white' : 'black'	
		},
	},
}
</script>