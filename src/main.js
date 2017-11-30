import Vue from 'vue'
import Vuex from 'vuex'

import eventBus from './eventBus.js'
import store from './store'

import outside from './directives/outside.js'
import visible from './directives/visible.js'
import draggable from './directives/draggable.js'

import Wektor from './Wektor.vue'
import paper from 'paper'
import BezierTool from './tools/BezierTool/BezierTool.js'
import SelectionTool from './tools/SelectionTool/SelectionTool.js'
import GridTool from './tools/GridTool'

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
Vue.use(Vuex)
Vue.use(eventBus)
Vue.directive('outside', outside)
Vue.directive('visible', visible)
Vue.directive('draggable', draggable)

/* eslint-disable no-new */
new Vue({
	el: '#wektor',

	components: { Wektor },

	template: '<Wektor ref="wektor" :target="target" />',

	store,

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
		this.wektor.addTools([BezierTool, GridTool, SelectionTool])
		this.wektor.target.addChild(new paper.Path.Rectangle([100, 100], {width: 200, height: 200}))
	},
})