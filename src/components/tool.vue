<template>
	<div class="tool"
		@click="tool.activate()"
		:class="{active, selected}"
	>
		<div class="label" v-html="labelHtml"></div>
	</div>
</template>

<style lang="scss">
.tool {
	.shortcut {
		text-decoration: underline;
	}

	&.active {
		background-color: red;
	}

	&.selected {
		background-color: yellow;
	}	
}
</style>

<script type="text/javascript">
export default {
	props: ['value'],

	computed: {
		tool() {
			return this.value
		},

		active() {
			return this.$bus.active.tool === this.tool
		},

		selected() {
			return this.$bus.selectedTool === this.tool
		},

		shortcut() {
			return this.tool.spec.shortcut
		},

		label() {
			return this.tool.spec.label || ''
		},

		labelHtml() {
			const label = this.label
			const {shortcut} = this
			const shortcutPos = label.indexOf(shortcut)

			if (label === '') console.warn(`Tool (${this.tool.constructor.name}) doesn't provide a label.`)

			let labelHtml = ''
			labelHtml += label.slice(0, shortcutPos)
			labelHtml += `<span class="shortcut">${shortcut}</span>`
			labelHtml += label.slice(shortcutPos + shortcut.length, label.length)

			return labelHtml
		}
	},
}
</script>