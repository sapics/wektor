<template>
	<div class="color">
		<span class="label">
			<span>{{labelSegments.prefix}}</span>
			<span
				:data-id="`${id}-color-label`" 
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
import { isObject, isString, round, mapValue, getContrast, alphaToWhite } from '@/utils.js'

export default {
	extends: baseComponent,

	data() {
		return {
			cssColor: null,
			colorLabelShadow: null,
			// color: null,
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
	},

	// watch: {
	// 	// color: {
	// 	// 	handler(color) {
	// 	// 		const contrast = getContrast(color)
	// 	// 		let shadow = 1 - (mapValue(contrast, { min: 0, max: 0.1 }, { min: 0, max: 1 }))
	// 	// 		if (shadow < 0) shadow = 0
	// 	// 		this.colorLabelShadow = `rgba(180, 180, 180, ${shadow}) 1px 1px`
	// 	// 		this.cssColor = alphaToWhite(color).toCSS()
	// 	// 	},
	// 	// },
	// },

	methods: {
		...mapMutations(['openDialog']),

		openColorpicker() {
			if (!this.value) {
				const color = ['Color', 1, 0, 0, 1]
				this.$emit('input', color)
			}

			const id = this.id
			const layout = {
				[this.id]: {
					type: 'colorpicker',
					label: this.label,
				}
			}
			const values = this.$parent.values
			
			this.openDialog({
				id, 
				layout,
				values,
				payload: {
					referenceId: `${this.id}-color-label`,
					parentId: this.dialogId,
					padding: 'none'
				}			
			})

			this.colorPickerId = id
		},
	},	
}
</script>