<template>
	<div class="dialog-wrap">
		<pointer-line
			v-if="referencePoint && pointerCorner"
			v-visible="showPointerLine"
			class="pointer-line"
			:style="{zIndex: locked ? '3' : 'auto'}"
			:from="pointerCorner"
			:to="referencePoint"
		></pointer-line>		
		<div
			class="dialog draghandler"
			ref="dialog"
			:data-id="id"
			:data-parent-id="parentId"
			:style="css"
			@mousedown="onMouseDown"
			@mouseup="onMouseUp"
			@mouseenter="hover = true"
			@mouseleave="hover = false"		
			v-outside:mousedown="onMouseDownOutside"
		>
			<palette
				class="draghandler"
				:values="values"
				:layout="layout"
				:dialogId="id"
			></palette>	
			<div 
				class="lock"
				:class="{locked}"
				@click="locked = !locked"
			></div>	
			<div v-if="this.payload.resize"
				class="resize-corner"
				@mousedown.stop.prevent="startResize"
			></div>					
		</div>
	</div>
</template>

<style lang="scss">
@import "../sass/variables";

.dialog-wrap {
	.dialog {
		position: absolute;
		background: white;
		border: 1px solid black;
		box-sizing: border-box;
	}

	.lock {
		position: absolute;
		box-sizing: border-box;
		width: 0.6em;
		height: 0.6em;
		margin: 0.2em;
		right: 0;
		top: 0;
		border-radius: 50%;
		border: 1px solid black;
		cursor: pointer;
	}

	.lock.locked {
		background-color: black;
	}

	.resize-corner {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 9px;
		height: 9px;
		background-image: url('/static/icons/resize-corner.gif');
	}

	.wire-frame {
		z-index: 3;
		width: calc(100% + 2px);
		height: calc(100% + 2px);
		margin: -1px;
		top: 0;
		left: 0;
		box-sizing: border-box;
		pointer-events: none;
		position: absolute;
		border: 1px solid black;
	}	
}
</style>

<script>
import wektor from '@/wektor'
import draggable from '@/mixins/draggable'
import palette from './palette'
import pointerLine from './components/pointer-line'
import resizeable from '@/mixins/resizeable'
import { isFunction, isInViewport, getBounds, getDistance } from '@/utils'

