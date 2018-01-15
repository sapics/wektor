<template>
	<vddl-draggable
		class="palette-layers-recursive"
		:class="{ hasChildren }"
		:draggable="item"
		:index="index"
		:wrapper="list"
		:type="item.type"
		:disable-if="disable"
		:selected="handleSelected"
	>
		<div v-if="item.children">
			<vddl-nodrag
				class="info"
			>
				<span 
					v-show="hasChildren"
					class="chevron"
					:class="{ opened }"
					@click.stop="toggleOpen"
				>&#9656;</span>
				<vddl-handle>
					<span 
						class="label"
						:class="{ selected, highlight: selected }"
					>{{ item.name }}</span>
				</vddl-handle>
			</vddl-nodrag>
			<vddl-list
				v-if="opened"
				:list="item.children"
				:index="index"
				:inserted="handleInserted"
			>
				<nested-tree v-for="(child, index) in item.children"
					:key="child.id"
					:list="item.children"
					:item="child"
					:index="index"
				></nested-tree>
				<vddl-placeholder style="height: 1px; background: black; width: 100%; margin-top: -1px;"></vddl-placeholder>
			</vddl-list>
		</div>
		<div v-else 
			:class="{ selected }"
			@contextmenu="handleContextMenu"
		>
			{{item.name}}
		</div>
	</vddl-draggable>
</template>


<style lang="scss" scoped>
.vddl-dragging .vddl-list {
	/* prevent that a item can be dropped into itself */
	pointer-events: none;
}

.palette-layers-recursive {
	position: relative;

	&.hasChildren {
		padding-left: 0.65em;
	}

	.info {
		user-select: none;
		cursor: pointer;
	}

	.chevron {
		position: absolute;
		left: 0;
		font-style: normal;
		color: var(--wektor-dialog-border-color);

		&.opened {
			transform: rotate(90deg);
		}
	}
}	
</style>

<script>
import wektor from '@/wektor'

export default {
	name: 'nested-tree',

	props: {
		item: Object,
		list: Array,
		index: Number,
		open: {
			type: Boolean,
			default: true
		},
		disable: {
			type: Boolean,
			default: false,
		}
	},

	data() {
		return {
			opened: (this.item.open !== false),
		}
	},

	computed: {
		hasChildren() {
			const children = this.item.children
			return (children && children.length)
		},

		selected() {
			return this.item.selected
		},
	},

	methods: {

		handleInserted({ index, item: insertedItem, list }) {
			// in paper.js, items with a lower index are lower in the hierarchy
			// for the layers panel however we need to show them in inverted hierarchy
			// so that the first item in the layers panel will be the top-most paper item
			const invertedIndex = (list.length - 1) - index
			const paperItem = wektor.project.getItem({ id: this.item.id })
			const insertedPaperItem = wektor.project.getItem({ id: insertedItem.id })
			paperItem.insertChild(invertedIndex, insertedPaperItem)
		},

		handleSelected() {
			const paperItem = wektor.project.getItem({ id: this.item.id })
			wektor.project.deselectAll()
			paperItem.selected = true	
		},	

		handleContextMenu(event) {
			
		},

		toggleOpen() {
			this.opened = !this.opened
			const paperItem = wektor.project.getItem({ id: this.item.id })
			paperItem.data.open = this.opened
		},
	},
}	
</script>