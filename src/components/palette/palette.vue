<template>
	<div class="palette">	
		<template v-for="(child, index) in children">
			<component 
				:is="child.component" 
				:data-id="child.key"
				v-model="child.value" 
				:key="child.key" 
				:id="child.key"
				:dialogId="id"
				:label="child.label"
			></component>				
		</template>
	</div>
</template>

<script type="text/javascript">
import { resolvePropertyPath } from '@/utils'
import number from './components/number'
import checkbox from './components/checkbox'
import coordinate from './components/coordinate'
import bezier from './components/bezier'
import color from './components/color'
import colorpicker from './components/colorpicker'
import stroke from './components/stroke'

export default {
	name: 'palette',

	props: ['values', 'layout', 'id'],

	components: {number, coordinate, bezier, checkbox, color, colorpicker, stroke},

	data() {
		return {
			children: [],
		}
	},

	mounted() {
		console.log(this)
		let nested = this.id
		this.addChildren(this.values, this.layout, nested)
	},

	methods: {
		addChildren(values, layout, nested) {
			const components = this.$options.components

			for (let [key, spec] of Object.entries(layout)) {
				// the key can also be a path to a nested property like 'obj.child.key' so we have to resolve it
				const { obj: resolvedObj, key: resolvedKey } = resolvePropertyPath(values, key, false)

				let child = {
					key: `${nested}>${resolvedKey}`,
					component: components[spec.type],
				}				

				this.children.push(
					Object.assign(
						this.makeValueGetterSetter(resolvedObj, resolvedKey),
						spec,
						child,
					)
				)
			}
		},

		makeValueGetterSetter(values, key) {
			return {
				get value() {
					return values[key]
				},
				set value(value) {
					values[key] = value
				},
			}
		},
	},
}
</script>