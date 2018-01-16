<template>
	<div 
		class="palette-boolean"
	>
		<span @mousedown="toggleValue" class="label">{{label}}</span><!--
	--><span class="checkbox input" @mousedown="toggleValue">{{value ? '&#10004;' : '&#10008;'}}</span>
	</div>
</template>

<style lang="scss" scoped>
.palette-boolean {
	user-select: none;
	.checkbox, .label, .space {
		cursor: pointer;
	}

	.checkbox {
		display: inline-block;
		line-width: 0;
		width: 0.6em;		
	}

	.label {
		padding-right: 0.27em;
	}
}	
</style>

<script>
import baseComponent from './baseComponent'

export default {
	extends: baseComponent,

	methods: {
		toggleValue() {
			const value = !this.value
			this.$emit('input', value)
		}
	}
}	
</script>