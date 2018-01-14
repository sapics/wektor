<template>
	<div class="colorpicker">
		<saturation 
			class="saturation"
			v-model="color"
		></saturation>			
		<hue 
			class="hue"
			v-model="color" 
		></hue>
		<div class="alpha-nocolor-wrap">
			<alpha
				class="alpha"
				v-model="color"
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

<style lang="scss" scoped>
.alpha-wrap {
	height: 100px;
	width: 200px;
}

.colorpicker {
	position: relative;
	width: 100%;
	height: 100%;
	min-width: 3em;
	min-height: 3em;

	.saturation {
		float: left;
		width: calc(100% - 2 * 1em);
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
import paper from 'paper'
import { valueToColor, colorToValue } from './colorUtils.js'
import { isString } from '@/utils'

// the colorpicker is inspired by vue-color (https://github.com/xiaokaike/vue-color)
// I just needed a slimmer colorpicker that is able to deal with paper'js Color.toJSON format

export default {
	extends: baseComponent,

	components: {saturation, hue, alpha, number},

	data() {
		return {
			internalColor: this.value ? valueToColor(this.value) : this.createDefaultColor(this.value)
		}
	},

	computed: {
		type() {
			return isString(this.value[1]) ? this.value[1] : 'rgb'
		},

		color: {
			get() {
				return this.internalColor
			},
			set(color) {
				if (color) this.internalColor = color
				this.$emit('input', colorToValue(color))
			}
		},
	},

	watch: {
		value(value) {
			if (value)
				this.internalColor = valueToColor(value, this.color)
		}
	},

	methods: {
		createDefaultColor() {
			const returnFormat = this.payload.return

			let colorValue
			switch (returnFormat) {
				case 'css':
					colorValue = 'rgb(0, 0, 0)'
					break
				default:
					colorValue = ['Color', 0, 0, 0]
			}

			return valueToColor(colorValue)
		},

		unsetColor() {
			this.$emit('input', null)
		},
	},
}	
</script>