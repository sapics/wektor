<template>
	<div class="stroke">
		<span class="label">{{label}}</span>
		<color
			class="stroke-color"
			:id="`${id}-strokeColor`"
			:dialogId="this.dialogId"
			v-model="style.strokeColor"
		></color>		
		<number
			class="stroke-width"
			:id="`${id}-strokeWidth`"
			:dialogId="this.dialogId"
			:value="style.strokeWidth"
			@input="style.strokeWidth = $event"
		></number>
	</div>
</template>

<style lang="scss" scoped>
.stroke {
	> * {
		display: table-cell;
	}

	.label::after, .stroke-color::after {
		content: ' ';
		white-space: pre;
	}
}	
</style>

<script>
import baseComponent from './baseComponent.vue'
import number from './number'
import color from './color'

export default {
	extends: baseComponent,

	components: { number, color },

	computed: {
		style() {
			return this.value
		}
	},
}	
</script>