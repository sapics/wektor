<template>
	<div
		class="tool-select-option"
		@click="$emit('click', $event)"
		@contextmenu="onContextmenu($event)"
	>
		<span class="label" ref="label" v-html="labelHtml"></span>
	</div>
</template>

<style lang="scss" scoped>
@import 'src/sass/variables';

.tool-select-option {
	user-select: none;
	position: relative;
	cursor: pointer;

	&.selected:before {
		content: '';
		@include bullet();
		background-color: var(--wektor-color);
		top: 6px;
		left: -16px;
		position: absolute;
	}
}
</style>

<script>
import wektor from '@/wektor'
import labelShortcut from '@/mixins/labelShortcut'

export default {
	mixins: [labelShortcut],

	props: {
		option: {
			type: Object,
			default: () => { return {} }
		}
	},

	computed: {
		tool() {
			return this.option
		},

		label() {
			return this.tool.label
		},

		shortcut() {
			return { key: this.tool.shortcut }
		},
	},

	methods: {
		onContextmenu(event) {
			const toolSpec = this.tool
			const toolId = toolSpec.value // value is the same as id
			const tool = wektor.tools[toolId]
			
			tool && tool.emit && tool.emit('contextmenu', event)
		},
	},	
}	
</script>