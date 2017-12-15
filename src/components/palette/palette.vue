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
				>
				</palette>
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

import number from './components/number'
import checkbox from './components/checkbox'
import coordinate from './components/coordinate'
import bezier from './components/bezier'
import color from './components/color'
import colorpicker from './components/colorpicker'
import stroke from './components/stroke'
import tree from './components/tree'
import layers from './components/layers'
import paper from 'paper'

import Vue from 'vue'
import VueInputAutowidth from 'vue-input-autowidth'
Vue.use(VueInputAutowidth)

export default {
	name: 'palette',

	props: {
		values: Object,
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

	components: { number, coordinate, bezier, checkbox, color, colorpicker, stroke, tree, layers },

	computed: {
		children() {
			const components = this.$options.components
			const { values, layout } = this
			const children = []

			for (const [key, layoutProp] of Object.entries(layout)) {
				const { label, type } = layoutProp

				let child

				if (this.isComponentDescription(layoutProp)) {
					if (this.reservedKeys.includes(key))
						console.warn(`'${key}' is a reserved key and shouldn't be used as a values key`)

					if (!components[type])
						console.warn(`there is no component '${type}'`)

					child = {
						key,
						type,
						component: components[type],
						payload: layoutProp,
						get value() {
							return values[key]
						},
						set value(value) {
							values[key] = value
						},	
					}			
				} else if (isObject(layoutProp)) {
					child = {
						key,
						type: 'palette',
						values,
						layout: layoutProp,
						payload: layoutProp,
					}			
				}

				if (child) children.push(child)
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
	},
}
</script>