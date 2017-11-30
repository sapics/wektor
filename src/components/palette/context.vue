<template>
	<div class="context-wrap">
		<pointer-line
			:style="{zIndex}"
			v-visible="showPointerLine"
			:from="position"
			:to="referencePoint"
		></pointer-line>
		<div 
			class="context"
			ref="context"
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
			<template v-for="(child, index) in children">
				<component 
					:is="child.component" 
					:data-id="child.key"
					v-model="child.value" 
					:key="child.key" 
					:id="child.key"
					:contextId="id"
					:label="child.label"
				></component>
			</template>
		</div>	
	</div>
</template>

<style lang="scss">
@import "../../sass/variables";

.context-wrap {
	.context {
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
	extends: palette,

	props: ['payload'],

	components: { pointerLine },

	data() {
		return {
			dragDelta: {},
			delta: {},
			hover: false,
			referenceHover: false,
			referenceEl: null,
			parentContextEl: null,
			drag: false,
			focus: false,
		}
	},

	computed: {
		...mapGetters([
			'contexts', 
			'lockedContexts',			
			'getContext',  
			'contextIsOpen',
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

		// referenceEl() {
		// 	return this.payload.referenceEl || {}
		// },

		parentId() {
			return this.payload.parentId
		},

		showPointerLine() {
			if (this.locked && !(this.hover || this.referenceHover)) return false
			if (this.parentId === undefined) return true
			return this.contextIsOpen(this.parentId)
		},

		parentContext() {
			const response = this.getContext(this.parentId)
			return this.getContext(this.parentId)
		},

		referencePoint() {
			if (this.parentContext) {
				const parentPos = this.parentContext.position
				const delta = this.delta
				return {
					x: parentPos.x + delta.x,
					y: parentPos.y + delta.y
				}				
			} else {
				const bounds = getBounds(this.referenceEl)
				return {
					x: bounds.center.x,
					y: bounds.center.y
				}
			}
		},

		position: {
			get() {
				return this.$store.state.contexts[this.id].position || {}
			},
			set(value) {
				this.$store.commit('modifyContext', {
					id: this.id,
					key: 'position',
					value,
				})
			}
		},

		locked: {
			get() {
				return this.$store.state.contexts[this.id].locked || false
			},
			set (value) {
				this.$store.commit('modifyContext', {
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
			const activeContext = this.$store.state.active.context
			return (activeContext && this.id.toString() === activeContext.id.toString())
		},

		zIndex() {
			return this.active ? 1 : 'auto'
		},
	},

	watch: {
		hover(hover) {
			if (!hover) return

			if (!this.parentContextEl) return

			if (elementsOverlap(this.$refs.context, this.parentContextEl)) {
				this.focus = true
			} else {
				this.focus = false
			}
		},

		'parentContext.open': function(open) {
			if (open) {
				this.referenceEl = this.getReferenceEl(this.payload.referenceId)
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

		this.parentContextEl = document.querySelector(`[data-id="${this.parentId}"]`)
	},

	mounted() {
		this.align()
		// if (this.referenceEl.addEventListener) {
		// 	this.referenceEl.addEventListener('mouseenter', () => { this.referenceHover = true })
		// 	this.referenceEl.addEventListener('mouseleave', () => { this.referenceHover = false })
		// }
	},

	methods: {
		...mapMutations([
			'openContext', 
			'closeContext',
			'activateContext', 
			'modifyContext',
		]),

		getReferenceEl(id) {
			const parentContextEl = document.querySelector(`[data-id="${this.parentId}"]`)
			const referenceEl = parentContextEl && parentContextEl.querySelector(`[data-id="${id}"]`)
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
			const referenceEl = this.referenceEl

			if (el && el.removeEventListener) {
				el.removeEventListener('mouseenter', () => { this.referenceHover = true })
				el.removeEventListener('mouseleave', () => { this.referenceHover = false })					
			}
		},

		align() {
			const bounds = getBounds(this.referenceEl)

			this.position = {
				x: bounds.topRight.x + settings.context.margin.x,
				y: bounds.topRight.y + settings.context.margin.y
			}

			if (this.parentContext) {
				this.delta = {
					x: bounds.center.x - this.parentContext.position.x,
					y: bounds.center.y - this.parentContext.position.y,
				}
			}		
		},

		onMouseDown(event) {
			this.startDrag(event)
			this.activateContext(this.id)
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
			const el = this.$refs.context
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
			this.closeContext(this.id)
		},

		targetIsChild(target) {
			const context = target.closest('.context')

			if (!context) return false

			const parentId = context.dataset.parentId
			return (parentId === this.id)
		}
	},
}
</script>