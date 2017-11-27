<template>
	<div class="color">
		<span class="label">
			<span>{{labelSegments.prefix}}</span>
			<span 
				class="color-label"
				ref="colorLabel"
				:class="{'no-color': !cssColor}"
				@click="onClick"
				:style="{color: cssColor, 'text-shadow': colorLabelShadow}"
			>color</span>
			<span>{{labelSegments.suffix}}</span>
		</span>
	</div>
</template>

<style lang="scss">
.color {
	.color-label {
		cursor: pointer;
	}
	.color-label.no-color {
		text-decoration: line-through;
	}
}
</style>

<script>
import { mapMutations, mapGetters } from 'vuex'
import baseComponent from './baseComponent'
import { isObject, round, mapValue } from '@/utils.js'
import paper from 'paper'

function getContrast(color) {
	const { red, green, blue } = alphaToWhite(color)

	return 1 - (0.2126 * red + 0.7152 * green + 0.0722 * blue)
}

function alphaToWhite(color) {
	return new paper.Color({
		red: 1 + (color.red - 1) * color.alpha,
		green: 1 + (color.green - 1) * color.alpha,
		blue: 1 + (color.blue - 1) * color.alpha,
	})
}

export default {
	extends: baseComponent,

	data() {
		return {
			cssColor: null,
			colorLabelShadow: null,
			color: null,
			colorPickerId: null,
		}
	},

	computed: {
		...mapGetters(['getContext']),

		gradientColor() {
			return `linear-gradient(to top, black, transparent), linear-gradient(to right, white, ${this.value.toCSS()})`
		},

		labelSegments() {
			const {label} = this
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
	},

	mounted() {
		this.color = this.value
		this.color && (this.cssColor = this.color.toCSS())
	},

	watch: {
		color: {
			handler(color) {
				const contrast = getContrast(color)
				let shadow = 1 - (mapValue(contrast, { min: 0, max: 0.1 }, { min: 0, max: 1 }))
				if (shadow < 0) shadow = 0
				this.colorLabelShadow = `rgba(180, 180, 180, ${shadow}) 1px 1px`
				this.cssColor = alphaToWhite(color).toCSS()
			},
			deep: true,
		},
	},

	methods: {
		...mapMutations(['openContext']),

		onClick() {
			if (!this.color) {
				this.color = new paper.Color({red: 1})
			}
			this.$emit('input', this.color)

			const id = this.contextId + '>' + this.id
			const layout = {
				[this.id]: {
					type: 'colorpicker',
					label: this.label,
				}
			}
			const values = {
				[this.id]: this.color
			}

			this.openContext({
				id, 
				spec: {
					layout,
					values,
					payload: {
						referenceEl: this.$refs.colorLabel,
						width: '200px',
						height: '200px',
						parentId: this.contextId,
						padding: 'none'
					}
				}				
			})

			this.colorPickerId = id
		},
	},	
}
</script>