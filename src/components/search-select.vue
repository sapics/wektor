<template>
	<div class="searchable-select"
		@keydown.down.prevent="focusOption('next')" 
		@keydown.up.prevent="focusOption('prev')"
		@keydown.enter.prevent="onEnter()"
	>
		<input ref="search" v-model="searchQuery">
		<div ref="select">
			<div
				v-for="option in filteredOptions"
				:key="option.key || option.label"
				@click="selectOption(option)"
				:class="{'selected': option === selected, 'focused': option === focused}"
			>{{label}}</div>
		</div>	
	</div>
</template>

<script>
import { isInt, isString, isObject, isHtml } from '../utils.js'

export default {
	props: ['value', 'options'],
	
	data() {
		return {
			searchQuery: '',
			selected: null,
			focused: null,
		}
	},

	computed: {
		filteredOptions() {
			if (this.searchQuery === '') {
				this.focused = null
				return this.options
			}

			const searchQuery = this.searchQuery.toLowerCase()
			const filteredOptions = this.options.filter(option => {
				const label = (option.key || option.label).toLowerCase()
				return label.indexOf(searchQuery) > -1
			})
			this.focused = filteredOptions[0]

			return filteredOptions				
		},
	},

	watch: {
		value(value) {
			if (value) this.selected = this.filteredOptions.find(option => option.value === value)
		},
	},

	methods: {
		focus() {
			this.$refs.search.focus()
		},

		blur() {
			this.$refs.search.blur()
		},

		onEnter() {
			this.selectOption(this.focused)
			this.searchQuery = ''
			this.focused = null
		},

		selectOption(selector) {
			this.selected = this.getOption(selector, this.selected)
			if (this.selected) {
				this.blur()
				this.$emit('input', this.selected.value)
			}
		},

		focusOption(selector) {
			this.focused = this.getOption(selector, this.focused)
			if (this.focused) this.$emit('focus', this.focused)
		},

		getOption(selector, current = null) {
			const filteredOptions = this.filteredOptions
			let index

			if (isObject(selector))
				return selector
			else if (isInt(selector)) {
				index = selector
			} else if (isString(selector)) {
				index = filteredOptions.indexOf(current)
				if (selector === 'next') index++
				if (selector === 'prev') index--
			}

			if (index < 0) index = filteredOptions.length - 1
			if (index > filteredOptions.length - 1) index = 0

			return filteredOptions[index]			
		},

		isHtml,
	},
}	
</script>