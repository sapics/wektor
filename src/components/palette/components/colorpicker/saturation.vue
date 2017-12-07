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
	background: linear-gradient(0deg, black, transparent), linear-gradient(90deg, white, transparent);

	.pointer {
		position: absolute;
		box-sizing: border-box;
		width: 10px;
		height: 10px;
		border: 1px solid;
	}	
}
</style>

<script>
import pad from './pad'
import { getContrast } from '@/utils'

export default {
	extends: pad,

	props: {
		values: {},
		direction: {
			type: String,
			default: 'both'
		}
	},

	data() {
		return {
			bgColor: null,
			pointerColor: 'black',
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
			value: {
				x: null,
				y: null
			},
		}
	},

	computed: {
		pointerCss() {
			return { ...this.pointerPos, borderColor: this.pointerColor }
		}
	},	

	// watch: {
	// 	value({ x, y }) {
	// 		this.color.brightness = y
	// 		this.color.saturation = x	
	// 		this.$parent.$emit('change')
	// 	}
	// },

	mounted() {
		// this.value = {
		// 	x: this.color.saturation,
		// 	y: this.color.brightness
		// }
		this.updateBgColor()
		this.$parent.$on('change', this.update)
	},	

	methods: {
		update() {
			this.updateBgColor()
			this.updatePointerColor()
		},

		updatePointerColor() {
			// const contrast = getContrast(this.color, false) // ignore alpha
			// this.pointerColor = contrast < 0.5 ? 'black' : 'white'	
		},		

		updateBgColor() {
			this.bgColor = `hsl(${this.color.hue}, 100%, 50%)`
		},
	},	
}
</script>