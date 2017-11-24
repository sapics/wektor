<template>
	<tool-select class="tool-bar" ref="select" :options="toolSelectOptions" v-model="selectedTool"></tool-select>
</template>

<script>
import toolSelect from './tool-select.vue'
import paper from 'paper'

const {Tool} = paper

export default {
	props: {
		tools: {
			type: Array,
			default: () => [],
		}
	},

	components: {toolSelect},

	computed: {
		toolSelectOptions() {
			return this.tools.map(tool => {
				return {
					value: tool,
					label: tool.spec.label
				}
			})
		},

		selectedTool: {
			get() {
				return this.$bus.active.tool
			},
			set(value) {
				this.$bus.active.tool = value
			}
		},
	},

	watch: {
		selectedTool(tool) {
			if (!(tool instanceof Tool))
				console.warn("Can't activate tool")
			else
				tool.activate()
		}
	},

	mounted() {
		const {select} = this.$refs
		this.$bus.$on('toolSearch', () => this.focus())
		this.$bus.$on('toolSelectNext', () => select.selectOption('next'))
		this.$bus.$on('toolSelectPrev', () => select.selectOption('prev'))
	},

	methods: {
		focus() {
			this.$refs.select.focus()
		},

		blur() {
			this.$refs.select.blur()
		},		
	},
}
</script>