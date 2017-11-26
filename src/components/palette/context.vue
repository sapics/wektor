<template>
	<div class="context-wrap">
		<pointer-line
			v-visible="showPointerLine"
			:from="position"
			:to="referencePoint"
		></pointer-line>
		<div 
			class="context"
			ref="context"
			v-outside:mousedown="{callback: close, enabled: !locked}"
			:style="css"
			:data-id="id"
			:data-parent-id="parentId"
			v-draggable="{onDrag}"
		>
			<div 
				class="lock"
				:class="{locked}"
				@click="locked = !locked"
			></div>
			<template v-for="(child, index) in children">
				<component 
					:is="child.component" 
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
		width: 0.5em;
		height: 0.5em;
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
import { getBounds } from '@/utils'

const { Path, Point } = paper

export default {
	extends: palette,

	props: ['payload'],

	components: { pointerLine },

	data() {
		return {
			delta: null,
			locked: false,
		}
	},

	computed: {
		...mapGetters(['contexts', 'getContext', 'contextIsOpen']),

		css() {
			return {
				top: this.position.y + 'px',
				left: this.position.x + 'px',
				width: this.payload.width,
				height: this.payload.height,
				padding: this.payload.padding || '0.5em'
			}
		},

		referenceEl() {
			return this.payload.referenceEl || {}
		},

		parentId() {
			return this.payload.parentId
		},

		showPointerLine() {
			if (this.parentId === undefined) return true
			return this.contextIsOpen(this.parentId)
		},

		parentContext() {
			return this.getContext(this.parentId)
		},

		parentContextPosition() {
			if (this.parentContext) {
				return this.parentContext.position
			}
		},

		referencePoint() {
			if (this.parentContext) {
				const parentPos = this.parentContextPosition
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
	},

	// watch() {
	// 	referencePoint(point) {
	// 		this.line.referencePoint = point
	// 	}
	// },

	created() {
		this.align()
		// const {referenceEl} = this
		// const bounds = getBounds(referenceEl)

		// if (this.parentContext) {
		// 	this.delta = {
		// 		x: bounds.left - this.parentContextPosition.x,
		// 		y: bounds.top - this.parentContextPosition.y,
		// 	}
		// }

		// // const referenceDelta = {
		// // 	x: this.parentContextPosition.x,
		// // 	y: this.parentContextPosition.y,
		// // }

		// this.position = {
		// 	x: bounds.topRight.x + settings.context.margin.x,
		// 	y: bounds.topRight.y + settings.context.margin.y
		// }
		// this.modifyContext({
		// 	id: this.id,
		// 	key: 'position',
		// 	value: this.position
		// })

		// this.$nextTick(() => {
		// 	const {canvas} = this.$refs
		// 	canvas.width = canvas.offsetWidth
		// 	canvas.height = canvas.offsetHeight
		// 	this.line = new PointerLine(this.$refs.canvas, this.$refs.context, this.referenceEl)
		// })
	},

	methods: {
		...mapMutations(['openContext', 'closeContext', 'modifyContext']),

		align() {
			const bounds = getBounds(this.referenceEl)

			this.position = {
				x: bounds.topRight.x + settings.context.margin.x,
				y: bounds.topRight.y + settings.context.margin.y
			}

			if (this.parentContext) {
				this.delta = {
					x: bounds.center.x - this.parentContextPosition.x,
					y: bounds.center.y - this.parentContextPosition.y,
				}
			}		
		},

		onDrag() {
			const { x, y } = this.$refs.context.getBoundingClientRect()
			this.position = { x, y }
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