<template>
	<div 
		class="number"
		@keydown.up="up($event)"
		@keydown.down="down($event)"
	>
		<span class="label">{{label}}</span>
		<input 
			ref="input"
			:value="inputFieldValue"
			@input="onInput($event.target.value)"
		>
	</div>
</template>

<style lang="scss" scoped>
.number {
	display: table;

	input {
		display: table-cell;
		width: 100%;
		box-sizing: border-box;
		border: none;
		outline: none;
	}

	.label {
		display: table-cell;
		padding-right: 0.5em;
	}
}	
</style>

<script>
import paper from 'paper'
import { getUnit, round, convertUnits } from '@/utils.js' 
import settings from '@/settings.js'

export default {
	props: ['value', 'label'],

	data() {
		return {
			unit: 'px',
			unitValue: null,
			inputFieldValue: null,
			resolution: 72,
		}
	},

	computed: {
		pxValue() {
			return convertUnits(this.unitValue, this.unit, 'px')
		}
	},

	watch: {
		pxValue(value) {
			this.$emit('input', value)
		}
	},

	mounted() {
		this.resolution = window.paper.view.resolution
		this.unitValue = this.value
		this.updateInput()
	},

	activated() {
		this.updateInput()
	},

	methods: {
		onInput(string) {
			string = string.replace(',', '.')
			this.unitValue = parseFloat(string)
			const unit = getUnit(string)
			if (settings.units.whitelist.includes(unit))
				this.unit = unit			
		},

		updateInput() {
			this.inputFieldValue = (isNaN(this.unitValue) ? '' : this.unitValue) + this.unit
			this.$refs.input.value = this.inputFieldValue
		},

		up(event) {
			const change = (event && event[settings.shortcutModifiers.detailedChange + 'Key']) ? 0.1 : 1
			this.changeValueBy(change)
		},

		down(event) {
			const change = (event && event[settings.shortcutModifiers.detailedChange + 'Key']) ? 0.1 : 1
			this.changeValueBy(-change)
		},

		changeValueBy(change) {
			this.unitValue = round(this.unitValue + change, settings.units.decimals)
			this.updateInput()
		},
	},
}
</script>