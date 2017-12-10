import Vue from 'vue'
import Vuex from 'vuex'

import eventBus from './eventBus.js'
import store from './store'

import outside from './directives/outside.js'
import visible from './directives/visible.js'
import draggable from './directives/draggable.js'

import wektor from './wektor'
import WektorUi from './WektorUi.vue'
import paper from 'paper'
import BezierTool from './tools/BezierTool/BezierTool.js'
import SelectionTool from './tools/SelectionTool/SelectionTool.js'
import GridTool from './tools/GridTool'

import inputAutowidth from './directives/input-autowidth'
Vue.directive('autowidth', inputAutowidth)

paper.install(window)
paper.setup('main-canvas')
paper.project.currentStyle = {
	strokeColor: 'green',
	strokeWidth: 10,
}

Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(eventBus)
Vue.directive('outside', outside)
Vue.directive('visible', visible)
Vue.directive('draggable', draggable)

wektor.setup(new paper.Group())
wektor.addTools([BezierTool, GridTool, SelectionTool])

var p = new paper.Path.Circle({
	radius: 100,
	position: [400, 400],
	// fillColor: 'yellow'
})

wektor.target.addChild(p)

new Vue({
	el: '#wektor',

	components: { WektorUi },

	data() {
		return {
			name: 'Arno'
		}
	},

	// template: `<div><input type="text" v-autowidth="{maxWidth: '960px', minWidth: '20px', comfortZone: 0}" :value="name" placeholder="Watch me change size with my content!" /></div>`,
	template: '<wektor-ui/>',

	store,
})