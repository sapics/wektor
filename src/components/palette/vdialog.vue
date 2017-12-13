<template>
	<div class="dialog-wrap">
		<pointer-line
			v-if="referencePoint"
			v-visible="showPointerLine"
			class="pointer-line"
			:css="{zIndex}"
			:from="position"
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
<!-- 			<div class="wire-frame"
				v-show="showWireFrame"
			></div> -->
			<div 
				class="lock"
				:class="{locked}"
				@click="locked = !locked"
			></div>		
			<palette
				class="draghandler"
				:values="values"
				:layout="layout"
				:dialogId="id"
			></palette>			
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

	// .pointer-line {
	// 	z-index: 2;
	// }

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

export default {
	name: 'vdialog',

	mixins: [ draggable ],
	
	components: { pointerLine, palette },

	props: {
		id: String,
		parentId: String,
		values: Object,
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
			position: null,
			referencePoint: null,
			locked: false,
			hover: false,
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
	},

	watch: {
		showPointerLine(show) {
			if (show)
				this.referencePoint = this.reference.position
		}
	},

	created() {
		this.active = true
		this.position = this.payload.position || { x: 0, y: 0 }
		this.referencePoint = this.reference.position
		this.locked = this.payload.locked || this.locked
	},

	methods: {
		onMouseDown(event) {
			this.active = true
			if (this.isDragHandle(event.target))
				this.startDrag(event)
		},

		onMouseUp(event) {
			this.endDrag()
		},

		onMouseDownOutside(event) {
			this.active = false
			if (!this.locked) this.close(event)
		},	

		isDragHandle(el) {
			const classList = el.classList
			return classList.contains('draghandler')
			// return (classList.contains('dialog') || classList.contains('palette-wrap') || classList.contains('palette') || classList.contains('label'))
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