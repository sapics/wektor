<template>
	<div class="plaette-popup">
		<span
			ref="label"
			class="label"
			@mousedown="openDialog"
		>{{ label }}</span>
	</div>
</template>

<style lang="scss" scoped>
.plaette-popup {
	.label {
		text-decoration: underline;
	}
}	
</style>

<script>
import baseComponent from './baseComponent'
import wektor from '@/wektor'

export default {
	extends: baseComponent,

	computed: {
		values() {
			return this.payload.values
		},

		layout() {
			return this.payload.layout
		},
	},

	methods: {
		openDialog() {
			wektor.openDialog({
				id: this.id,
				parentId: this.dialogId,
				layout: this.layout,
				values: this.values,
				reference: this.$refs.label,
			})
		},
	},
}	
</script>