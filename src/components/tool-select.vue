<template>
	<div class="tool-select"
		@keydown.down.prevent="focusOption('next')" 
		@keydown.up.prevent="focusOption('prev')"
		@keydown.enter.prevent="onEnter()"
	>
		<input ref="search" v-model="searchQuery">
		<div ref="select">
			<tool-select-item
				v-for="option in filteredOptions"
				class="option"
				:key="option.key"
				:class="{'selected': option === selected, 'focused': option === focused}"
				@click="selectOption(option)"
				:option="option"
			></tool-select-item>
		</div>	
	</div>
</template>

<style lang="scss">
.tool-select {
	.option {
		cursor: pointer;

		.bullet {
			visibility: hidden;
			margin-right: 0.25em;
		}

		.shortcut {
			text-decoration: underline;
		}
	}

	.option.selected .bullet {
		visibility: visible;
	}

	.option.focused {
		font-weight: 500;

		.bullet {
			font-style: normal;
		}
	}
}
</style>

<script>
import searchSelect from './search-select.vue'
import toolSelectItem from './tool-select-item.vue'

export default {
	extends: searchSelect,

	components: {toolSelectItem},
}	
</script>