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
import DrawingTool from './tools/DrawingTool'
import BaseTool from './tools/BaseTool'
import MatterJsTool from './tools/MatterJsTool'
import SnapperEffect from './effects/SnapperEffect'
import TestEffect from './effects/TestEffect'
import ShakeEffect from './effects/ShakeEffect'
import { EllipseTool, RectangleTool } from './tools/ShapeTool'

import VueResize from 'vue-resize'
import Vddl from 'vddl'

import 'vue-resize/dist/vue-resize.css'
import Wek from './wek'

window.Vue = Vue

paper.install(window)
paper.setup('main-canvas')
paper.project.currentStyle = {
	strokeColor: 'aquamarine',
	strokeWidth: 4,
}

Vue.config.productionTip = false
Vue.use(VueResize)
Vue.use(Vddl)
Vue.directive('outside', outside)
Vue.directive('visible', visible)
Vue.directive('draggable', draggable)
Vue.directive('autowidth', inputAutowidth)

Vue.prototype.$settings = settings

window.wektor = wektor
wektor.setup(paper.project)
wektor.addTools({ SelectionTool, BezierTool, DrawingTool, EllipseTool, RectangleTool, GridTool })
wektor.addEffects({ 
	Snapper: SnapperEffect,
	Shaker: ShakeEffect, 
})
wektor.tools['BaseTool'] = BaseTool
wektor.tools.SelectionTool.activate()

// const wek = new Wek()
// wek.pivot = wek.bounds.bottomRight
// const margin = 20

// function alignWek() {
// 	wek.position = window.view.bounds.bottomRight.subtract([margin, margin])
// }
// alignWek()

// window.addEventListener('resize', alignWek)

// window.addEventListener('mousemove', (event) => {
// 	wek.update({
// 		point: new paper.Point(event),
// 	})
// })

const gelb = window.gelb = new paper.Path.Circle({
	radius: 100,
	position: [400, 400],
	name: '1 gelb',
	fillColor: 'yellow',
})
// const red = window.red = new paper.Path.Circle({
// 	radius: 100,
// 	position: [410, 410],
// 	name: '2 red',
// 	fillColor: 'red',
// })
// new paper.Path.Circle({
// 	radius: 100,
// 	position: [420, 420],
// 	name: '3 blue',
// 	fillColor: 'blue',
// })
// new paper.Path.Circle({
// 	radius: 100,
// 	position: [430, 430],
// 	name: '4 purple',
// 	fillColor: 'purple',
// })

// new paper.Group( new paper.Group([gelb]) )

// var p2 = new paper.Path.Circle({
// 	radius: 100,
// 	position: [500, 400],
// 	name: 'rot',
// 	fillColor: 'red'
// })

// var group = new paper.Group([p1, p2])

// var effect = new TestEffect()
// effect.input = p1
// console.log(effect.output)

// var grid = new Grid({
// 	bounds: paper.view.bounds,
// })

// gelb.wektorEffects.add(wektor.effects.Test)

new Vue({
	el: '#wektor',

	components: { WektorUi },

	template: '<wektor-ui/>',
})