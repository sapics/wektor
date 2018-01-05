import Vue from 'vue'
import Vuex from 'vuex'

import settings from './settings'

import eventBus from './eventBus.js'
import store from './store'

import outside from './directives/outside.js'
import visible from './directives/visible.js'
import draggable from './directives/draggable.js'
import inputAutowidth from './directives/input-autowidth'

import wektor from './wektor'
import WektorUi from './WektorUi.vue'
import paper from 'paper'
import BezierTool from './tools/BezierTool/BezierTool'
import SelectionTool from './tools/SelectionTool/SelectionTool'
import GridTool from './tools/GridTool'

import Vddl from 'vddl'

paper.install(window)
paper.setup('main-canvas')
paper.project.currentStyle = {
	strokeColor: 'green',
	strokeWidth: 10,
}

Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(eventBus)
Vue.use(Vddl)
Vue.directive('outside', outside)
Vue.directive('visible', visible)
Vue.directive('draggable', draggable)
Vue.directive('autowidth', inputAutowidth)

Vue.prototype.$settings = settings

window.wektor = wektor
wektor.setup(paper.project)
wektor.addTools({ BezierTool, GridTool, SelectionTool })

var p = new paper.Path.Circle({
	radius: 100,
	position: [400, 400],
	name: 'gelb',
	fillColor: 'yellow'
})

var p = new paper.Path.Circle({
	radius: 100,
	position: [500, 400],
	name: 'rot',
	fillColor: 'red'
})

p.fillColor.hue = 250

new Vue({
	el: '#wektor',

	components: { WektorUi },

	template: '<wektor-ui/>',

	store,
})