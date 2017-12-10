<template>
	<div class="stroke">
		<span class="label">
			<span>{{labelSegments.prefix}}</span>
			<span
				:data-id="`${id}-stroke-label`" 
				class="stroke-label"
				ref="strokeLabel"
				@mousedown="openStrokeDialog"
			>stroke</span>
			<span>{{labelSegments.suffix}}</span>
		</span>
	</div>
</template>

<style lang="scss" scoped>
.stroke {
	.stroke-label {
		text-decoration: underline;
	}
}	
</style>

<script>
import baseComponent from './baseComponent.vue'
import number from './number'
import color from './color'

export default {
	extends: baseComponent,

	computed: {
		labelSegments() {
			const {label} = this

			if (!label) return {}

			const strokePos = label.indexOf('stroke')

			if (strokePos === -1) {
				return {
					prefix: label
				}
			}

			return {
				prefix: label.slice(0, strokePos), 
				suffix: label.slice(strokePos + 'stroke'.length, label.length)
			}
		},
	}
}	
</script>