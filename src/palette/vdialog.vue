<template>
	<div class="dialog-wrap">
		<pointer-line
			v-if="referencePoint && pointerCorner"
			v-visible="showPointerLine"
			ref="pointerLine"
			class="pointer-line"
			:from="pointerCorner"
			:to="referencePoint"
		></pointer-line>		
		<div
			v-visible="rendered"
			class="dialog draghandler"
			:class="{ fitContent }"
			ref="dialog"
			:data-id="id"
			:data-parent-id="parentId"
			:data-root-id="rootId"
			:data-nested-index="nestedIndex"
			:style="css"
			@mousedown="onMouseDown"
			@mouseenter="hover = true"
			@mouseleave="hover = false"		
			v-outside:mousedown="onMouseDownOutside"
		>
			<!-- <div class="wire-frame"></div>
 -->		<div 
				class="dialog-sidebar draghandler"
			>
				<div 
					ref="lockClose"
					class="dialog-lock-close draghandler"
					:class="{ locked }"
					@mouseup="!drag && handleLockClose()"
				></div>	
				<svg 
					class="resize-corner" viewBox="0 0 7 7"
					@mousedown.stop.prevent="startResize"
				>
					<line x1="0" y1="7" x2="7" y2="0" />
					<line x1="4" y1="7" x2="7" y2="4" />
				</svg>
			</div>
			<palette
				class="palette draghandler"
				:values="values"
				:layout="layout"
				:dialogId="id"
				:id="id"
			></palette>								
		</div>
	</div>
</template>

<style lang="scss">
@import "../sass/variables";

.dialog-wrap {
	.pointer-line {
		z-index: 999999;
	}

	.dialog {
		position: absolute;
		isolation: isolate;
		background: white;
		border: 1px solid black;
		box-sizing: border-box;
		white-space:nowrap;

		&.fitContent .palette {
			width: 100%;
			height: 100%;
		}
	}

	.dialog-sidebar {
		z-index: 1;
		width: 0.8em;
		height: 100%;
		box-sizing: border-box;
		padding: 0.2em;
		padding-left: 0;		
		position: absolute;
		top: 0;
		right: 0;
		cursor: grab;
	}

	.dialog-lock-close {
		@include bullet();
		border: 1px solid var(--wektor-dialog-border-color);
		background: white;
		cursor: pointer;
	}

	.dialog-lock-close.locked {
		background: var(--wektor-dialog-border-color);
	}

	.resize-corner {
		cursor: default;
		position: absolute;
		right: 1px;
		bottom: 1px;
		width: 7px;
		height: 7px;
		stroke: var(--wektor-dialog-border-color);
	}

	// .wire-frame {
	// 	z-index: 999999;
	// 	width: calc(100% + 2px);
	// 	height: calc(100% + 2px);
	// 	margin: -1px;
	// 	top: 0;
	// 	left: 0;
	// 	box-sizing: border-box;
	// 	pointer-events: none;
	// 	position: absolute;
	// 	border: 1px solid black;
	// }	
}
</style>

<script>
import wektor from '@/wektor'
import draggable from '@/mixins/draggable'
import palette from './palette'
import pointerLine from './components/pointer-line'
import resizeable from '@/mixins/resizeable'
import { 
	isNumber, 
	isFunction, 
	isInViewport, 
	getBounds, 
	getDistance, 
	toCssPercent, 
	pointToCssPercent, 
	constrainElPosition,
} from '@/utils'

