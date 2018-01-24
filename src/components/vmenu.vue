<template>
	<div>
		<vmenu-item v-for="item of filteredItems"
			class="label"
			:key="item.label"
			:label="item.label"
			:shortcut="item.shortcut"
			:class="{ 'highlight': item === focused }"
			@click="selectItem(item, $event)"
		></vmenu-item>
	</div>
</template>

<script>
import vmenuItem from './vmenu-item.vue'
import searchable from '@/mixins/searchable'
import { isObject, isInt, isFunction } from '@/utils'
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
		selectItem(selector, event) {
			console.log('select item')
			let item

			if (isObject(selector))
				item = selector
			else if (isInt(selector))
				item = this.filteredItems[selector]

			if (!item) return

			isFunction(item.shortcut.callback) && item.shortcut.callback(wektor, event)
		},
	},
}	
</script>