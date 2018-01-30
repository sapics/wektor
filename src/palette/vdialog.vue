<template>
	<div class="dialog-wrap">
		<div class="dialog draghandle"
			ref="dialog"
			:id="spec.id"
			:style="css"
			@mousedown="onMouseDown"
		>
			<palette
				class="dialog-content"
				:id="`${spec.id}-palette`"
				:dialogId="spec.id"
				:spec="{ values, layout }"
			></palette>		
			<div class="dialog-sidebar draghandle">
				<div class="dialog-lock-close"
					:class="{ locked }"
					@click="onLockClick"
				></div>
				<svg 
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
	.dialog {
		position: absolute;
		isolation: isolate;
		box-sizing: border-box;
		white-space:nowrap;
		display: table;

		background: var(--wektor-dialog-background);
		border: 1px solid;
		border-color: var(--wektor-dialog-border-color);
	}

	.dialog-content {
		display: table-cell;
		padding: 0.8em;
		padding-right: 0;
		box-sizing: border-box;
	}

	.dialog-sidebar {
		display: table-cell;
		vertical-align: top;
		box-sizing: border-box;	
		width: 0.8em;
		padding: 0.2em;
		padding-left: 0;
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
import wektor from '@/wektor'
import { pointToCssPercent } from '@/utils'

export default {
	mixins: [ draggable, resizeable ],

	props: {
		spec: {
			type: Object,
			default: () => Object()
		},
	},

	components: { palette },

	data() {
		return {
			position: null,
			width: null,
			height: null,
			locked: this.spec.locked,
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
	},

	created() {
		this.activate()
	},

	methods: {
		activate() {
			wektor.activateDialog(this.spec.id)
		},

		onMouseDown(event) {
			this.activate()
			if (this.isDragHandle(event.target))
				this.startDrag(event, this.$refs.dialog)
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

		close() {
			wektor.closeDialog(this.spec.id)
		},

		isDragHandle(el) {
			const classList = el.classList
			return classList.contains('draghandle')
		},		
	},
}	
</script>