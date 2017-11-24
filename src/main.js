// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import eventBus from './eventBus.js'
import Wektor from './Wektor.vue'
import paper from 'paper'
import BezierTool from './tools/BezierTool/BezierTool.js'
import SelectionTool from './tools/SelectionTool/SelectionTool.js'
import outside from './directives/outside.js'
import visible from './directives/visible.js'

paper.install(window)
paper.setup('main-canvas')
paper.settings.handleSize = 10
paper.project.currentStyle = {
	strokeColor: 'red',
	// fillColor: 'green',
	strokeWidth: 20,
}
const target = new paper.Group()

Vue.config.productionTip = false
Vue.use(eventBus)
Vue.directive('outside', outside)
Vue.directive('visible', visible)

/* eslint-disable no-new */
new Vue({
	el: '#wektor',

	components: { Wektor },

	template: '<Wektor ref="wektor" :target="target" />',

	data() {
		return {
			target,
		}
	},

	computed: {
		wektor() {
			return this.$refs.wektor
		}
	},

	mounted() {
		this.wektor.addTools([BezierTool, SelectionTool])
		this.wektor.target.addChild(new paper.Path.Rectangle([100, 100], {width: 200, height: 200}))
	},
})