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
	.label {
		display: inline-block;
		padding-right: 0;
	}

	.color-label {
		cursor: pointer;
		color: black;
		text-decoration: underline;
	}
	.color-label.no-color {
		text-decoration: line-through;
	}
}
</style>

<script>
import baseComponent from './baseComponent'
import { isObject, isString, round, mapValue, getContrast, alphaToWhite, getDeltaE } from '@/utils.js'
import { valueToColor } from './colorpicker/utils'
import wektor from '@/wektor'
import paper from 'paper'

export default {
	extends: baseComponent,

	data() {
		return {
			colorPickerId: null,
			isMounted: false,
		}
	},

	computed: {
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
			return valueToColor(this.value)
		},

		cssColor() {
			if (!this.color) return

			const { red, green, blue } = alphaToWhite(this.color)
			return `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`
		},

		colorLabelShadow() {
			if (!this.color || !this.isMounted) return

			const dialogEl = this.$el.closest('.dialog')
			if (!dialogEl) return

			const dialogColorCss = getComputedStyle(dialogEl).backgroundColor
			const dialogPaperColor = new paper.Color(dialogColorCss)
			
			const deltaE = getDeltaE(dialogPaperColor, alphaToWhite(this.color))

			if (deltaE > 0.2) return

			const blackShadowContrast = getContrast(new paper.Color('black'), dialogPaperColor)

			const shadowColor = blackShadowContrast > 0.03 ? 'black' : 'rgba(255, 255, 255, 0.5)'

			return `${shadowColor} 1px 1px`
		},
	},

	mounted() {
		this.isMounted = true
	},

	methods: {
		openColorpicker() {
			const id = this.id
			const returnType = this.payload.return
			const layout = {
				[this.spec.key]: {
					type: 'colorpicker',
					label: this.label,
					return: returnType,
				}
			}

			wektor.openDialog({
				id,
				parentId: this.dialogId,
				reference: this.$refs.colorLabel.id,
				layout,
				resize: true,
				padding: false,
				stretchContent: true,
				css: {
					width: '150px',
					height: '100px'
				},				
			})

			this.colorPickerId = id
		},
	},	
}
</script>