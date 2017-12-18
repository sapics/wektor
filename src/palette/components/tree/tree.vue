<template>
	<div class="tree">
		<vddl-list
			:list="list"
			effect-allowed="move"
		>
			<nested-tree v-for="(item, index) in list"
				:key="item.id"
				:item="item"
				:index="index"
				:list="list"
				:disable="list.length === 1"
			></nested-tree>
		</vddl-list>
	</div>
</template>

<script>
import nestedTree from './nested-tree'

export default {
	components: { nestedTree },

	props: ['value'],

	computed: {
		list() {
			return this.value
		}
	},
}	
</script>