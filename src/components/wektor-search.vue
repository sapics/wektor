<template>
	<div 
		class="wektor-search"
		:class="{ searching }"
	>
		<input
			v-visible="focused"
			ref="input" 
			@keydown.down.prevent="focusNextSearchResult" 
			@keydown.up.prevent="focusPrevSearchResult"
			@keydown.enter.prevent="onEnter"
			v-model="query"
			v-outside:mousedown="blur"
		>
		<slot></slot>
	</div>
</template>

<style lang="scss">
	.wektor-search {
		input {
			outline: none;
			border: none;
			border-bottom: 1px solid var(--wektor-color);
		}

		&.searching .focused {
			background-color: var(--wektor-highlight-background);
			color: var(--wektor-highlight-color);
		}
	}
</style>

<script>
import { isFunction } from '@/utils'

class SearchResult {
	constructor(components) {
		this.entries = this.getAllEntries(components)
		this.components = components
		this.index = 0
	}

	getAllEntries(components) {
		const entries = []

		for (const component of components) {
			if (!component.filteredItems) continue

			for (const [index, item] of Object.entries(component.filteredItems)) {
				entries.push({
					localIndex: parseInt(index),
					component,
				})
			}
		}

		return entries
	}

	unfocusAll() {
		for (const component of this.components) {
			isFunction(component.focusItem) && component.focusItem(false)
		}
	}

	selectFocusedEntry() {
		const entry = this.entries[this.index]
		const component = entry.component
		component && isFunction(component.selectItem) && component.selectItem(entry.localIndex)
	}

	focusEntry(index) {
		const entry = this.entries[index]
		if (!entry) return

		this.unfocusAll()

		const component = entry.component
		if (!component) return

		const focusFn = component.focusItem || component.focusOption
		isFunction(focusFn) && focusFn(entry.localIndex)
	}

	focusNextEntry() {
		this.index += 1
		if (this.index > this.entries.length - 1) this.index = 0
		this.focusEntry(this.index)
	}

	focusPrevEntry() {
		this.index -= 1
		if (this.index < 0) this.index = this.entries.length - 1
		this.focusEntry(this.index)
	}
}

export default {
	props: {
		value: String,
	},

	computed: {
		query: {
			get() {
				return this.value
			},
			set(value) {
				this.$emit('input', value)

				if (value === '') {
					this.searching = false
					return
				}

				this.$nextTick(() => {
					this.searching = true
					this.searchResult = new SearchResult(this.$children)
					this.searchResult.focusEntry(0)
				})
			}
		}
	},

	data() {
		return {
			focused: false,
			searching: false,
		}
	},

	methods: {
		focus() {
			this.focused = true
			this.$nextTick(() => {
				const input = this.$refs.input
				input.focus()
			})
		},

		blur() {
			const input = this.$refs.input
			input.blur()
			this.focused = false

			const searchResult = this.searchResult
			searchResult && searchResult.unfocusAll()
			this.query = ''
		},

		focusPrevSearchResult() {
			this.searchResult && this.searchResult.focusPrevEntry()
		},

		focusNextSearchResult() {
			this.searchResult && this.searchResult.focusNextEntry()
		},

		onEnter() {
			this.searchResult && this.searchResult.selectFocusedEntry()
			this.$nextTick(() => this.blur())
		}	
	}
}	
</script>