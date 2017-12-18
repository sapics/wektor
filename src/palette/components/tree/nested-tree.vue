<template>
	<vddl-draggable
		class="nested-tree"
		:class="{ hasChildren }"
		:draggable="item"
		:index="index"
		:wrapper="list"
		:type="item.type"
		:disable-if="disable"
	>
		<div v-if="item.children">
			<div 
				class="info"
				@click="opened = !opened"
			>
				<span 
					v-show="hasChildren"
					class="chevron"
					:class="{ opened }"
				>&#9656;</span>
				<span class="label">{{ item.name }}</span>
			</div>
			<vddl-list
				v-show="opened"
				:list="item.children"
				:index="index"
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
		<div v-else>
			{{item.name}}
		</div>
	</vddl-draggable>
</template>

<style lang="scss" scoped>
.vddl-dragging .vddl-list {
	/* prevent that a item can be dropped into itself */
	pointer-events: none;
}

.nested-tree {
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

		&.opened {
			transform: rotate(90deg);
		}
	}
}	
</style>

<script>
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
			opened: this.open,
		}
	},

	computed: {
		hasChildren() {
			const children = this.item.children
			return (children && children.length)
		},
	},
}	
</script>