export default {
	name: 'vdialog',

	mixins: [ draggable, resizeable ],
	
	components: { pointerLine, palette },

	props: {
		id: String,
		parentId: String,
		values: null,
		layout: Object,
		reference: {
			type: Object,
			default: () => { return {} }
		},
		payload: {
			type: Object,
			default: () => { return {} }
		}
	},

	data() {
		return {
			position: { x: 0, y: 0 },
			referencePoint: null,
			pointerCornerDelta: null,
			locked: false,
			hover: false,
			resizeEl: null, // see mounted()
		}
	},

	computed: {
		customCss() {
			return this.payload.css || {}
		},

		css() {
			return {
				zIndex: this.zIndex,
				top: this.position.y + 'px',
				left: this.position.x + 'px',
				padding: '0.8em',
				...this.customCss				
			}
		},

		active: {
			set(value) {
				if (value)
					this.$store.commit('activateDialog', this.id)
				else
					this.$store.commit('deactivateDialog', this.id)
			},
			get() {
				const activeDialogId = this.$store.state.active.dialog
				return (this.id === activeDialogId)
			}
		},

		showPointerLine() {
			if (this.drag || this.hover || this.reference.hover) return true
			return !this.locked 
		},

		showWireFrame() {
			return this.hover
		},

		zIndex() {
			return this.active ? 1 : 'auto'
		},	

		pointerCorner() {
			const { position, pointerCornerDelta } = this
			if (!position || !pointerCornerDelta) return
			return {
				x: this.position.x - pointerCornerDelta.x,
				y: this.position.y - pointerCornerDelta.y
			}
		}
	},

	watch: {
		showPointerLine(show) {
			if (!show) return
			
			this.referencePoint = this.reference.position
			this.updatePointerCorner()
		},
	},

	created() {
		this.active = true
		this.referencePoint = this.reference.position
		this.locked = this.payload.locked || this.locked
		wektor.on('openDialog', dialog => {
			if (dialog.id === this.parentId) {
				this.updateReference()
			}
		})
		wektor.on('closeDialog', dialog => {
			if (dialog.id === this.parentId) {
				this.updateReference()
			}
		})		
	},

	mounted() {
		this.resizeEl = this.$refs.dialog
		this.setPosition()
		this.$nextTick(() => {
			this.updatePointerCorner()
		})
	},

	methods: {
		updatePointerCorner() {
			// get the closest non-covered corner
			const el = this.$refs.dialog
			const referencePoint = this.reference.position
			const position = this.position

			if (!referencePoint) return

			function checkCorner(vertical, horizontal, point, treshold = 0) {
				const topMostEl = document.elementFromPoint(point.x, point.y)
				if (topMostEl !== el) return

				if (vertical === 'top' && point.y > referencePoint.y + treshold) return true
				if (vertical === 'bottom' && point.y < referencePoint.y - treshold) return true

				if (horizontal === 'left' && point.x > referencePoint.x + treshold) return true
				if (horizontal === 'right' && point.x < referencePoint.x - treshold) return true

				return false
			}

			const bounds = getBounds(el)
			let corner

			if (checkCorner('top', 'left', bounds.topLeft))
				corner = bounds.topLeft
			else if (checkCorner('top', 'right', bounds.topRight))
				corner = bounds.topRight
			else if (checkCorner('bottom', 'left', bounds.bottomLeft))
				corner = bounds.bottomLeft
			else if (checkCorner('bottom', 'right', bounds.bottomRight))
				corner = bounds.bottomRight

			// [bounds.topLeft, bounds.topRight, bounds.bottomLeft, bounds.bottomRight]

			// let possible = false
			// if (bounds.topLeft.y > referencePoint.y)
			// 	possibleCorners.push(bounds.topLeft)
			// else if (bounds.topLeft.x > referencePoint.x)

			// const bounds = getBounds(el)
			// const cornerNames = [ 'topLeft', 'topRight', 'bottomLeft', 'bottomRight' ]
			// let minDistance = null
			// const visibleCorners = []
			// for (let i = 0; i < cornerNames.length; i++) {
			// 	const priority = i
			// 	const cornerName = cornerNames[i]
			// 	const corner = bounds[cornerName]
			// 	const topMostEl = document.elementFromPoint(corner.x, corner.y)
			// 	const distance = getDistance(corner, referencePoint)
			// 	if (topMostEl === el) {
			// 		visibleCorners.push({ type: cornerName, point: corner, distance, priority })
			// 		if (minDistance === null || distance < minDistance) {
			// 			minDistance = distance
			// 		}
			// 	}
			// }

			// const possibleCorners = visibleCorners.filter(corner => {

			// })

			// const possibleCorners = visibleCorners.filter(corner => corner.distance <= minDistance + (bounds.height - 1))

			// const corner = possibleCorners.reduce((prev, current) => prev.priority < current.priority ? prev : current)
			
			if (!corner) {
				console.log('no corner')
				return { x: 0, y: 0 }
			}

			const delta = {
				x: position.x - corner.x,
				y: position.y - corner.y
			}

			this.pointerCornerDelta = delta
		},

		updateReference() {
			const reference = this.reference
			if (reference && isFunction(reference.update)) 
				this.$nextTick(() => reference.update())
		},

		setPosition() {
			const { payload, reference } = this

			if (payload.position) {
				this.position = payload.position
				return
			} 
			if (!reference.bounds) {
				this.position = { x: 0, y: 0 }
				return
			} 

			const el = this.$refs.dialog
			const { width, height } = el.getBoundingClientRect()
			const { topRight, topCenter, topLeft, bottomLeft } = reference.bounds
			const margin = this.$settings.dialog.margin

			const points = [
				{
					x: topRight.x + margin,
					y: topRight.y,
				},			
				{
					x: topRight.x + margin,
					y: topRight.y - height,
				},				
				{
					x: topLeft.x - width - margin,
					y: topLeft.y
				},
				{
					x: topCenter.x - (width / 2),
					y: topCenter.y - height - margin,
				},				
				{
					x: bottomLeft.x,
					y: bottomLeft.y + margin
				}
			]

			let position
			for (let i = 0; i < points.length; i++) {
				const point = points[i]
				const bounds = {
					top: point.y,
					left: point.x,
					bottom: point.y + height,
					right: point.x + width,

				}
				if (isInViewport(bounds)) {
					console.log(i)
					position = point
					break
				}
			}

			this.position = position
		},

		onMouseDown(event) {
			this.active = true
			if (this.isDragHandle(event.target))
				this.startDrag(event)
		},

		onMouseUp(event) {
			this.updatePointerCorner()
			this.endDrag()
		},

		onMouseDownOutside(event) {
			this.active = false
			if (!this.locked) this.close(event)
		},	

		isDragHandle(el) {
			const classList = el.classList
			return classList.contains('draghandler')
		},

		close(event) {
			if (this.targetIsChild(event.target)) return
			wektor.closeDialog(this.id)
		},

		targetIsChild(target) {
			const dialog = target.closest('.dialog')

			if (!dialog) return false

			const parentId = dialog.dataset.parentId
			return (parentId === this.id)
		}			
	}

}	
</script>