<template>
	<span 
		class="palette-button input"
		:class="{ active: (active || !mouseupDelayFinished) }"
		@click="handleClick"
		@mousedown="handleMouseDown"
		@mouseup="handleMouseUp"
	>{{label}}</span>
</template>

<style lang="scss" scoped>
.palette-button	{
	user-select: none;
	border: 1px solid var(--wektor-input-color);
	border-radius: 0.2em;
	padding: 0.01em 0.27em;
	box-sizing: border-box;
	cursor: pointer;
	box-shadow: 1px 1px;

	&.active {
		color: var(--wektor-dialog-background);
		background: var(--wektor-input-color);
	}
}
</style>

<script>
import baseComponent from './baseComponent'
import { isFunction } from '@/utils'

export default {
	extends: baseComponent,

	data() {
		return {
			active: false,
			mouseupDelay: 30,
			mouseupDelayFinished: true,
		}
	},

	methods: {
		handleMouseDown(event) {
			this.active = true
			this.mouseupDelayFinished = false
			setTimeout(() => {
				this.mouseupDelayFinished = true
			}, this.mouseupDelay)
		},

		handleMouseUp(event) {
			this.active = false
		},		

		handleClick(event) {
			const handler = this.payload.click
			isFunction(handler) && handler(event)
		},
	},
}
</script>