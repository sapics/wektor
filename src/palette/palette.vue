<template>
	<div class="palette-wrap" :class="['palette', align ? `align-${align}` : null]">
		<div 
			v-if="label && align === 'indent'"
			class="label"
		>{{label}}</div>
		<div class="palette">
			<div 
				v-if="label && align !== 'indent'"
				class="label"
			>{{label}}</div>
			<template v-for="(child, index) in children">
				<palette
					v-if="child.type === 'palette'"
					:key="child.key"
					:id="`${id}-${child.key}`"
					:data-id="child.key"
					:dialogId="dialogId"
					:payload="child.payload"
					:values="child.values"
					:layout="child.layout"				
				></palette>			
				<component
					v-else
					:is="child.component"
					:key="child.key"
					:propKey="child.key"
					:id="`${id}-${child.key}`"
					:data-id="child.key"
					:dialogId="dialogId"
					:payload="child.payload"
					v-model="child.value"
				></component>			
			</template>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.palette-wrap {
	.label {
		cursor: default;
	}
}

.align-columns {
	& > .palette {
		display: table;
	}

	& > .palette > * {
		display: table-cell;
		padding-right: 0.27em;
	}

	& > .palette > :last-child {
		padding-right: 0
	}
}

.align-indent {
	display: table;
	& > * {
		display: table-cell;
		padding-right: 0.27em;
	}

	& > :last-child {
		padding-right: 0;
	}
}

.align-comma-separated {
	& > .palette {
		display: table;
	}

	& > .palette > * {
		display: table-cell;
		padding-right: 0.27em;
		&:after {
			content: ',';
		}
	}

	& > .palette > :last-child {
		padding-right: 0;
		&:after {
			content: ''
		}
	}

	& > .palette > .label:after {
		content: '';
	}
}	
</style>

<script type="text/javascript">
import { isString, isObject, resolvePropertyPath } from '@/utils'

import paper from 'paper'
import number from './components/number'
import checkbox from './components/checkbox'
import coordinate from './components/coordinate'
import bezier from './components/bezier'
import color from './components/color'
import colorpicker from './components/colorpicker'
import stroke from './components/stroke'
import tree from './components/tree'
import layers from './components/layers'
import strokeDetails from './components/stroke-details'
import vselect from './components/vselect'
import vtext from './components/vtext'
import popup from './components/popup'
import vcode from './components/vcode'
import drop from './components/drop'
import boolean from './components/boolean'

import Vue from 'vue'
import VueInputAutowidth from 'vue-input-autowidth'
Vue.use(VueInputAutowidth)

export default {
	name: 'palette',

	props: {
		values: null,
		layout: Object,
		id: String,
		dialogId: String,
		payload: {
			default() {
				return {}
			}
		}
	},

	data() {
		return {
			reservedKeys: ['type', 'label'],
		}
	},

	components: { 
		number, 
		coordinate, 
		bezier, 
		checkbox, 
		color, 
		colorpicker, 
		stroke, 
		strokeDetails, 
		tree, 
		layers, 
		vselect,
		vtext,
		popup,
		vcode,
		drop,
		boolean,
	},

	computed: {
		children() {
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

		align() {
			return this.payload.align
		},

		label() {
			return this.payload.label
		}
	},

	methods: {
		isComponentDescription(layoutProperty) {
			const type = layoutProperty.type
			return (type && isString(type))
		},

		getComponent(type) {
			// components that have the same name as native html elements are prefixed by 'v' (e.g. 'vselect')
			const components = this.$options.components
			const component = components[type] || components['v' + type]
			return component
		},

		createChild(layout, values, key = false) {
			let child

			if (this.isComponentDescription(layout)) {
				const type = layout.type
				const component = this.getComponent(type)

				if (!component)
					console.warn(`there is no component '${type}'`)				

				if (key && this.reservedKeys.includes(key))
					console.warn(`'${key}' is a reserved key and shouldn't be used as a values key`)

				child = {
					key,
					type,
					component,
					payload: layout,
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
				if (layout.popup) {
					child = {
						key,
						component: this.getComponent('popup'),
						payload: {
							label: layout.label,
							layout,
							values,
						},
					}
				} else {
					child = {
						key,
						type: 'palette',
						values,
						layout,
						payload: layout, // the layout also contains the payload (eg. { type: 'number', max: 3 })
					}					
				}			
			}

			return child
		},
	},
}
</script>