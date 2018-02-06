<template>
	<div class="wek-bubble">
		<span v-html="text"></span>
		<svg class="wek-bubble-pointer" viewBox="0 0 7 10">
			<path vector-effect="non-scaling-stroke" d="M0,0c0,0,2.3,6.6,7,10c0,0-1.9-7.1-0.8-10" />
		</svg>
	</div>
</template>

<style lang="scss">
.wek-bubble {
	background: white;
	border: 1px solid black;
	position: absolute;
	bottom: 0;
	right: 0;
	margin: 0 1em 260px;
	border-radius: 2em;
	padding: 1em;
	min-width: 2em;

	.wek-bubble-pointer {
		position: absolute;
		width: auto;
		height: 20px;
		bottom: -20px;
		left: 2em;
		fill: white;
		stroke: black;
	}
}	
</style>

<style lang="scss">
.wek-bubble {
	visibility: hidden;
}	
</style>

<script>
import Wek from '@/wek'
import wektor from '@/wektor'
import paper from 'paper'

export default {
	created() {
		const wek = new Wek()
		wektor.wek = wek
		wek.pivot = wek.bounds.bottomRight
		const margin = 20

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
	},

	data() {
		return {
			text: 'Vordiplom "Wektor"<br>15.02.2018 14:00 Uhr<br>Glaskubus',
		}
	},

	methods: {
		speak(text) {
			this.text = text
			this.$el.style.visibility = 'visible'
		},
	},
}	
</script>