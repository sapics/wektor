<template>
	<div class="dialog-wrap">
		<pointer-line
			v-if="this.referenceEl"
			v-visible="showPointerLine"
			:style="{zIndex}"
			:from="position"
			:to="referencePoint"
		></pointer-line>
		<div 
			class="dialog"
			ref="dialog"
			:style="css"
			v-outside:mousedown="{callback: close, enabled: !locked}"
			:data-id="id"
			:data-parent-id="parentId"
			@mousedown="onMouseDown"
			@mouseup="endDrag"
			@mouseenter="hover = true"
			@mouseleave="hover = false"
		>
			<div 
				class="lock"
				:class="{locked}"
				@click="locked = !locked"
			></div>
			<palette
				:values="values"
				:layout="layout"
				:id="id"
			>
			</palette>
		</div>	
	</div>
</template>

<style lang="scss">
@import "../../sass/variables";

.dialog-wrap {
	.dialog {
		position: absolute;
		background: white;
		border: 1px solid black;
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
}
</style>

<script>
import { mapGetters, mapMutations } from 'vuex'
import palette from './palette'
import pointerLine from './components/pointer-line'
import settings from '@/settings.js'
import paper from 'paper'
import { getBounds, elementsOverlap } from '@/utils'

const { Path, Point } = paper

export default {
	// extends: palette,

	props: {
		id: String,
		values: Object,
		layout: Object,
		payload: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},

	components: { pointerLine, palette },

	data() {
		return {
			dragDelta: {},
			delta: {},
			hover: false,
			referenceHover: false,
			referenceEl: null,
			parentDialogEl: null,
			drag: false,
			focus: false,
		}
	},

	computed: {
		...mapGetters([
			'dialogs', 
			'lockedDialogs',			
			'getDialog',  
			'dialogIsOpen',
		]),

		css() {
			return {
				zIndex: this.zIndex,
				top: this.position.y + 'px',
				left: this.position.x + 'px',
				width: this.payload.width,
				height: this.payload.height,
				padding: this.payload.padding || '0.5em'
			}
		},

		parentId() {
			return this.payload.parentId
		},

		showPointerLine() {
			if (this.locked && !(this.hover || this.referenceHover)) return false
			if (this.parentId === undefined) return true
			return this.dialogIsOpen(this.parentId)
		},

		parentDialog() {
			return this.getDialog(this.parentId)
		},

		referencePoint() {
			if (this.parentDialog) {
				const parentPos = this.parentDialog.position
				const delta = this.delta
				return {
					x: parentPos.x + delta.x,
					y: parentPos.y + delta.y
				}				
			} else if (this.referenceEl) {
				const bounds = getBounds(this.referenceEl)
				return {
					x: bounds.center.x,
					y: bounds.center.y
				}
			}
		},

		position: {
			get() {
				return this.$store.state.dialogs[this.id].position || {}
			},
			set(value) {
				this.$store.commit('modifyDialog', {
					id: this.id,
					key: 'position',
					value,
				})
			}
		},

		locked: {
			get() {
				return this.$store.state.dialogs[this.id].locked || false
			},
			set (value) {
				this.$store.commit('modifyDialog', {
					id: this.id,
					key: 'locked',
					value,
				})				
			}
		},

		globalDrag: {
			get() {
				return this.$store.state.drag
			},
			set(value) {
				this.$store.commit('setDrag', value)
			}
		},

		active() {
			const activeDialog = this.$store.state.active.dialog
			return (activeDialog && this.id.toString() === activeDialog.id.toString())
		},

		zIndex() {
			return this.active ? 1 : 'auto'
		},
	},

	watch: {
		hover(hover) {
			if (!hover) return

			if (!this.parentDialogEl) return

			if (elementsOverlap(this.$refs.dialog, this.parentDialogEl)) {
				this.focus = true
			} else {
				this.focus = false
			}
		},

		'parentDialog.open': function(open) {
			if (open) {
				// wait for next tick so the parentDialog's children are ready
				this.$nextTick(() => {
					this.referenceEl = this.getReferenceEl(this.payload.referenceId)
				})
			} else {
				this.releaseReferenceEl(this.referenceEl)
				this.referenceEl = null
			}
		},

		referenceEl(el) {
			el && this.initReferenceEl(el)
		},
	},

	created() {
		this.referenceEl = this.payload.referenceId 
			? this.getReferenceEl(this.payload.referenceId)
			: this.payload.referenceEl

		this.parentDialogEl = document.querySelector(`[data-id="${this.parentId}"]`)
	},

	mounted() {
		this.align()
	},

	methods: {
		...mapMutations([
			'openDialog', 
			'closeDialog',
			'activateDialog', 
			'modifyDialog',
		]),

		getReferenceEl(id) {
			const parentDialogEl = document.querySelector(`[data-id="${this.parentId}"]`)
			const referenceEl = parentDialogEl && parentDialogEl.querySelector(`[data-id="${id}"]`)
			console.log('id', `[data-id="${id}"]`)
			return referenceEl			
		},

		initReferenceEl(el) {
			if (!el) console.warn('no reference element specified')

			if (el && el.addEventListener) {
				el.addEventListener('mouseenter', () => { this.referenceHover = true })
				el.addEventListener('mouseleave', () => { this.referenceHover = false })	
			}
		},

		releaseReferenceEl(el) {
			if (el && el.removeEventListener) {
				el.removeEventListener('mouseenter', () => { this.referenceHover = true })
				el.removeEventListener('mouseleave', () => { this.referenceHover = false })					
			}
		},

		align() {
			if (!this.referenceEl) {
				this.position = { x: 0, y: 0 }
				return
			}

			const bounds = getBounds(this.referenceEl)

			this.position = {
				x: bounds.topRight.x + settings.dialog.margin.x,
				y: bounds.topRight.y + settings.dialog.margin.y
			}

			if (this.parentDialog) {
				this.delta = {
					x: bounds.center.x - this.parentDialog.position.x,
					y: bounds.center.y - this.parentDialog.position.y,
				}
			}		
		},

		onMouseDown(event) {
			this.startDrag(event)
			this.activateDialog(this.id)
		},

		onDrag(event) {
			event.preventDefault()
			this.position = { 
				x: event.x - this.dragDelta.x,
				y: event.y - this.dragDelta.y 
			}
		},

		startDrag(event) {
			this.drag = this.globalDrag = true
			const el = this.$refs.dialog
			const {top, left} = el.getBoundingClientRect()
			this.dragDelta = {
				x: event.x - left,
				y: event.y - top
			}
			document.addEventListener('mousemove', this.onDrag)		
		},

		endDrag(event) {
			this.drag = this.globalDrag = false
			this.$store.commit('setDrag', false)
			document.removeEventListener('mousemove', this.onDrag)	
		},

		close(event) {
			if (this.targetIsChild(event.target)) return
			this.closeDialog(this.id)
		},

		targetIsChild(target) {
			const dialog = target.closest('.dialog')

			if (!dialog) return false

			const parentId = dialog.dataset.parentId
			return (parentId === this.id)
		}
	},
}
</script>