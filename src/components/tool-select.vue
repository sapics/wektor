<template>
	<div
		v-show="options.length"
		class="tool-select"
		@keydown.down.prevent="focusOption('next')" 
		@keydown.up.prevent="focusOption('prev')"
		@keydown.enter.prevent="onEnter()"
		v-outside:mousedown="blur"
	>
		<tool-select-option
			v-for="option in options"
			:key="option.key || option.label"
			:option="option"
			@click.stop="selectOption(option)"
			:class="{
				'selected': option === selected, 
				'focused': option === focused, 
				'highlight': (option === focused && option !== selected)
			}"
		></tool-select-option>	
	</div>
</template>

<script>
import vselect from './vselect'
import toolSelectOption from './tool-select-option'
import searchable from '@/mixins/searchable'
export default {
	extends: vselect,

	mixins: [searchable],

	components: {toolSelectOption},

	props: {
		searchQuery: String,
	},

	data() {
		return {
			searchPropKey: 'label',
		}
	},

	computed: {
		items() {
			return this.payload.options
		},

		options() {
			return this.filteredItems
		},
	},

	methods: {
		focusItem(selector) {
			this.focusOption(selector)
		},

		selectItem(selector) {
			this.selectOption(selector)
		}
	},
}	
</script>