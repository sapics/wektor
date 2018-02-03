<template>
	<vddl-draggable
		class="palette-effect"
		:id="`${dialogId}-effect${key}`"
		:wrapper="wrapper"
		:index="index"
		:draggable="spec"
		:selected="handleSelected"
		:moved="moved"
	>
		<span 
			:id="`${dialogId}-effect${key}-label`"
			class="palette-label"
			:class="{ highlight: isSelected }"
			@contextmenu="onContextMenu"
		>{{label}}</span>
	</vddl-draggable>
</template>

<style lang="scss" scoped>
.palette-effect {
	.palette-label {
		cursor: pointer;
		text-decoration: underline;
	}
}	
</style>

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
		isSelected: false,
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
			this.$emit('selected')
		},

		onContextMenu(event) {
			const paperItem = wektor.project.getItem({ id: this.ownerId })
			if (!paperItem) {
				console.warn(`No item found with id '${this.ownerId}'`)
				return
			}

			const effect = paperItem.wektorEffects.list.find(effect => effect.key === this.key)
			effect.openDialog(event, { parentId: this.dialogId })
		},
	},
}	
</script>