<template>
	<div
		class="tool-select-item"
		@click="$emit('click', $event)"
		@contextmenu="onContextmenu($event)"
	>
		<span class="label" ref="label" v-html="label"></span>
	</div>
</template>

<style lang="scss" scoped>
.tool-select-item {
	user-select: none;
}
</style>

<script>
import wektor from '@/wektor'

export default {
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
			if (!this.tool) return null

			const { label, shortcut } = this.tool
			const shortcutPos = label.indexOf(shortcut)

			if (label === '') console.warn(`Tool doesn't provide a label.`)

			let labelHtml = ''
			labelHtml += '<span class="bullet">●</span>'
			labelHtml += label.slice(0, shortcutPos)
			labelHtml += `<span class="shortcut">${shortcut}</span>`
			labelHtml += label.slice(shortcutPos + shortcut.length, label.length)

			return labelHtml			
		}
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