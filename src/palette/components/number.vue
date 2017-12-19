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
			:value="inputFieldValue"
			@input="updateValue($event.target.value)"
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
import { getUnit, round, convertUnits } from '@/utils.js' 
import settings from '@/settings.js'
import { UnitValidator } from './unitUtils'

const unitValidator = new UnitValidator(settings.units)

export default {
	extends: baseComponent,

	data() {
		return {
			unit: this.payload.unit,
			unitValue: null,
			inputFieldValue: null,
			resolution: 72,
		}
	},

	mounted() {
		this.resolution = window.paper.view.resolution
		this.unitValue = this.value
		this.updateInputField()
	},

	computed: {
		space() {
			return this.payload.space
		},
	},

	methods: {
		updateValue(string) {
			let value

			if (!this.unit) {
				value = parseFloat(string)
			} else {
				const result = unitValidator.parse(string)

				if (result === false) return false

				this.unit = result.unit
				value = this.unitValue = result.unitValue
			}

			this.$emit('input', value)
		},

		updateInputField() {
			if (!this.unit)
				this.inputFieldValue = this.unitValue
			else
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