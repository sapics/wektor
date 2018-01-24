<template>
	<div class="menu-item">
		<span
			@click="$emit('click', $event)"
			v-html="labelHtml" 
			class="label"
		></span>
	</div>
</template>

<style lang="scss" scoped>
.menu-item {
	.label {
		cursor: pointer;
	}
}	
</style>

<script>
import labelShortcut from '@/mixins/labelShortcut'

export default {
	mixins: [labelShortcut],

	props: {
		label: String,
		shortcut: Object,
	},
}	
</script>