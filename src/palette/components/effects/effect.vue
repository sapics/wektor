<template>
	<vddl-draggable
		:id="`effect${key}`"
		:wrapper="wrapper"
		:index="index"
		:draggable="spec"
		:selected="handleSelected"
		:moved="moved"
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
		dialogId: String,
		moved: null,
	},

	computed: {
		id() {
			return this.spec.id
		},

		key() {
			return this.spec.key
		},

		ownerId() {
			return this.spec.ownerId
		},

		label() {
			return this.spec.label
		},
	},

	methods: {
		handleSelected(item, target) {
			const paperItem = wektor.project.getItem({ id: this.ownerId })
			if (!paperItem) {
				console.warn(`No item found with id '${this.ownerId}'`)
				return
			}

			const effect = paperItem.wektorEffects.list.find(effect => effect.key === this.key)
			effect.openDialog({target}, { parentId: this.dialogId })
		},
	},
}	
</script>