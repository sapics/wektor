<template>
	<div
		class="palette-select"
		tabindex="1"
		v-outside:mousedown="blur()"
		@keydown.down.prevent="focusOption('next')" 
		@keydown.up.prevent="focusOption('prev')"
		@keydown.enter.prevent="onEnter"
	>
		<div
			v-for="option in options"
			:key="option.key || option.label"
			@click="selectOption(option)"
			:class="{'selected': option === selected, 'focused': option === focused}"
		>{{option.label}}</div>	
	</div>
</template>

<style lang="scss" scoped>
.palette-select {
	user-select: none;
}	
</style>

<script>
import { isInt, isObject, isString } from '@/utils'

export default {
	props: {
		value: null,
		payload: {
			type: Object,
			default: () => Object()
		}
	},

	data() {
		return {
			focused: null,
		}
	},

	computed: {
		options() {
			return this.payload.options || []
		},

		selected() {
			return this.options.find(option => option.value === this.value)
		},
	},

	methods: {
		focus() {
			this.$el && this.$el.focus()
		},

		blur() {
			this.$el && this.$el.blur()
		},

		onEnter() {
			this.selectOption(this.focused)
		},

		selectOption(selector) {
			const selected = this.getOption(selector, this.selected)
			if (selected) {
				this.focused = selected
				this.$emit('input', selected.value)
			}
		},

		focusOption(selector) {
			this.focused = this.getOption(selector, this.focused)
			if (this.focused) this.$emit('focus', this.focused)
		},

		getOption(selector, current = null) {
			const options = this.options
			let index

			if (isObject(selector))
				return selector
			else if (isInt(selector)) {
				index = selector
			} else if (isString(selector)) {
				index = options.indexOf(current)
				if (selector === 'next') index++
				if (selector === 'prev') index--
			}

			if (index < 0) index = options.length - 1
			if (index > options.length - 1) index = 0

			return options[index]			
		},
	},
}	
</script>