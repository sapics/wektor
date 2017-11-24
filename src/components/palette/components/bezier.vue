<template>
	<canvas ref="canvas" style="background-color: aqua; width: 200px; height: 100px;"></canvas>
</template>

<script type="text/javascript">
import paper from 'paper'

export default {
	data() {
		return {
			path: null,
			scope: null,
		}
	},

	mounted() {
		const scope = this.scope = new paper.PaperScope()
		scope.setup(this.$refs.canvas)

		// selection.init(scope.project)
		// new scope.Tool(selection)

		new scope.Path({
			segments: [
				scope.view.bounds.topLeft,
				scope.view.bounds.bottomRight
			],
			strokeColor: 'red',
			strokeWidth: 100,
		})
	},
}
</script>