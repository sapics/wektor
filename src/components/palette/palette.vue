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

export default {
	props: ['values', 'layout', 'id'],

	components: {number, coordinate, bezier, checkbox, color, colorpicker},

	computed: {
		children() {
			const commonLayout = (this.layout.type !== undefined)
			const children = []
			const values = this.values
			const layout = this.layout
			const components = this.$options.components

			if (commonLayout) {
				for (let [key] of Object.entries(values)) {

					let child = {
						key,
						component: components[layout.type],
					}

					children.push(
						Object.assign(
							makeValueGetterSetter(key),
							child,
						)
					)
				}
			} else {
				for (let [key, spec] of Object.entries(layout)) {
					let child = {
						key,
						component: components[spec.type],
					}

					children.push(
						Object.assign(
							makeValueGetterSetter(key),
							spec,
							child,
						)
					)
				}
			}

			function makeValueGetterSetter(key) {
				return {
					get value() {
						return values[key]
					},
					set value(value) {
						values[key] = value
						console.log(values[key])
					},
				}
			}

			return children
		}
	},
}
</script>