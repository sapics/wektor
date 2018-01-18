<template>
	<div 
		class="bezier"
		@mouseenter="hover = true"
		@mouseleave="hover = false"
		:style="css"
	>
		<canvas 
			class="canvas draghandler"
			ref="canvas"
			resize
		></canvas>	
		<div
			v-if="showTimePointer"
			class="timePointer"
			:style="{left: timePointerX + 'px'}"
			@mousedown="onPointerMouseDown"
		></div>
		<div
			class="value-dots"
			v-if="mode === 'multiple'"
		>	
		</div>
	</div>
</template>

<style lang="scss" scoped>
.bezier {
	position: relative; /* without this "overflow: hidden" won't hide canvas */
	width: 100%;
	height: 100%;

	.canvas {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
	}

	.timePointer {
		position: absolute;
		top: 0;
		width: 5px;
		box-sizing: border-box;
		border-left: 1px solid black;
		border-right: 1px solid black;
		height: 100%;
		background: white;
	}

	.value-dots {
		height: 1em;
	}
}
</style>

<script type="text/javascript">
import baseComponent from '../baseComponent'
import paper from 'paper'
import { getBounds, mapValue } from '@/utils'
import SinglePathSelectionTool from './SinglePathSelectionTool'

function subtract(point1, point2) {
	return {
		x: point1.x - point2.x,
		y: point1.y - point2.y
	}
}

function add(point1, point2) {
	return {
		x: point1.x + point2.x,
		y: point1.y + point2.y
	}
}

export default {
	extends: baseComponent,

	data() {
		return {
			// active: false,
			hover: false,
			time: 0,
			width: 0,
			height: 0,
			handleSize: 8,
		}
	},

	computed: {
		active() {
			// const activeDialogId = this.$store.state.active.dialog
			// return (this.dialogId === activeDialogId)
		},

		mode() {
			return this.payload.mode || 'single'
		},

		customCss() {
			return this.payload.css || {}
		},

		css() {
			return {
				width: '200px',
				height: '100px',
				overflow: (this.active) ? 'visible' : 'hidden',
				...this.customCss
			}
		},

		timePointerX() {
			return this.time * this.width
		},

		showTimePointer() {
			return this.mode === 'single'
		},

		canvasEnabled() {
			return this.active || this.hover
		}
	},

	watch: {
		// the order of the watchers is important!
		// we first have to reposition the timePointer so the time watcher can use it (in updateSingleValue)
		timePointerX(value) {
			this.timePointer.position.x = value
		},

		time(time) {
			// if (this.mode === 'single')
			// 	this.updateSingleValue()
		},		
	},

	created() {
		this.time = this.payload.time || this.time
	},
	
	mounted() {
		const scope = new paper.PaperScope()
		scope.setup(this.$refs.canvas)
		// scope.settings.handleSize = this.handleSize

		const { width, height, x, y } = this.$el.getBoundingClientRect()
		const { x: canvasX, y: canvasY } = this.$refs.canvas.getBoundingClientRect()
		const canvasOffset = {
			x: canvasX - x,
			y: canvasY - y			
		}

		const path = new paper.Path({
			segments: [
				subtract({ x: 0, y: height / 2 }, canvasOffset),
				subtract({ x: width, y: height / 2 }, canvasOffset)
			],
			strokeColor: 'red',
			strokeWidth: 5,
			selected: true
		})
		path.on('change', () => this.updateMultipleValue())	

		const timePointer = new paper.Path.Line({
			from: scope.view.bounds.topLeft,
			to: scope.view.bounds.bottomLeft,
			strokeWidth: 0,
		})

		const valueDots = new paper.Group()	

		Object.assign(this, { width, height, canvasOffset, path, timePointer, valueDots })
		new SinglePathSelectionTool(path)	
	},

	methods: {
		onPointerMouseDown(event) {
			event.stopPropagation()
			this.bindListeners()
		},

		bindListeners() {
			window.addEventListener('mousemove', this.onPointerChange)
			window.addEventListener('mouseup', this.unbindListeners)
		},

		unbindListeners(event) {
			event.stopPropagation()
			window.removeEventListener('mousemove', this.onPointerChange)
			window.removeEventListener('mouseup', this.unbindListeners)
		},

		onPointerChange(event) {
			const { left } = this.$el.getBoundingClientRect()
			this.time = (event.x - left) / this.width
		},	

		updateSingleValue() {
			const intersections = this.path.getIntersections(this.timePointer)
			if (!(intersections && intersections[0])) return
			const intersection = intersections[0].point
			const verticalValue = intersection.y
			const verticalFactor = this.verticalToFactor(verticalValue)
			this.$emit('input', verticalFactor)
		},

		updateMultipleValue() {
			let offset = 0
			const values = []
			const length = this.path.length

			this.valueDots.removeChildren()

			while (offset <= length) {
				const point = this.path.getPointAt(offset)
				const localPoint = add(point, this.canvasOffset)
				const verticalValue = localPoint.y
				const verticalFactor = Math.abs(this.verticalToFactor(verticalValue))
				values.push(verticalFactor)
				const valueDot = this.createValueDot()
				valueDot.position = {
					x: point.x,
					y: -this.canvasOffset.y,
				}
				this.valueDots.addChild(valueDot)
				const space = (verticalFactor * length)
				offset += (space < 1) ? 1 : space
			}

			this.$emit('input', values)		
		},

		createValueDot() {
			const valueDot = new paper.Path.Line({
				from: {x: 0, y: 0},
				to: {x: 0, y: this.height},
				strokeColor: 'black',					
			})	
			valueDot.pivot = valueDot.bounds.topLeft
			return valueDot		
		},

		verticalToFactor(verticalValue) {
			// swapping the min and max values will cause the verticalValue to be treated invertedly
			const rangeVertical = { min: this.height, max: 0 }
			const rangeFactor = { min: -1, max: 1 }
			return mapValue(verticalValue, rangeVertical, rangeFactor)
		},
	},
}
</script>