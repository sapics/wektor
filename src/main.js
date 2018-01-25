import Vue from 'vue'

import settings from './settings'

import outside from './directives/outside.js'
import visible from './directives/visible.js'
import draggable from './directives/draggable.js'
import inputAutowidth from './directives/input-autowidth'

import { wektor, ChangeFlag } from './wektor'
import WektorUi from './WektorUi.vue'
import paper from 'paper'
import BezierTool from './tools/BezierTool/BezierTool'
import SelectionTool from './tools/SelectionTool/SelectionTool'
import { GridTool, Grid } from './tools/GridTool'
import SnapperTool from './tools/SnapperTool'
import DrawingTool from './tools/DrawingTool'
import BaseTool from './tools/BaseTool'
import MatterJsTool from './tools/MatterJsTool'
import SnapperEffect from './effects/SnapperEffect'
import TestEffect from './effects/TestEffect'

import Vddl from 'vddl'

window.Vue = Vue

paper.install(window)
paper.setup('main-canvas')
paper.project.currentStyle = {
	strokeColor: 'blue',
	strokeWidth: 2,
}

Vue.config.productionTip = false
Vue.use(Vddl)
Vue.directive('outside', outside)
Vue.directive('visible', visible)
Vue.directive('draggable', draggable)
Vue.directive('autowidth', inputAutowidth)

Vue.prototype.$settings = settings

window.wektor = wektor
wektor.setup(paper.project)
wektor.addTools({ BezierTool, GridTool, SelectionTool, SnapperTool, DrawingTool })
wektor.addEffects({ SnapperEffect, TestEffect })
wektor.tools['BaseTool'] = BaseTool
wektor.tools.SelectionTool.activate()

var p1 = new paper.Path.Circle({
	radius: 100,
	position: [400, 400],
	name: 'gelb',
	fillColor: 'yellow'
})

// function test() {
// 	console.log('test')
// }

// wektor.changeTracker.on(p1, 'style', test)

// console.log( wektor.changeTracker.responds(p1, 'style', test) )

var p2 = new paper.Path.Circle({
	radius: 100,
	position: [500, 400],
	name: 'rot',
	fillColor: 'red'
})

var grid = new Grid({
	options: {
		spacing: {
			vertical: 20,
			horizontal: 20,
		}
	}
})

p2.on('click', () => {
	var effect = new SnapperEffect(p2, { grid })
})

// 
// var p1 = new paper.Path.Circle({
// 	radius: 100,
// 	position: [400, 400],
// 	name: 'gelb',
// 	fillColor: 'yellow'
// })

// const subLayer = new paper.Layer()

// wektor.project.layers[0].addChild(subLayer)
// subLayer.addChildren([p1])

// console.log(subLayer)

new Vue({
	el: '#wektor',

	components: { WektorUi },

	template: '<wektor-ui/>',
})