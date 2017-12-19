<template>
	<div
		class="palette-text"
	>	
		<span class="label">{{ label }}</span>
		<input
			v-model="text"
			type="text"
		/>
	</div>
</template>

<style lang="scss" scoped>
.palette-text {
	input {
		box-sizing: border-box;
		border: none;
		outline: none;
	}
}	
</style>

<script>
import baseComponent from './baseComponent'

export default {
	extends: baseComponent,

	computed: {
		text: {
			get() {
				return this.value
			},
			set(value) {
				this.$emit('input', value)
			}
		}
	},
}
</script>