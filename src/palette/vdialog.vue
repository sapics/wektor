<template>
	<div class="dialog-wrap">
		<pointer-line v-if="reference && showPointerLine"
			class="pointer-line"
			:from="pointerCorner"
			:to="reference.position"
		></pointer-line>
		<div class="dialog draghandle"
			:class="{ 'systemDialog': spec.system || spec.layout.system }"
			ref="dialog"
			:id="spec.id"
			:style="css"
			:data-id="spec.id"
			:data-parent-id="spec.parentId"
			:data-root-id="spec.rootId"
			:data-nested-index="spec.nestedIndex"			
			@mousedown="onMouseDown"
			@mouseenter="hover = true"
			@mouseleave="hover = false"				
			v-outside:mousedown="onMouseDownOutside"
		>
			<resize-observer @notify="onResizeObserved" />
			<palette
				class="dialog-content"
				:id="`${spec.id}-palette`"
				:dialogId="spec.id"
				:spec="{ values, layout, stretchContent: spec.stretchContent }"
				:style="{ padding: contentPadding }"
			></palette>		
			<div class="dialog-sidebar draghandle">
				<div class="dialog-lock-close"
					:class="{ locked }"
					@click="onLockClick"
				></div>
				<svg 
					v-if="spec.resize"
					class="resize-corner" 
					ref="resizeCorner"
					viewBox="0 0 7 7"
					@mousedown.stop.prevent="onResizeMouseDown"
				>
					<line x1="0" y1="7" x2="7" y2="0" />
					<line x1="4" y1="7" x2="7" y2="4" />
				</svg>				
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "../sass/variables";

.dialog-wrap {
	.pointer-line {
		z-index: 999999;
	}

	.dialog {
		position: absolute;
		isolation: isolate;
		box-sizing: border-box;
		white-space:nowrap;
		background: var(--wektor-dialog-background);
		border: 1px solid;
		border-color: var(--wektor-dialog-border-color);
		cursor: default;
	}

	.dialog-content {
		float: left;
		width: calc(100% - 1em);
		padding-right: 0!important;
		box-sizing: border-box;
	}

	.dialog-sidebar {
		float: left;
		box-sizing: border-box;	
		padding-top: 0.3em;
		padding-right: 0.3em;
		width: 1em;
		cursor: grab;

		.dialog-lock-close {
			@include bullet();
			border: 1px solid var(--wektor-dialog-border-color);
			background: white;
			cursor: pointer;
			&.locked {
				background: var(--wektor-dialog-border-color);
			}
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
	}
}	
</style>

<script>
import palette from './palette'
import draggable from '@/mixins/draggable'
import resizeable from '@/mixins/resizeable'
import pointerCorner from '@/mixins/pointerCorner'
import pointerLine from './components/pointer-line'
import wektor from '@/wektor'
import { isFunction, pointToCssPercent, isInViewport } from '@/utils'

export default {
	mixins: [ draggable, resizeable, pointerCorner ],

	components: { palette, pointerLine },

	props: {
		spec: {
			type: Object,
			default: () => Object()
		},
	},

	data() {
		return {
			position: null,
			width: null,
			height: null,
			locked: this.spec.locked,
			hover: true,
		}
	},

	computed: {
		values() {
			return this.spec.bridge
				? this.spec.bridge.values
				: this.spec.values
		},

		layout() {
			return this.spec.layout
		},

		reference() {
			return this.spec.reference
		},

		css() {
			return {
				zIndex: this.spec.stackingIndex,
				...this.spec.css,	
				...this.cssPosition,			
			}
		},

		hasCustomPosition() {
			const css = this.spec.css
			if (!css) return

			return (
				css.top ||
				css.left ||
				css.bottom ||
				css.right
			)
		},			

		cssPosition() {
			let cssPosition

			if (this.position) {
				const positionPercent = pointToCssPercent(this.position)
				cssPosition = {
					top: positionPercent.y + '%',
					left: positionPercent.x + '%',
					right: 'auto',
					bottom: 'auto',
				}
			} else if (!this.hasCustomPosition) {
				cssPosition = {
					top: 0,
					left: 0,	
				}			
			}

			return cssPosition
		},

		contentPadding() {
			return this.spec.padding !== undefined
				? this.spec.padding
				: '0.3em 0.5em'
		},

		showPointerLine() {
			if (this.drag || this.hover || this.reference.hover) return true
			return !this.locked 
		},			
	},

	watch: {
		hover(hover) {
			if (hover) {
				this.updateBridge()
				this.updateReference()				
				this.updatePointerCorner(true)
			}
		},

		'reference.hover'(hover) {
			if (hover) {
				this.updateReference()	
				this.updatePointerCorner(true)
			}
		},
	},

	created() {
		this.activate()

		wektor.on({
			openDialog: dialog => {
				if (dialog.id === this.spec.parentId) {
					// wait till the opened dialog is rendered
					this.$nextTick(() => this.updateReference())
				}				
			},
			closeDialog: dialog => {
				if (dialog.id === this.spec.parentId) {
					this.updateReference()
				}	
			},
			updateDialogBridge: dialog => {
				if (dialog.id == this.spec.id)
					this.updateBridge()
			}
		})		
	},

	mounted() {
		this.setPosition()
		const bounds = this.$refs.dialog.getBoundingClientRect()
		this.width = bounds.width
		this.height = bounds.height
		this.updatePointerCorner()	
	},

	methods: {
		activate() {
			wektor.activateDialog(this.spec.id)
			this.updatePointerCorner()
		},

		onResizeObserved() {
			const bounds = this.$refs.dialog.getBoundingClientRect()
			this.width = bounds.width
			this.height = bounds.height
			this.updatePointerCorner()
			wektor.emit('resizeDialog', { id: this.spec.id })	
			wektor.emit('resizeDialog', { id: this.spec.id })			
		},	

		onMouseDown(event) {
			this.activate()
			if (this.isDragHandle(event.target))
				this.startDrag(event, this.$refs.dialog)
		},

		onMouseDownOutside(event) {
			if (!this.locked) this.close(event)
		},		

		onLockClick(event) {
			if (this.locked)
				this.close()
			else
				this.locked = true
		},

		onResizeMouseDown(event) {
			this.startResize(event, this.$refs.dialog)
		},

		close(event) {
			if (event && this.targetIsDescendant(event.target)) return
			wektor.closeDialog(this.spec.id)
		},

		targetIsDescendant(target) {
			const dialog = target.closest('.dialog')

			if (!dialog) return false

			const rootId = dialog.dataset.rootId
			const nestedIndex = dialog.dataset.nestedIndex

			if (rootId !== this.spec.rootId)
				return

			return (nestedIndex > this.spec.nestedIndex)
		},			

		isDragHandle(el) {
			const classList = el.classList
			return classList.contains('draghandle')
		},

		updateBridge() {
			const bridge = this.spec.bridge
			bridge && bridge.update()
		},	

		updateReference() {
			const reference = this.reference
			reference && isFunction(reference.update) && reference.update()
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
	},
}	
</script>