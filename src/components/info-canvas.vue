<template>
	<canvas id="info-canvas"></canvas>
</template>

<style lang="scss">
#info-canvas {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
}	
</style>

<script>
import wektor from '@/wektor'

export default {
	data() {
		return {
			lines: {},
			ctx: null,
		}
	},

	mounted() {
		const canvas = this.$el
		this.resize()
		this.ctx = canvas.getContext('2d')

		wektor.on('setPointerLine', (id, from, to) => {
			this.lines[id] = { from, to }
			this.redraw()
		})
		wektor.on('deletePointerLine', id => {
			delete this.lines[id]
			this.redraw()
		})
	},

	methods: {
		resize() {
			const canvas = this.$el
			canvas.width = canvas.offsetWidth
			canvas.height = canvas.offsetHeight			
		},

		redraw() {
			this.clear()
			for (const [id, line] of Object.entries(this.lines)) {
				this.drawLine(line)
			}
		},

		drawLine({from, to}) {
			const ctx = this.ctx
			ctx.beginPath()
			ctx.moveTo(0, 0)
			ctx.lineTo(600, 600)			
			ctx.moveTo(from.x, from.y)
			ctx.lineTo(to.x, to.y)
			ctx.strokeStyle = "black"
			ctx.stroke()			
		},

		clear() {
			const canvas = this.$el
			this.ctx.clearRect(0, 0, canvas.width, canvas.height)
		}		
	},
}	
</script>