<template>
	<div class="wek">
		<vwek-bubble v-for="(bubble, index) in bubbles"
			:key="bubble.hash"
			:index="index"
			:spec="bubble"
			:bubbles="bubbles"
		></vwek-bubble>		
		<vwek-bubble v-for="(bubble, index) in systemBubbles"
			:key="bubble.hash"
			:index="index"
			:spec="bubble"
			:bubbles="systemBubbles"
		></vwek-bubble>
<!-- 		<div 
			class="wek-bubble-wrap" 
			v-if="text !== null"
			v-outside:mousedown="onMouseDownOutside"
		>
			<div class="wek-bubble">{{text}}</div>
			<svg class="wek-bubble-pointer" viewBox="0 0 7 10">
				<path vector-effect="non-scaling-stroke" d="M0,0c0,0,2.3,6.6,7,10c0,0-1.9-7.1-0.8-10" />
			</svg>
			<svg 
				class="wek-bubble-close" 
				viewBox="0 0 10 10"
				@click="close"
			>
				<line vector-effect="non-scaling-stroke" x1="0" y1="0" x2="10" y2="10" />
				<line vector-effect="non-scaling-stroke" x1="10" y1="0" x2="0" y2="10" />
			</svg>
		</div> -->
	</div>
</template>

<style lang="scss">
.wek {
	position: absolute;
	bottom: 0;
	right: 0;
	margin: 0 1em 240px;
	z-index: 999999;
	display: flex;
	flex-direction: column;
	align-items: flex-end;

	.initial-bubble-wrap .wek-bubble {
		max-width: 12em;
	}	
}

.wek-bubble-wrap {

	// .wek-bubble {
	// 	background: white;
	// 	border: 1px solid black;
	// 	border-radius: 2em;
	// 	padding: 1em;
	// 	min-width: 2em;
	// 	max-width: 7em;
	// 	hyphens: auto;
	// }

	// .wek-bubble-pointer {
	// 	width: auto;
	// 	height: 20px;
	// 	margin-top: -1px;
	// 	margin-left: 2em;
	// 	fill: white;
	// 	stroke: black;
	// }

	// .wek-bubble-close {
	// 	display: none;
	// 	cursor: pointer;
	// 	position: absolute;
	// 	top: 0;
	// 	right: 0;
	// 	width: 0.5em;
	// 	height: 0.5em;
	// 	stroke: black;
	// }

	// &:hover {
	// 	.wek-bubble-close {
	// 		display: block;
	// 	}
	// }
}
</style>

<script>
import vwekBubble from './vwek-bubble'
import Vue from 'vue'
import Wek from '@/wek'
import wektor from '@/wektor'
import paper from 'paper'
import { getHashCode } from '@/utils'

export default {
	components: { vwekBubble },

	data() {
		return {
			systemBubbles: [],
			bubbles: [],
			// text: null,
			// initialText: 'Welcome to wektor!',
			hashes: [],
			closeDelay: 6 * 1000,
		}
	},

	created() {
		const wekLayer = new paper.Layer({
			name: 'wekLayer',
			iterable: false,
		})			
		const wek = new Wek()
		wek.pivot = wek.bounds.bottomRight
		const margin = 20

		wektor.project.layers[0].activate()		

		function alignWek() {
			wek.position = window.view.bounds.bottomRight.subtract([margin, margin])
		}
		alignWek()

		window.addEventListener('resize', alignWek)
		window.addEventListener('mousemove', (event) => {
			wek.update({
				point: new paper.Point(event),
			})
		})
		const startPoint = new paper.Point(0, 0)
		wek.update({ point: startPoint })
		wek.update({ point: startPoint })

		wektor.on({
			speak: (text, system) => this.speak(text, system),
			silence: text => this.silence(text)
		})
		
		wektor.speak('test', true)
		wektor.silence('test')
	},

	methods: {
		close() {
			this.text = null
		},

		onMouseDownOutside() {
			if (!this.timeout)
				this.close()
			else
				this.closeAfterTimeout = true
		},

		silence(text) {
			const hash = getHashCode(text)
			const index = this.systemBubbles.findIndex(bubble => bubble.hash === hash)
			this.systemBubbles.splice(index, 1)
			console.log(this.systemBubbles)
		},

		speak(text, system = false) {
			const hash = getHashCode(text)
			if (this.hashes.includes(hash)) return

			this.hashes.push(hash)
			const bubbleSpec = {
				text,
				system,
				hash,
			}

			if (system)
				this.systemBubbles.unshift(bubbleSpec)
			else 
				this.bubbles = [bubbleSpec]		

			// const hash = getHashCode(text)
			// if (this.hashes.includes(hash)) return

			// this.hashes.push(hash)	
			// this.text = text

			// clearTimeout(this.timeoutId)

			// this.closeAfterTimeout = false
			// this.timeout = true
			// this.timeoutId = setTimeout(() => { 
			// 	this.timeout = false
			// 	if (this.closeAfterTimeout)
			// 		this.close() 
			// }, this.closeDelay)	
		},
	},
}	
</script>