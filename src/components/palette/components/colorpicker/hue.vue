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
		margin-top: -1px;
		position: absolute;
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

	props: {
		color: Object,
	},

	data() {
		return {
			range: { min: 360, max: 0 }, // we need the value to increase from bottom to top
		}
	},

	mounted() {
		this.pointerSize.height -= 2 // we want the pointer to be able to move into the outer border
	},
}	
</script>