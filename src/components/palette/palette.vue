<template>
	<div class="palette">
		<template v-for="(child, index) in children">
			<component :is="child.component" v-model="child.value" :key="child.key" :id="child.key" :label="child.label"></component>
		</template>
	</div>
</template>

<style lang="scss">
.palette {
	position: absolute;
	top: 0;
	bottom: 0;
	display: inline-table;
	background: aqua;
}
</style>

<script type="text/javascript">
import number from './components/number'
import checkbox from './components/checkbox'
import coordinate from './components/coordinate'
import bezier from './components/bezier'
import color from './components/color'
import colorpicker from './components/colorpicker'
import stroke from './components/stroke'

export default {
	props: ['values', 'layout', 'id'],

	components: {number, coordinate, bezier, checkbox, color, colorpicker, stroke},

	data() {
		return {
			children: [],
		}
	},

	computed: {
		// children() {
		// 	const commonLayout = (this.layout.type !== undefined)
		// 	const children = []
		// 	const values = this.values
		// 	const layout = this.layout
		// 	const components = this.$options.components

		// 	// for (let [key, spec] of Object.entries(layout)) {
		// 	// 	let child = {
		// 	// 		key,
		// 	// 		component: components[spec.type],
		// 	// 	}

		// 	// 	children.push(
		// 	// 		Object.assign(
		// 	// 			this.makeValueGetterSetter(values, key),
		// 	// 			spec,
		// 	// 			child,
		// 	// 		)
		// 	// 	)
		// 	// }
			
		// 	this.recursive(values, layout)

		// 	// if (commonLayout) {
		// 	// 	for (let [key] of Object.entries(values)) {

		// 	// 		let child = {
		// 	// 			key,
		// 	// 			component: components[layout.type],
		// 	// 		}

		// 	// 		children.push(
		// 	// 			Object.assign(
		// 	// 				this.makeValueGetterSetter(values, key),
		// 	// 				child,
		// 	// 			)
		// 	// 		)
		// 	// 	}
		// 	// } else {
		// 	// 	for (let [key, spec] of Object.entries(layout)) {
		// 	// 		let child = {
		// 	// 			key,
		// 	// 			component: components[spec.type],
		// 	// 		}

		// 	// 		children.push(
		// 	// 			Object.assign(
		// 	// 				this.makeValueGetterSetter(values, key),
		// 	// 				spec,
		// 	// 				child,
		// 	// 			)
		// 	// 		)
		// 	// 	}
		// 	// }

		// 	return children
		// }
	},

	mounted() {
		let nested = ''
		this.recursive(this.values, this.layout, nested)
	},

	methods: {
		recursive(values, layout, nested) {
			const components = this.$options.components

			for (let [key, spec] of Object.entries(layout)) {
				if (spec.type) {
					let child = {
						key: `${nested}>${key}`,
						component: components[spec.type],
					}

					this.children.push(
						Object.assign(
							this.makeValueGetterSetter(values, key),
							spec,
							child,
						)
					)
				} else {
					this.recursive(values[key], spec, `${nested}>${key}`)
				}
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