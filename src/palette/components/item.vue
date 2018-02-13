<template>
	<div class="palette-item">
		<span class="label">{{label}}&nbsp;</span><!--
	--><vselect
			v-model="itemOption"
			:payload="{ options }"
		></vselect>
	</div>
</template>

<style lang="scss">
.palette-item {
	display: flex;
}	
</style>

<script>
import baseComponent from './baseComponent'
import vselect from './vselect'
import wektor from '@/wektor'

export default {
	extends: baseComponent,

	components: { vselect },

	data() {
		return {
			options: [],
		}
	},

	computed: {
		itemOption: {
			get() {
				return (this.value && this.value.id) || 'select'
			},
			set(value) {
				this.$emit('input', { id: value, _wektorPastePaperItem: true })
			}
		}
	},

	created() {
		this.updateOptions()
	},

	methods: {
		updateOptions() {
			const items = wektor.project.getItems(this.payload.selector)
			const options = items.map(item => {
				return {
					label: item.name || item.constructor.name,
					value: item.id,
				}
			})

			this.options = ['select', ...options]
		}
	},
}	
</script>