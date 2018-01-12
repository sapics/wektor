<template>
	<div class="plaette-popup">
		<span
			ref="label"
			class="label"
			:id="`${id}-popup-label`"
			@mousedown="openDialog"
		>{{ label }}</span>
	</div>
</template>

<style lang="scss" scoped>
.plaette-popup {
	.label {
		text-decoration: underline;
		padding-right: 0; // for this component is only a clickable label we dont need the right margin
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
			wektor.openChildDialog({
				id: this.id,
				parentId: this.dialogId,
				reference: this.$refs.label.id,
				layout: this.layout,
			})
		},
	},
}	
</script>