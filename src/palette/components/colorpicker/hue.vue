<template>
	<div 
		:class="['hue', direction]"
		@mousedown="onMouseDown"
	>
		<div
			class="pointer" 
			ref="pointer"
			:style="pointerPos"
		></div>
	</div>
</template>

<style lang="scss" scoped>
.hue.horizontal {
	background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}

.hue.vertical {
	background: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}

.hue {
	position: relative;

	.pointer {
		background: white;
		position: absolute;
		margin-top: -1px;
		width: 100%;
		height: 5px;
		border-top: 1px solid;
		border-bottom: 1px solid;
		box-sizing: border-box;
	}
}
</style>

<script>
import pad from './pad'

export default {
	extends: pad,

	data() {
		return {
			range: { min: 360, max: 0 }, // we need the value to increase from bottom to top
		}
	},

	computed: {
		color() {
			return this.value
		},

		internalValue: {
			get() {
				return this.color.hue
			},
			set(value) {
				this.$emit('input', { ...this.color, hue: value, type: 'hsb' })
			}
		},		
	},

	mounted() {
		this.pointerSize.height -= 2 // we want the pointer to be able to move into the outer border
	},
}	
</script>