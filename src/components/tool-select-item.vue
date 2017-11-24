<template>
	<div
		v-html="label"
		@click="$emit('click', $event)"
		@contextmenu.prevent="onContextmenu($event)"
	></div>
</template>

<script>
export default {
	props: {
		option: {
			type: Object,
			default: () => { return {} }
		}
	},

	computed: {
		tool() {
			return this.option.value
		},

		label() {
			if (!this.tool) return null

			const { label, shortcut } = this.tool.spec
			const shortcutPos = label.indexOf(shortcut)

			if (label === '') console.warn(`Tool (${this.tool.constructor.name}) doesn't provide a label.`)

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
			this.$emit('contextmenu', event)

			if (!this.tool) return

			this.$bus.$emit('open-context', this.tool.id, {
				layout: this.tool.spec.context.layout,
				values: this.tool.spec
			})
		},
	},	
}	
</script>