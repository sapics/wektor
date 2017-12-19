<template>
	<div class="color">
		<span class="label">
			<span>{{labelSegments.prefix}}</span>
			<span
				:data-id="`${id}-color-label`"
				:id="`${id}-color-label`"
				class="color-label"
				ref="colorLabel"
				:class="{'no-color': !cssColor}"
				@mousedown="openColorpicker"
				:style="{color: cssColor, 'text-shadow': colorLabelShadow}"
			>color</span>
			<span>{{labelSegments.suffix}}</span>
		</span>
	</div>
</template>

<style lang="scss">
.color {
	display: inline-block;

	.label {
		display: inline-block;
	}

	.color-label {
		cursor: pointer;
		text-decoration: underline;
	}
	.color-label.no-color {
		text-decoration: line-through;
	}
}
</style>

<script>
import { mapMutations, mapGetters } from 'vuex'
import baseComponent from './baseComponent'
import { isObject, isString, round, mapValue, getContrast, alphaToWhite } from '@/utils.js'
import { jsonToColor } from './colorpicker/colorUtils'
import wektor from '@/wektor'

export default {
	extends: baseComponent,

	data() {
		return {
			colorPickerId: null,
		}
	},

	computed: {
		...mapGetters(['getDialog']),

		gradientColor() {
			return `linear-gradient(to top, black, transparent), linear-gradient(to right, white, ${this.value.toCSS()})`
		},

		labelSegments() {
			const {label} = this

			if (!label) return {}

			const colorPos = label.indexOf('color')

			if (colorPos === -1) {
				return {
					prefix: label
				}
			}

			return {
				prefix: label.slice(0, colorPos), 
				suffix: label.slice(colorPos + 'color'.length, label.length)
			}
		},

		color() {
			return jsonToColor(this.value)
		},

		cssColor() {
			if (!this.color) return

			const { red, green, blue } = alphaToWhite(this.color)
			return `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`
		},

		colorLabelShadow() {
			if (!this.color) return

			const contrast = getContrast(this.color)
			let shadow = 1 - (mapValue(contrast, { min: 0, max: 0.03 }, { min: 0, max: 1 }))
			if (shadow < 0) shadow = 0
			return `rgba(180, 180, 180, ${shadow}) 1px 1px`
		},
	},

	methods: {
		openColorpicker() {
			const id = this.id
			const layout = {
				[this.propKey]: {
					type: 'colorpicker',
					label: this.label,
				}
			}
			const values = this.$parent.values

			wektor.openDialog({
				id,
				parentId: this.dialogId,
				layout,
				values,
				reference: this.$refs.colorLabel.id,
				payload: {
					resize: true,
					css: {
						'padding': 'none', // reset the default padding
						'padding-right': '1em',
						'width': '150px',
						'height': '100px',
						'min-height': '4em',
						'min-width': '4em',
					}
				},
			})

			this.colorPickerId = id
		},
	},	
}
</script>