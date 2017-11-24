<template>
	<div class="checkbox">
		<span class="label">{{label}}</span>
		<span 
			class="box"
			:class="{checked}"
			@mousedown.prevent="toggleValue()"
		></span>
	</div>
</template>

<style lang="scss">
.checkbox {
	.box {
		display: inline-block;
		width: calc(1em * 0.5);
		height: calc(1em * 0.5);
		border-radius: 50%;
		vertical-align: middle;
		cursor: pointer;
		border: 1px solid black;
	}

	.box.checked {
		background: black;
	}
}
</style>

<script>
export default {
	props: ['value', 'label'],

	computed: {
		checked() {
			return this.value === true
		}
	},

	methods: {
		toggleValue() {
			this.$emit('input', !this.value)
		}
	}
}
</script>