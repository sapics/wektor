<template>
	<tool-select
		ref="select"
		:value="activeToolId"
		:payload="{ options: toolSelectOptions }"
		:searchQuery="searchQuery"
		@input="activateTool($event)"
	></tool-select>
</template>

<script>
import wektor from '@/wektor'
import toolSelect from './tool-select'

export default {
	components: { toolSelect },

	data() {
		return {
			activeToolId: (wektor.active.tool && wektor.active.tool._wektorToolId),
		}
	},

	props: {
		tools: {
			type: Object,
			default: () => Object()
		},
		searchQuery: String,
	},

	computed: {
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

		filteredItems() {
			return this.$refs.select.filteredItems
		}
	},

	created() {
		wektor.on('activateTool', tool => { 
			this.activeToolId = tool._wektorToolId 
		})
	},

	methods: {
		activateTool(id) {
			const tool = wektor.tools[id]
			tool && tool.activate()		
		},

		focus() {
			this.$refs.select.focus()
		},

		blur() {
			this.$refs.select.blur()
		},

		focusItem(selector) {
			this.$refs.select.focusItem(selector)
		},

		selectItem(selector) {
			this.$refs.select.selectItem(selector)
		},
	},			
}	
</script>