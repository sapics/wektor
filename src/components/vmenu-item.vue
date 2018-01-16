<template>
	<div 
		v-html="labelHtml"
	></div>
</template>

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