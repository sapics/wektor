<template>
	<tool-select class="tool-bar" ref="select" :options="toolSelectOptions" v-model="activeToolId"></tool-select>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import toolSelect from './tool-select.vue'
import paper from 'paper'

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
				const tool = this.$store.state.active.tool
				return tool && tool.id
			},
			set(id) {
				this.$store.commit('activateTool', this.$store.state.tools[id])
			},
		},

		toolSelectOptions() {
			const options = []

			console.log('too', this.tools)
			for (const [id, tool] of Object.entries(this.tools)) {
				options.push({ ...tool, value: id })
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