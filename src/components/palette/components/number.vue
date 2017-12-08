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
			@input="updateValue($event.target.value)"
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
import baseComponent from './baseComponent'
import paper from 'paper'
import { getUnit, round, convertUnits } from '@/utils.js' 
import settings from '@/settings.js'
import { UnitValidator } from './unitUtils'

const unitValidator = new UnitValidator(settings.units)

export default {
	extends: baseComponent,

	data() {
		return {
			unit: 'px',
			unitValue: null,
			inputFieldValue: null,
			resolution: 72,
		}
	},

	mounted() {
		this.resolution = window.paper.view.resolution
		this.unitValue = this.value
		this.updateInputField()
		// this.unitValue = this.value
		// this.updateInput()
	},

	activated() {
		// this.updateInput()
	},

	methods: {
		updateValue(string) {
			const result = unitValidator.parse(string)

			if (result === false) return false

			this.unit = result.unit
			this.unitValue = result.unitValue
			this.$emit('input', result.value)
		},

		updateInputField() {
			this.inputFieldValue = (isNaN(this.unitValue) ? '' : round(this.unitValue)) + this.unit
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
			this.unitValue += change
			this.updateInputField()
			this.updateValue(this.inputFieldValue)
		},
	},
}
</script>