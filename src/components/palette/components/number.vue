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
			@keydown="validate($event)"
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
import baseComponent from './baseComponent'
import paper from 'paper'
import { getUnit, round, convertUnits } from '@/utils.js' 
import settings from '@/settings.js'

// class UnitValidator {
// 	constructor(options) {
// 		const default = {
// 			allowedUnits: ['px']
// 		}
// 		Object.assign(this, options)
// 	}

// 	format(value) {
// 		return value.replace(',', '.')
// 	}

// 	parse(value, oldValue) {
// 		const unitValue = parseFloat(value)
// 		const unit = getUnit(value)

// 		return {
// 			value,
// 			unitValue,
// 			unit
// 		}
// 	}
// }

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

	computed: {
		pxValue() {
			return convertUnits(this.unitValue, this.unit, 'px')
		},

		positive() {
			return this.payload.positive
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
		
		// onInput(string) {
		// 	string = string.replace(',', '.')
		// 	const unitValue = parseFloat(string)
		// 	if (unitValue <= 0) this.inputFieldValue = 0 + this.unit
		// 	this.unitValue = unitValue
		// 	const unit = getUnit(string)
		// 	if (settings.units.whitelist.includes(unit))
		// 		this.unit = unit			
		// },

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