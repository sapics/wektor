<template>
	<div class="palette-layers-root">
		<vddl-list
			:list="list"
			effect-allowed="move"
			:allowed-types="['Layer']"
		>
			<layers-recursive v-for="(item, index) in list"
				:key="item.id"
				:item="item"
				:index="index"
				:list="list"
				:disable="list.length === 1"
			></layers-recursive>
		</vddl-list>
	</div>
</template>

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