<template>
	<canvas ref="canvas"></canvas>
</template>

<style lang="scss" scoped>
canvas {
	mix-blend-mode: difference;
	position: absolute;
	pointer-events: none;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}	
</style>

<script>
export default {
	props: ['from', 'to'],

	data() {
		return {
			ctx: null,
		}
	},

	watch: {
		from() {
			this.redraw()
		},
		to() {
			this.redraw()
		}
	},

	mounted() {
		this.initCanvas()
		this.draw()
	},

	methods: {
		initCanvas() {
			const canvas = this.$refs.canvas
			canvas.width = canvas.offsetWidth
			canvas.height = canvas.offsetHeight
			this.ctx = canvas.getContext('2d')	
		},

		draw() {
			const { ctx, from, to } = this

			ctx.beginPath()
			ctx.moveTo(from.x, from.y)
			ctx.lineTo(to.x, to.y)
			ctx.strokeStyle = "#ffffff"
			ctx.stroke()
		},

		redraw() {
			this.clear()
			this.draw()
		},		

		clear() {
			const canvas = this.$refs.canvas
			this.ctx.clearRect(0, 0, canvas.width, canvas.height)
		}		
	},
}
</script>