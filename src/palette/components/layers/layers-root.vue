<template>
	<div class="palette-layers-root">
		<vddl-list
			:list="list"
			effect-allowed="move"
			:allowed-types="['Layer']"
		>
			<layers-recursive v-for="(item, index) in list"
				:key="item.id"
				:dialogId="dialogId"
				:item="item"
				:index="index"
				:list="list"
				:disable="list.length === 1"
			></layers-recursive>
		</vddl-list>
	</div>
</template>

<style lang="scss">
.palette-layers-root {
	border-right: 1px solid var(--wektor-dialog-border-color);
}	
</style>

<script>
import baseComponent from '@/palette/components/baseComponent'
import layersRecursive from './layers-recursive'

export default {
	extends: baseComponent,

	components: { layersRecursive },

	computed: {
		list() {
			return this.value
		}
	},
}	
</script>