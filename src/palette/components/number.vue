<template>
	<div 
		class="number"
		@keydown.up.prevent="up($event)"
		@keydown.down.prevent="down($event)"
	>
		<span 
			class="label"
			:class="[space ? `space-${space}` :null]"
			v-if="label"
		>{{label}}</span><!--
	--><input 
			ref="input"
			v-autowidth
			v-model="inputFieldValue"
		>
	</div>
</template>

<style lang="scss" scoped>
@import "src/sass/variables";

.number {
	input {
		box-sizing: border-box;
		border: none;
		outline: none;
	}

	.label {
		cursor: default;
		padding-right: $space;
	}

	.label.space-thin {
		padding-right: $thin-space;
	}
}	
</style>

<script>
import baseComponent from './baseComponent'
import paper from 'paper'
import { getUnit, round, convertUnits, isString } from '@/utils.js' 
import settings from '@/settings'
import { UnitValidator, UnitValue } from './unitUtils'

const unitValidator = new UnitValidator(settings.units)

export default {
	extends: baseComponent,

	data() {
		return {
			unit: this.payload.unit,
			unitValue: null,
			resolution: 72,
			changed: false,
		}
	},

	mounted() {
		this.resolution = window.paper.view.resolution
		this.unitValue = this.value
	},

	watch: {
		value(value) {
			// we set this.input to true when we emit 'input' (see updateValue())
			// so this functuion will only watch if the value gets changed from outside
			if (!this.input) {
				this.unitValue = UnitValue.convertValue(value, this.valueUnit, this.unit)
			}
			this.input = false
		}
	},

	computed: { 
		space() {
			return this.payload.space
		},

		returnUnit() {
			return this.payload.return || 'px'
		},

		valueUnit() {
			return this.payload.unit || 'px'
		},

		allowedUnits() {
			let units = this.payload.units

			if (isString(units)) {
				const name = units
				units = settings.units.groups[name]
				if (!units) 
					console.warn(`No units-group found with name '${name}'`)
			}

			return units || [this.valueUnit]
		},

		inputFieldValue: {
			get() {
				return this.unit
					? (isNaN(this.unitValue) ? '' : round(this.unitValue)) + this.unit
					: this.unitValue
			},
			set(string) {
				this.updateValue(string)
			}
		},
	},

	methods: {
		updateValue(string) {
			const result = unitValidator.parse(string)
			if (result === false) return false

			this.unit = result.unit
			this.unitValue = result.unitValue
			const value = result.value

			this.input = true
			this.$emit('input', value)
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
			// this.updateInputField()
			this.updateValue(this.inputFieldValue)
		},
	},
}
</script>