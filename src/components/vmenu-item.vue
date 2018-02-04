<template>
	<div class="menu-item">
		<span
			@click="$emit('click', $event)"
			@contextmenu="$emit('contextmenu', $event)"
			v-html="labelHtml" 
			:id="`menu-item-${label}-label`"
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