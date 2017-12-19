<template>
	<div 
		class="palette-select"
		:class="{dropDown, open}"
		v-outside:mousedown="close"
	>
		<span class="label">{{ label }}&nbsp;</span>
		<div class="palette-select-options-wrap" ref="wrap">
			<div
				class="palette-select-active-option"
				@click="open = !open"
			>{{ selectedOption.label }}</div>
			<div 
				class="palette-select-options" 
				ref="options"
				v-visible="!dropDown || open"
			>
				<div v-for="(option, index) of options" 
					class="palette-select-option"
					@click="selectOption(option)"
				>{{ option.label }}</div>
			</div>
		</div>	
	</div>
</template>

<style lang="scss" scoped>
@import "src/sass/variables";

.palette-select {
	display: table;

	& > * {
		display: table-cell;
	}

	&.open {
		.palette-select-active-option {
			text-decoration: none;
		}
	}

	.palette-select-active-option {
		user-select: none;
		text-decoration: underline;
		display: inline-block;
		cursor: pointer;
		white-space: nowrap;
	}

	.palette-select-option {
		cursor: pointer;
		white-space: nowrap;
		padding: 0 $space;
		&:hover {
			background: yellow;
		}
	}

	.palette-select-options-wrap {
		position: relative;
	}

	.palette-select-options {
		position: absolute;
		z-index: 1;
		background: white;
		border: 1px solid black;
		margin-left: -$space;	
		max-height: 200px;
		overflow-y: scroll;
	}
}
</style>

<script>
import baseComponent from './baseComponent'
import { isArray, isObject } from '@/utils'

export default {
	extends: baseComponent,

	data() {
		return {
			open: false,
			selectedLabel: null,
		}
	},

	computed: {
		selectedOption() {
			return this.options.filter(option => option.value === this.value)[0] || {}
		},

		options() {
			const options = this.payload.options

			if (isArray(options)) {
				return options.map(option => {
					return isObject(option) 
						? option
						: { label: option, value: option }
				})
			}

			if (isObject(options)) {
				const converted = []
				for (const [key, option] of Object.entries(options)) {
					converted.push(
						isObject(option) 
							? option
							: { label: key, value: option }
					)
				}
				return converted
			}

			return []
		},

		dropDown() {
			return this.payload.dropDown || true
		},
	},

	mounted() {
		// const { wrap, options } = this.$refs
		// wrap.style.width = options.getBoundingClientRect().width + 1 + 'px'
	},

	methods: {
		selectOption(option) {
			this.$emit('input', option.value)
			this.open = false
		},

		close() {
			this.open = false
		}
	},
}	
</script>