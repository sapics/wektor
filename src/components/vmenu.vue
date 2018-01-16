<template>
	<div>
		<vmenu-item v-for="item of filteredItems"
			:key="item.label"
			:label="item.label"
			:shortcut="item.shortcut"
			:class="{ 'highlight': item === focused }"
		></vmenu-item>
	</div>
</template>

<script>
import vmenuItem from './vmenu-item.vue'
import searchable from '@/mixins/searchable'
import { isObject, isInt } from '@/utils'
import wektor from '@/wektor'

export default {
	mixins: [searchable],

	props: {
		items: {
			type: Array,
			default: () => [],
		}
	},

	components: { vmenuItem },

	methods: {
		selectItem(selector) {
			let item

			if (isObject(selector))
				item = selector
			else if (isInt(selector))
				item = this.filteredItems[selector]

			if (!item) return

			item.shortcut.callback({wektor})
		},
	},
}	
</script>