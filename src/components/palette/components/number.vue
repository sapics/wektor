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

class UnitValidator {
	constructor(options) {
		const defaultOptions = {
			defaultUnit: 'px',
			allowedUnits: ['px', 'cm'],
			decimals: 2,
		}
		options = Object.assign(this, defaultOptions)
		Object.assign(this, options)
	}

	format(string) {
		// string.replace(',', '.')
		// const { unitValue, unit } = this.extract(string)
		// return
	}

	extract(string) {
		const unitValue = parseFloat(string)
		const unit = getUnit(string) || this.defaultUnit

		return {
			unitValue,
			unit,
		}
	}

	parse(string) {
		string = string.replace(',', '.')
		const { unit, unitValue } = this.extract(string)

		if (!this.allowedUnits.includes(unit)) return false

		const value = convertUnits(unitValue, unit, this.defaultUnit)

		return {
			value,
			unitValue,
			unit
		}
	}
}

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

	// watch: {
	// 	pxValue(value) {
	// 		this.$emit('input', value)
	// 	}
	// },

	mounted() {
		this.resolution = window.paper.view.resolution
		this.unitValue = this.value
		this.updateInput()
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

		updateInput() {
			this.inputFieldValue = (isNaN(this.unitValue) ? '' : this.unitValue) + this.unit
		},
		
		// onInput(string) {
		// 	string = string.replace(',', '.')
		// 	const unitValue = parseFloat(string)
		// 	if (unitValue <= 0) this.inputFieldValue = 0 + this.unit
		// 	this.unitValue = unitValue
		// 	const unit = getUnit(string)
		// 	if (settings.units.whitelist.includes(unit))
		// 		this.unit = unit			
		// },

		// updateInput() {
		// 	this.inputFieldValue = (isNaN(this.unitValue) ? '' : this.unitValue) + this.unit
		// 	this.$refs.input.value = this.inputFieldValue
		// },

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