<template>
	<div class="tree">
		<template v-if="isObject(data)">
			<tree
				v-for="(child, key) in data"
				:key="key"
				:value="child"
			></tree>
		></template>
		<template v-else>
			<div>key</div>
		</template>
	</div>
</template>

<script>
import { isObject } from '@/utils'

export default {
	name: 'tree',

	props: ['value'],

	computed: {
		data() {
			return this.value
		}
	},

	methods: {
		isObject,
	},
}	
</script>