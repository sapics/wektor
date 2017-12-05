<template>
	<tool-select class="tool-bar" ref="select" :options="toolSelectOptions" v-model="activeToolId"></tool-select>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import toolSelect from './tool-select.vue'
import paper from 'paper'
import wektor from '@/wektor'

const { Tool } = paper

export default {
	props: {
		tools: {
			type: Object,
			default: () => {},
		}
	},

	components: { toolSelect },

	computed: {
		activeToolId: {
			get() {
				return this.$store.state.active.tool
			},
			set(id) {
				const tool = wektor.tools[id]
				tool && tool.activate()
				this.$store.commit('setActiveTool', id)
			},
		},

		toolSelectOptions() {
			const options = []

			for (const [id, tool] of Object.entries(this.tools)) {
				options.push({
					value: id,
					label: tool.label,
					shortcut: tool.shortcut
				})
			}

			return options
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