<template>
	<div class="context-wrap">
		<canvas 
			class="pointer-line-canvas"
			ref="canvas"
			v-visible="showPointerLine"
		></canvas>
		<div 
			class="context"
			v-outside:mousedown="{callback: close, enabled: !locked}"
			:style="css"
			:data-id="id"
			:data-parentid="parentId"
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
	.pointer-line-canvas {
		position: absolute;
		pointer-events: none;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

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
import palette from './palette'
import settings from '@/settings.js'
import paper from 'paper'
import PointerLine from './PointerLine'
import {getBounds} from '@/utils'

const { Path, Point } = paper

export default {
	props: ['payload'],

	extends: palette,

	data() {
		return {
			line: null,
			delta: {},
			locked: false,
		}
	},

	computed: {
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

		position() {
			const {referenceEl} = this
			const bounds = getBounds(referenceEl)
			return {
				x: bounds.topRight.x + settings.context.margin.x,
				y: bounds.topRight.y + settings.context.margin.y
			}
		},

		parentId() {
			return this.payload.parentId
		},

		showPointerLine() {
			if (this.parentId === undefined) return true
			return this.$bus.openContexts[this.parentId] !== undefined
		},
	},

	mounted() {
		const {canvas} = this.$refs
		canvas.width = canvas.offsetWidth
		canvas.height = canvas.offsetHeight
		this.line = new PointerLine(this.$refs.canvas, this, this.referenceEl)
	},

	activated() {
		// this.line && (this.line.visible = true)
	},

	deactivated() {
		// this.line && (this.line.visible = false)
	},

	destroyed() {
		// this.line.remove()
	},

	methods: {
		close(event) {
			if (this.targetIsChild(event.target)) return

			this.$bus.$emit('close-context', this.id)
		},

		targetIsChild(target) {
			const context = target.closest('.context')

			if (!context) return false

			const parentId = context && context.dataset.parentid
			return (parentId === this.id)
		}
	},
}
</script>