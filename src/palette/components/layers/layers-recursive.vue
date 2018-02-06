<template>
	<vddl-draggable
		v-if="finished"
		class="palette-layers-recursive"
		:class="{ hasChildren }"
		:draggable="item"
		:index="index"
		:wrapper="list"
		:type="item.type"
		:disable-if="disable"
		:selected="handleSelected"
	>
		<div v-if="item.children" class="palette-layers-content-wrap">
			<div class="palette-layers-indent">
					<span 
						v-show="hasChildren"
						class="chevron"
						:class="{ opened }"
						@click.stop="toggleOpen"
					>&#9656;</span>
					<div v-if="opened" class="palette-indent-line"></div>
			</div>	
			<div class="palette-layers-content">
				<vddl-handle :class="{ highlight }">
					<span 
						class="label"
						:class="{ selected, hasChildren }"
						@mousedown.stop="capturedMouseDown = true"
					>{{ item.name }}</span>
				</vddl-handle>	
				<vddl-list
					v-if="opened"
					:list="item.children"
					:index="index"
					:drop="handleDrop"
					class="palette-layers-recursive-children"
					:class="{ hasChildren }"
				>		
					<layers-recursive v-for="(child, index) in item.children"
						:key="child.id"
						:list="item.children"
						:item="child"
						:index="index"
					></layers-recursive>
					<vddl-placeholder style="height: 1px; background: black; width: 100%; margin-top: -1px;"></vddl-placeholder>
				</vddl-list>								
			</div>
		</div>
		<div v-else
			class="label"
			:class="{ selected, highlight }"
			@contextmenu="handleContextMenu"
			@mousedown.stop="capturedMouseDown = true"
		>{{item.name}}</div>
	</vddl-draggable>
</template>


<style lang="scss" scoped>
@import "src/sass/variables";

.vddl-dragging .vddl-list {
	/* prevent that a item can be dropped into itself */
	pointer-events: none;
}

.palette-layers-content-wrap {
	display: flex;
}

.palette-layers-content {
	flex: 1;
}

.palette-layers-indent {
	width: 1em;
	display: flex;
	flex-direction: column;
	align-items: center;

	.palette-indent-line {
		margin-top: -0.2em;
		width: 1px;
		background: var(--wektor-dialog-border-color);
		flex: 1;
		margin-bottom: 0.35em;	
	}
}

.palette-layers-recursive {
	position: relative;

	.info {
		user-select: none;
		cursor: pointer;
	}

	.chevron {
		font-style: normal;
		color: var(--wektor-dialog-border-color);
		display: inline-block;

		&.opened {
			margin-left: 0.066em;
			transform: rotate(90deg);
		}
	}

	.label {
		padding-right: $space;
	}
}	
</style>

<script>
import wektor from '@/wektor'
import { isFunction } from '@/utils' 

export default {
	name: 'layers-recursive',

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
		},
		nestedIndex: {
			type: Number,
			default: 0,
		}
	},

	data() {
		return {
			opened: (this.item.open !== false),
		}
	},

	computed: {
		finished() {
			return (this.item.finished !== false)
		},

		hasChildren() {
			const children = this.item.children
			return (children && children.length)
		},

		selected() {
			return this.item.selected
		},

		highlight() {
			if (this.item.type === 'Layer') {
				return (wektor.project.activeLayer.id === this.item.id)
			} else {
				return this.selected
			}
		},

		indent() {
			return (this.nestedIndex * 0.8 + 0.17) + 'em'
		},
	},

	methods: {
		handleInserted({ index, item: insertedItem, list }) {
			// in paper.js, items with a lower index are lower in the hierarchy
			// for the layers panel however we need to show them in inverted hierarchy
			// so that the first item in the layers panel will be the top-most paper item
			// const invertedIndex = (list.length - 1) - index
			// const paperItem = wektor.project.getItem({ id: this.item.id })
			// const insertedPaperItem = wektor.project.getItem({ id: insertedItem.id })
			// paperItem.insertChild(invertedIndex, insertedPaperItem)

			wektor.state.enabled = false
			// const paperItem = wektor.project.getItem({ id: this.item.id })
			// const insertedPaperItem = wektor.project.getItem({ id: insertedItem.id })
			// paperItem.insertChild(index, insertedPaperItem)
			// console.log({index})
			// wektor.state.enabled = true

			return arguments[0]
		},	

		handleDrop(data) {
			let { index, list, item: droppedItem } = data

			list.splice(index, 0, droppedItem)

			const hasDuplicates = list.filter(el => el.id === droppedItem.id).length === 2
			const oldIndex = list.findIndex(el => el.id === droppedItem.id)
			let listLength = list.length	

			// vddl has duplicated the item and not removed the old one yet. so when we are
			// dropping an item into the same list it was before we'll have a duplicate in the list.
			// to tell paper.js the right index to insert the item we have to calculate the items 
			// final index (and the final list length in order to calculate the correct inverted index)
			if (hasDuplicates) {
				listLength -= 1
				if (oldIndex < index)
					index -= 1
			}

			// in paper.js, items with a lower index are lower in the hierarchy
			// for the layers panel however we need to show them in inverted hierarchy
			// so that the first item in the layers panel will be the top-most paper item
			const invertedIndex = (listLength - 1) - index
			const paperItem = wektor.project.getItem({ id: this.item.id })
			const droppedPaperItem = wektor.project.getItem({ id: droppedItem.id })

			paperItem.insertChild(invertedIndex, droppedPaperItem)
		},

		handleSelected() {
			if (this.capturedMouseDown) {
				var event = document.createEvent('Event');
				event.initEvent('mousedown', true, true); // can bubble, and is cancellable
				document.body.dispatchEvent(event);
				this.capturedMouseDown = false
			}

			const paperItem = wektor.project.getItem({ id: this.item.id })
			if (this.item.type === 'Layer') {
				paperItem.activate()
				wektor.state.update()
			} else {
				paperItem.layer.activate()
				wektor.project.deselectAll()
				paperItem.selected = true				
			}	
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