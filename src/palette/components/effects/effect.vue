<template>
	<vddl-draggable
		:wrapper="wrapper"
		:index="index"
		:draggable="spec"
		:selected="handleSelected"
	>{{label}}</vddl-draggable>
</template>

<script>
import wektor from '@/wektor'

export default {
	props: {
		spec: {
			type: Object,
			default() {
				return {}
			},
		},
		wrapper: Array,
		index: Number,
	},

	computed: {
		id() {
			return this.spec.id
		},

		key() {
			return this.spec.key
		},

		paperItemId() {
			return this.spec.paperItemId
		},

		label() {
			return this.spec.label
		},
	},

	methods: {
		handleSelected(item, target) {
			const paperItem = wektor.project.getItem({ id: this.paperItemId })
			const effect = paperItem.wektorEffects.find(effect => effect.key === this.key)
			// effect.openDialog({target}, {
			// 	rootId: 
			// })
		},
	},
}	
</script>