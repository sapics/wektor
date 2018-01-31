<template>
	<div class="palette" :class="[ alignClass, typeClass, spec.stretchContent ? 'stretch-content' : null]">
		<div class="palette-label-wrap" v-if="label">
			<span class="palette-chevron"
				:class="{ open }"
				@click="onChevronClick"
			>&#9656;</span>
			<span class="palette-label"
				ref="label"
				:id="`${spec.id}-label`"
				@click="onLabelClick"
			>{{label}}</span>
		</div>
		<div v-if="children && open"
			class="palette-content"
		>
			<component v-for="(child, index) in children"
				:is="child.component"
				:key="child.key"
				:id="`${id}-${child.key}`"
				:dialogId="dialogId"
				:spec="child"
				:payload="child.payload"
				:value="child.value"
				v-model="child.value"
			></component>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.palette {
	input {
		background: transparent!important;
	}

	.palette-chevron {
		display: none;
	}

	.label {
		user-select: none;
	}
}

.palette.stretch-content {
	&, .palette-content {
		height: 100%;
	}
}

.palette.align-comma-separated {
	& > .palette {
		// display: table;
	}

	& > .palette-content > * {
		// display: table-cell;
		padding-right: 0.27em;
		&:after {
			content: ',';
		}
	}

	& > .palette-content > :last-child {
		padding-right: 0;
		&:after {
			content: ''
		}
	}

	& > .palette-label-wrap, .palette-content {
		// display: table-cell;
		padding-right: 0.27em;
	}	
}

.palette.align-columns {
	& > .palette-content {
		// display: table;
	}

	& > .palette-content > * {
		// display: table-cell;
		padding-right: 0.27em;
	}

	& > .palette-content > :last-child {
		padding-right: 0
	}
}

.palette.type-folder {
	.palette-chevron {
		display: inline-block;
		cursor:pointer;
		user-select: none;
		&.open {
			transform: rotate(90deg);
		}
	}

	.palette-content {
		margin-left: 0.8em;
	}
}
</style>

<script>
import { isString, isObject } from '@/utils'
import components from './components'
import wektor from '@/wektor'

export default {
	name: 'palette',

	components,

	props: {
		id: String,
		dialogId: String,
		spec: {
			type: Object,
			default() {
				return {}
			},
		},
	},

	data() {
		return {
			open: this.spec.layout.open === undefined ? true : this.spec.layout.open,
		}
	},

	computed: {
		values() {
			return this.spec.values || {}
		},

		layout() {
			return this.spec.layout || {}
		},

		label() {
			return this.layout.label
		},

		alignClass() {
			const align = this.layout.align
			return align ? `align-${align}` : null
		},

		typeClass() {
			const type = this.layout.type
			return type ? `type-${type}` : null
		},	

		children() {
			if (this.layout.type === 'popup') return

			const components = this.$options.components
			const { values, layout } = this
			const children = []

			if (this.isComponentDescription(layout)) {
				var child = this.createChild(layout, values)
				if (child) children.push(child)
			} else {
				for (const [key, layoutProp] of Object.entries(layout)) {
					var child = this.createChild(layoutProp, values, key)
					if (child) children.push(child)
				}
			}

			return children		
		},
	},

	methods: {
		onLabelClick(event) {
			if (this.layout.type !== 'popup') return

			wektor.openDialog({
				id: this.id,
				parentId: this.dialogId,
				reference: this.$refs.label.id,
				layout: { ...this.layout, label: false, type: 'palette' }
			})					
		},

		onChevronClick(event) {
			this.open = !this.open
		},

		isComponentDescription(layout) {
			const type = layout.type
			return type && isString(layout.type) && !['palette', 'folder', 'popup'].includes(type)
		},

		createChild(layout, values, key) {
			let child

			if (this.isComponentDescription(layout)) {
				const type = layout.type
				const component = this.getComponent(type)

				if (!component) 
					console.warn(`there is no component '${type}'`)

				child = {
					payload: layout,
					key,
					component,
					get value() {
						return key ? values[key] : values
					},
					set value(value) {
						if (key)
							values[key] = value
						else
							values = value
					},					
				}
			} else if (isObject(layout)) {
				const component = this.getComponent('palette')
				child = { component, values, layout, key }					
			}

			return child
		},

		getComponent(type) {
			// components that have the same name as native html elements are prefixed by 'v' (e.g. 'vselect')
			const components = this.$options.components
			const component = components[type] || components['v' + type]
			return component
		},						
	},
}
</script>