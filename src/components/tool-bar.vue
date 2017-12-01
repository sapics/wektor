<template>
	<tool-select class="tool-bar" ref="select" :options="toolSelectOptions" v-model="activeTool"></tool-select>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import toolSelect from './tool-select.vue'
import paper from 'paper'

const { Tool } = paper

export default {
	props: {
		tools: {
			type: Array,
			default: () => [],
		}
	},

	components: { toolSelect },

	computed: {
		activeTool: {
			get() {
				return this.$store.state.active.tool
			},
			set(tool) {
				if (tool instanceof Tool) tool.activate()
				this.$store.commit('activateTool', tool)
			},
		},

		toolSelectOptions() {
			return this.tools.map(tool => {
				return {
					value: tool,
					label: tool.label
				}
			})
		},
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