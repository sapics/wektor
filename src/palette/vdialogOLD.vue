<template>
	<div class="dialog-wrap">
		<pointer-line
			v-if="referencePoint && pointerCorner"
			v-visible="showPointerLine"
			class="pointer-line"
			:style="{zIndex}"
			:from="pointerCorner"
			:to="referencePoint"
		></pointer-line>		
		<div
			class="dialog draghandler"
			:class="{ fitContent }"
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
			<div 
				class="dialog-sidebar draghandler"
			>
				<div 
					ref="lock"
					class="dialog-lock draghandler"
					:class="{ locked }"
					@mouseup="!drag && (locked = !locked)"
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
	.dialog {
		position: absolute;
		isolation: isolate;
		background: white;
		border: 1px solid black;
		box-sizing: border-box;

		&.fitContent .palette {
			width: 100%;
			height: 100%;
		}
	}

	// .active.dialog .dialog-sidebar {
	// 	z-index: 1;
	// }

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

	.dialog-lock {
		@include bullet();
		border: 1px solid var(--wektor-dialog-border-color);
		background: white;
		cursor: pointer;
	}

	.dialog-lock.locked {
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
		spec: {
			type: Object,
			default: () => Object()
		},
	},

	data() {
		return {
			position: { x: 0, y: 0 },
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
		id () { return this.spec.id },
		parentId() { return this.spec.parentId },
		bridge() { return this.spec.bridge || {} },
		layout() { return this.spec.layout || {} },
		payload() { return this.spec.payload || {} },
		reference() { return this.spec.reference || {} },

		values() {
			return this.bridge.values || this.spec.values
		},

		customCss() {
			return this.payload.css || {}
		},

		fitContent() {
			return this.payload.fitContent
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

		showPointerLine() {
			if (this.drag || this.hover || this.reference.hover) return true
			return !this.locked 
		},

		showWireFrame() {
			return this.hover
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
			if (hover) this.updateBridge()
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

		this.$on('resize', () => wektor.emit('resizeDialog', { id: this.id }))	
		this.$on('endResize', () => wektor.emit('resizeDialog', { id: this.id }))
	},

	mounted() {
		this.resizeEl = this.$refs.dialog
		this.setPosition()
		this.$nextTick(() => {
			const bounds = this.$refs.dialog.getBoundingClientRect()
			this.width = bounds.width
			this.height = bounds.height
			this.updatePointerCorner()
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

			if (!(reference && reference.position)) return

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

		updatePointerCornerOLD() {
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
					position = point
					break
				}
			}

			this.position = position
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