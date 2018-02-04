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
		<div v-if="item.children">
			<vddl-handle :class="{ highlight }" :style="{ paddingLeft: indent }" >
				<span 
					v-show="hasChildren"
					class="chevron"
					:class="{ opened }"
					@click.stop="toggleOpen"
				>&#9656;</span><!--
			--><span 
					class="label"
					:class="{ selected, hasChildren }"
					@mousedown.stop="capturedMouseDown = true"
				>{{ item.name }}</span>
			</vddl-handle>
			<vddl-list
				v-if="opened"
				:list="item.children"
				:index="index"
				:inserted="handleInserted"
				class="palette-layers-recursive-children"
				:class="{ hasChildren }"
			>
				<layers-recursive v-for="(child, index) in item.children"
					:key="child.id"
					:list="item.children"
					:item="child"
					:index="index"
					:nestedIndex="nestedIndex + 1"
				></layers-recursive>
				<vddl-placeholder style="height: 1px; background: black; width: 100%; margin-top: -1px;"></vddl-placeholder>
			</vddl-list>
		</div>
		<div v-else
			class="label"
			:style="{ paddingLeft: indent }" 
			:class="{ selected, highlight }"
			@contextmenu="handleContextMenu"
			@mousedown.stop="capturedMouseDown = true"
		>
			{{item.name}}
		</div>
	</vddl-draggable>
</template>


<style lang="scss" scoped>
@import "src/sass/variables";

.vddl-dragging .vddl-list {
	/* prevent that a item can be dropped into itself */
	pointer-events: none;
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
			transform: rotate(90deg) translate(0, -0.1em);
		}
	}

	.label {
		padding-right: 0.1em;
		&.hasChildren {
			padding-left: 0.3em;
		}
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
			const invertedIndex = (list.length - 1) - index
			const paperItem = wektor.project.getItem({ id: this.item.id })
			const insertedPaperItem = wektor.project.getItem({ id: insertedItem.id })
			paperItem.insertChild(invertedIndex, insertedPaperItem)
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