export default {
	name: 'vdialog',

	mixins: [ draggable, resizeable ],
	
	components: { pointerLine, palette },

	props: {
		spec: {
			type: Object,
			default: () => Object()
		},
	},

	data() {
		return {
			rendered: false,
			position: null,
			referencePoint: null,
			pointerCornerDelta: { x: 0, y: 0 },
			locked: false,
			hover: false,
			resizeEl: null, // see mounted()
			width: 100,
			height: 100,
		}
	},

	computed: {
		id () { 
			return this.spec.id
		},

		parentId() {
			return this.spec.parentId
		},

		rootId() {
			return this.spec.rootId
		},

		nestedIndex() {
			return this.spec.nestedIndex
		},		

		bridge() {
			return this.spec.bridge || {}
		},

		values() {
			return this.bridge.values || this.spec.values
		},		

		layout() { 
			return this.spec.layout || {}
		},

		payload() {
			return this.spec.payload || {}
		},

		reference() {
			return this.spec.reference || {}
		},

		fitContent() {
			return this.payload.fitContent
		},

		customCss() {
			return this.payload.css || {}
		},

		hasCustomPosition() {
			return (
				this.customCss.top ||
				this.customCss.left ||
				this.customCss.bottom ||
				this.customCss.right
			)
		},

		css() {
			return {
				zIndex: this.zIndex,
				padding: '0.8em',
				...this.customCss,	
				...this.cssPosition,			
			}
		},

		positionPercent() {
			if (this.position) {
				return pointToCssPercent(this.position)
			}
		},

		cssPosition() {
			if (this.positionPercent) {
				return {
					top: this.positionPercent.y + '%',
					left: this.positionPercent.x + '%',
					right: 'auto',
					bottom: 'auto',
				}
			} else if (!this.hasCustomPosition) {
				return {
					top: 0,
					left: 0
				}
			}
		},

		showPointerLine() {
			if (this.drag || this.hover || this.reference.hover) return true
			return !this.locked 
		},

		zIndex() {
			const stackingIndex = this.spec.stackingIndex
			return this.spec.stackingIndex
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

		hover(hover) {
			if (hover) {
				this.updateBridge()
				this.updatePointerCorner(true)
			}
		},

		position() {
			this.updatePointerCorner()
		}
	},

	created() {
		this.activate()
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
		wektor.on('resize', () => {
			this.updateReference()
			this.updatePointerCorner()
			
			const bounds = this.$refs.dialog.getBoundingClientRect()
			const windowSize = {
				width: window.innerWidth || document.documentElement.clientWidth,
				height: window.innerHeight || document.documentElement.clientHeight,
			}			
			this.position = constrainElPosition(windowSize, bounds, { x: bounds.x, y: bounds.y })

			const pointerLine = this.$refs.pointerLine		
			if (pointerLine) {
				pointerLine.resize()
				pointerLine.redraw()
			}
		})

		this.$on('resize', () => wektor.emit('resizeDialog', { id: this.id }))	
		this.$on('endResize', () => wektor.emit('resizeDialog', { id: this.id }))
	},

	mounted() {
		this.resizeEl = this.$refs.dialog

		this.$nextTick(() => {
			this.setPosition()
			const bounds = this.$refs.dialog.getBoundingClientRect()
			this.width = bounds.width
			this.height = bounds.height
			this.updatePointerCorner()
			this.rendered = true
		})
	},

	methods: {
		activate() {
			wektor.activateDialog(this.id)
		},

		updateBridge() {
			this.bridge.update && this.bridge.update()
		},

		updatePointerCorner(checkVisibility = false) {
			const { position, width, height, reference } = this
			const el = this.$refs.dialog

			if (!(position && reference && reference.position)) return

			const bounds = {
				top: position.y,
				left: position.x,
				bottom: position.y + height,
				right: position.x + width,
				topLeft: { x: position.x, y: position.y },
				topRight: { x: position.x + width, y: position.y },
				bottomLeft: { x: position.x, y: position.y + height },
				bottomRight: { x: position.x + width, y: position.y + height },
			}

			let corner
			let corners = []

			// pointerLines from top-corners just look better so we'll bias them by defining the 
			// dialogs vertical position as below even if it really is in between
			const topBias = 20 // px
			const isAbove = (bounds.bottom + topBias) < reference.position.y
			const isBelow = (bounds.top - topBias) > reference.position.y
			const isLeft = (bounds.right < reference.position.x)
			const isRight = (bounds.left > reference.position.x)

			if (isAbove) {
				if (isRight) {
					corner = bounds.bottomLeft
					corners = [corner, bounds.topLeft, bounds.bottomRight]
				} else if (isLeft) {
					corner = bounds.bottomRight
					corners = [corner, bounds.topRight, bounds.bottomLeft]
				} else {
					corners = [bounds.bottomLeft, bounds.bottomRight]
				}
			} else if (isBelow) {
				if (isRight) {
					corner = bounds.topLeft
					corners = [corner, bounds.topRight, bounds.bottomLeft]
				} else if (isLeft) {
					corner = bounds.topRight
					corners = [corner, bounds.topLeft, bounds.bottomRight]
				} else {
					corners = [bounds.topLeft, bounds.topRight]
				}
			} else {
				if (isRight) {
					corner = bounds.topLeft
					corners = [corner, bounds.bottomLeft]
				} else if (isLeft) {
					corner = bounds.topRight
					corners = [corner, bounds.bottomRight]
				}
				// else: dialog overlays reference, no pointerline possible			
			}

			if (checkVisibility) {
				for (let i = 0; i < corners.length; i++) {
					const point = corners[i]
					const topMostEl = document.elementFromPoint(point.x, point.y)
					if (el === topMostEl) {
						corner = point
						break
					}
				}
			} 

			if (!corner) {
				const distances = corners.map(corner => getDistance(corner, reference.position))
				const nearestCorner = corners[ distances.indexOf(Math.min(...distances)) ]
				corner = nearestCorner
			}

			if (!corner) return

			this.pointerCornerDelta = {
				x: position.x - corner.x,
				y: position.y - corner.y
			}		
		},

		updatePointerCornerOLD(checkVisibility = false) {
			const { position, width, height, reference } = this

			if (!(position && reference && reference.position)) return

			const corners = [
				{ x: position.x, y: position.y },
				{ x: position.x + width, y: position.y },
				{ x: position.x, y: position.y + height },
				{ x: position.x + width, y: position.y + height },				
			]

			const distances = corners.map(corner => getDistance(corner, reference.position))
			const nearestCorner = corners[ distances.indexOf(Math.min(...distances)) ]
			
			this.pointerCornerDelta = {
				x: position.x - nearestCorner.x,
				y: position.y - nearestCorner.y
			}					
		},

		updatePointerCornerOLDOLD() {
			const el = this.$refs.dialog
			const referencePoint = this.reference.position
			const position = this.position

			if (!referencePoint) return

			function checkCorner(vertical, horizontal, point, treshold = 0) {
				// const topMostEl = document.elementFromPoint(point.x, point.y)
				// if (topMostEl !== el) return

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
			
			if (!corner) return { x: 0, y: 0 }

			const delta = {
				x: position.x - corner.x,
				y: position.y - corner.y
			}

			this.pointerCornerDelta = delta
		},		

		updateReference() {
			const reference = this.reference
			this.referencePoint = reference.position
			if (reference && isFunction(reference.update)) 
				this.$nextTick(() => reference.update())
		},

		setPosition() {
			const reference = this.reference
			const el = this.$refs.dialog

			if (!(reference && reference.bounds)) {
				const bounds = el.getBoundingClientRect()
				this.position = { x: bounds.x, y: bounds.y }
				return
			}

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
					position = point
					break
				}
			}

			this.position = position		
		},

		handleLockClose() {
			if (this.locked)
				this.close()
			else
				this.locked = true
		},

		onMouseDown(event) {
			this.activate()
			if (this.isDragHandle(event.target))
				this.startDrag(event)
		},

		onMouseUp(event) {
			this.updatePointerCorner()
			this.endDrag()
		},

		onMouseDownOutside(event) {
			if (!this.locked) this.close(event)
		},	

		isDragHandle(el) {
			const classList = el.classList
			return classList.contains('draghandler')
		},

		close(event) {
			if (event && this.targetIsDescendant(event.target)) return
			wektor.closeDialog(this.id)
		},

		targetIsDescendant(target) {
			const dialog = target.closest('.dialog')

			if (!dialog) return false

			const rootId = dialog.dataset.rootId
			const nestedIndex = dialog.dataset.nestedIndex

			if (rootId !== this.rootId) {
				console.log('no same root', rootId, this.rootId, this.id)
				return
			}

			return (nestedIndex > this.nestedIndex)
		}			
	}

}
</script>