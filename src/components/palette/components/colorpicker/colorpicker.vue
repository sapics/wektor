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
		<div class="alpha-nocolor-wrap">
			<alpha
				class="alpha"
				:color="color"
			></alpha>
			<svg
				class="no-color"
				viewBox="0 0 10 10"
				@click="unsetColor"
			>
				<line vector-effect="non-scaling-stroke" fill="none" stroke="#000000" stroke-width="1" stroke-miterlimit="10" x1="0" y1="10" x2="10" y2="0"/>
				<line vector-effect="non-scaling-stroke" fill="none" stroke="#000000" stroke-width="1" stroke-miterlimit="10" x1="10" y1="10" x2="0" y2="0"/>				
			</svg>
		</div>
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
	width: calc(150px + 3 * 1em);
	height: 150px;

	.saturation {
		float: left;
		width: calc(100% - 3 * 1em);
		height: 100%;
	}	

	.hue {
		height: 100%;
		width: 1em;
		float: left;
	}

	.alpha-nocolor-wrap {
		position: relative;
		float: left;
		width: 1em;
		height: 100%;

		.alpha {
			width: 100%;
			height: calc(100% - 1em);
		}

		.no-color {
			box-sizing: border-box;
			width: 1em;
			height: 1em;
			cursor: pointer;		
		}
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

	methods: {
		unsetColor() {
			this.$emit('input', null)
		}
	},
}	
</script>