<template>
	<div 
		class="palette-boolean"
	>
		<span @mousedown="toggleValue" class="label">{{label}}</span>
		<span class="checkbox" @mousedown="toggleValue">{{value ? '&#10004;' : '&#10005;'}}</span>
	</div>
</template>

<style lang="scss" scoped>
.palette-boolean {
	user-select: none;
	.checkbox, .label, .space {
		cursor: pointer;
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