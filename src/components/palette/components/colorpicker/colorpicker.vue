<template>
	<div class="colorpicker">
<!-- 		<saturation 
			class="saturation"
			:values="hsb"
		></saturation>	 -->		
		<hue 
			class="hue"
			v-model="hsb.hue" 
		></hue>
		<div class="alpha-nocolor-wrap">
			<alpha
				class="alpha"
				v-model="alpha"
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
import paper from 'paper'
import converters from './colorUtils.js'
import { isString } from '@/utils'

export default {
	extends: baseComponent,

	components: {saturation, hue, alpha, number},

	props: {
		value: Array
	},

	data() {
		return {
			alpha: null,
			rgb: {},
			hsb: {}
		}
	},

	computed: {
		type() {
			return isString(this.value[1]) ? this.value[1] : 'rgb'
		},

		// alpha() {
		// 	const alpha = this.type === 'rgb' ? this.value[4] : this.value[5]
		// 	return alpha || 1
		// },

		// rgb() {
		// 	let red, green, blue

		// 	switch (this.type) {
		// 		case 'rgb':
		// 			[, red, green, blue] = this.value
		// 			break

		// 		case 'hsb':
		// 			const hsb = this.hsb;
		// 			[red, green, blue] = converters['hsb-rgb'](hsb.hue, hsb.saturation, hsb.brightness)
		// 			break
		// 	}

		// 	return { red, green, blue }
		// },

		// hsb() {
		// 	let hue, saturation, brightness

		// 	switch (this.type) {
		// 		case 'hsb':
		// 			[,, hue, saturation, brightness] = this.value
		// 			break

		// 		case 'rgb':
		// 			const rgb = this.rgb;
		// 			[hue, saturation, brightness] = converters['rgb-hsb'](rgb.red, rgb.green, rgb.blue)
		// 			break
		// 	}

		// 	return { hue, saturation, brightness }
		// },	
	},

	created() {
		this.setComponents(this.value)
	},

	watch: {
		alpha(value) {
			this.updateColor()
		},
		hsb: {
			handler(value) {
				const { hue, saturation, brightness } = value
				const [red, green, blue] = converters['hsb-rgb'](hue, saturation, brightness)
				this.rgb = { red, green, blue } 
				this.updateColor()
			},
			deep: true
		},
	},

	methods: {
		setComponents(value) {
			let alpha
			let red, green, blue
			let hue, saturation, brightness

			switch (this.type) {
				case 'rgb':
					[, red, green, blue, alpha] = value
					this.rgb = { red, green, blue };
					[hue, saturation, brightness] = converters['rgb-hsb'](red, green, blue)
					this.hsb = { hue, saturation, brightness }
					this.alpha = alpha || 1
					break
			}
		},

		updateColor() {
			const { rgb, alpha } = this
			const { red, green, blue } = rgb
			const color = ['Color', red, green, blue, alpha]
			this.$emit('input', color)
		},

		unsetColor() {
			this.$emit('input', null)
		}
	},
}	
</script>