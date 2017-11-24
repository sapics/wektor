<template>
	<div class="colorpicker">
		<saturation 
			class="saturation"
			:color="color"
		></saturation>			
		<hue 
			class="hue"
			:color="color" 
		></hue>
		<alpha
			class="alpha"
			:color="color"
		></alpha>
		<div class="data">
			<number label="r"></number>
			<number label="g"></number>
			<number label="b"></number>
			<number label="#"></number>
		</div>
	</div>
</template>

<style lang="scss">
.colorpicker {
	width: 100%;
	height: 100%;

	.saturation {
		float: left;
		width: 50%;
		height: 100%;
	}	

	.hue {
		height: 100%;
		width: 15px;
		float: left;
	}

	.alpha {
		float: left;
		width: 15px;
		height: 100%;
	}

	.data {
		display: none;
		float: left;
		width: calc(50% - 30px);

		> * {
			width: 100%;
		}
	}
}	
</style>

<script>
import baseComponent from '../baseComponent'
import saturation from './saturation'
import hue from './hue'
import alpha from './alpha'
import number from '../number'

export default {
	extends: baseComponent,

	components: {saturation, hue, alpha, number},

	props: {
		value: Object
	},

	computed: {
		color() {
			return this.value
		}
	},
}	
</script>