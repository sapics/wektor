<template>
	<svg class="pointer-line">
		<line :x1="from.x" :y1="from.y" :x2="to.x" :y2="to.y"></line>
	</svg>
</template>

<style lang="scss">
.pointer-line {
	position: absolute;
	pointer-events: none;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	stroke-width: 1;
	stroke: white;
	mix-blend-mode: difference;
}	
</style>

<script type="text/javascript">
export default {
	props: {
		from: {
			type: Object,
			default: () => Object(),
		},
		to: {
			type: Object,
			default: () => Object(),
		},		
	},
}
</script>

<!-- <template>
	<canvas ref="canvas" class="pointer-line"></canvas>
</template>

<style lang="scss" scoped>
.pointer-line {
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
		const canvas = this.$refs.canvas
		this.resize()
		this.ctx = canvas.getContext('2d')
		this.draw()
	},

	methods: {
		resize() {
			const canvas = this.$refs.canvas
			canvas.width = canvas.offsetWidth
			canvas.height = canvas.offsetHeight			
		},

		draw() {
			const { ctx, from, to } = this
			if (!from || !to) return

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
</script> -->