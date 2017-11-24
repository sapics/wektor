<template>
	<div class="color">
		<span class="label">
			<span>{{labelSegments.prefix}}</span>
			<span 
				class="color-label"
				:class="{'no-color': !cssColor}"
				@click="onClick"
				:style="{color: cssColor}"
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
import baseComponent from './baseComponent'
import {isObject, round} from '@/utils.js'
import paper from 'paper'

export default {
	extends: baseComponent,

	data() {
		return {
			cssColor: null,
			color: null,
		}
	},

	computed: {
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
		}
	},

	mounted() {
		this.color = this.value
		// this.setColor()
		this.setCssColor()
	},

	methods: {
		setCssColor() {
			if (!this.color)
				this.cssColor = null
			else
				this.cssColor = this.color.toCSS()
		},

		onClick() {
			if (!this.color) {
				this.color = new paper.Color({red: 1})
			}
			this.setCssColor()
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

			this.$bus.$emit('open-context', id, {
				layout,
				values,
				payload: {
					referenceEl: this.$el,
					width: '200px',
					height: '200px',
					parentId: this.contextId,
					padding: 'none'
				}
			})

			this.$bus.$on(`context-${id}-change`, this.setCssColor)
		},
	},	
}
</script>