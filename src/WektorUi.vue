<template>
	<div id="wektor">
		<tool-bar ref="toolbar" class="tool-bar" :tools="tools"></tool-bar>
		<div ref="dialogs">
			<vdialog
				v-for="(dialog, id) in dialogs"
				v-if="dialog.vfor !== false"
				:key="id"
				:spec="dialog"
			></vdialog>
<!-- 			<vdialog
				key="layers"
				:spec="{
					id: 'layers',
					values: layers,
					layout: {
						type: 'layers',			
					},
					payload: {
						locked: true, 
						resize: true, 
						fitContent: true,
						position: { x: 700, y: 200 },
					},
					convert: false,			
				}"
			></vdialog> -->
<!-- 			<vdialog
				key="scripts"
				:spec="{
					id: 'scripts',
					layout: {
						type: 'code',
					},
					payload: {
						css: { 
							width: '50%',
							height: '30%',
							padding: '0',
						},
						fitContent: true,
						resize: true,
					} 
				}"
			>
			</vdialog>				 -->
		</div>
	</div>
</template>

<script>
import Vue from 'vue' 
import { mapGetters, mapMutations, mapState } from 'vuex'
import toolBar from './components/tool-bar.vue'
import vdialog from './palette/vdialog.vue'
import settings from './settings.js'
import { isArray, isFunction } from './utils.js'
import wektor from '@/wektor'
import createDialog from '@/dialog'

export default {
	name: 'wektorUi',

	props: ['target'],

	components: { toolBar, vdialog },

	data() {
		return {
			dialogs: {},
			layers: [],
		}
	},

	computed: {
		tools() {
			return wektor.tools
		},

		settings() {
			return settings
		},
	},

	mounted() {
		document.addEventListener('keydown', this.onKeydown)
		document.addEventListener('contextmenu', this.onContextmenu)

		wektor.on('activateTool', tool => {
			this.setActiveTool(tool.id)
		})

		wektor.on('openDialog', this.openDialog)
		wektor.on('closeDialog', this.closeDialog)

		wektor.state.on('update', state => {
			// if we assign "this.layers = state.nested" directly, vue won't update the layers-vdialog
			// witch uses this.layers als values
			this.layers.length = 0
			this.layers.push(...state.nested) 
		})

		wektor.dialogsStackingOrder.on('update', this.updateDialogStackingOrder)

		this.openDefaultDialogs()

		// wektor.on('updateChildren', this.updateChildren)
		// wektor.on('updateAttribute', this.updateChildren)
		// wektor.on('updateAttribute', this.updateSelection)
	},

	methods: {
		openDefaultDialogs() {
			// wektor.registerDialog('layers')
			// this.openDialog({ id: 'layers', vfor: false })
			wektor.openDialog({
				id: 'layers',
				values: this.layers,
				layout: {
					type: 'layers',			
				},
				payload: {
					locked: true, 
					resize: true, 
					fitContent: true,
					position: { x: 700, y: 200 },
					css: {
						overflow: 'scroll',
					},
				},
				convert: false,			
			})	

			wektor.openDialog({
				id: 'scripts',
				layout: {
					type: 'code',
				},
				payload: {
					css: { 
						width: '50%',
						height: '30%',
						padding: '0',
					},
					fitContent: true,
					resize: true,
				} 
			})
		},

		...mapMutations([
			// 'openDialog',
			'addTool',
			'setActiveTool'
		]),

		onKeydown(event) {			
			const exlcude = settings.shortcutTargetExlude
			if (exlcude.includes(event.target.tagName.toLowerCase())) return

			let shortcutMatched = false
			for (const shortcut of wektor.shortcuts) {
				if (this.shortcutMatches(shortcut, event)) {
					if (shortcutMatched) console.warn('multiple shortcuts matched event')
					shortcutMatched = true
					if (isFunction(shortcut.callback)) shortcut.callback()
					event.preventDefault()		
				}
			}
		},

		shortcutMatches(shortcut, event) {
			if (event.key !== shortcut.key) return false

			const modifiers = isArray(shortcut.modifier) ? shortcut.modifier : [shortcut.modifier]

			for (const modifier of ['alt', 'ctrl', 'meta', 'shift']) {
				const eventHasModifier = event[modifier + 'Key']
				const shortcutHasModifier = modifiers.includes(modifier)

				if (eventHasModifier && !shortcutHasModifier) return false
				if (!eventHasModifier && shortcutHasModifier) return false
			}

			return true
		},

		updateChildren() {
			const countTypeOf = {}
			const store = this.$store

			function convertItems(items) {
				const converted = []
				for (let i = items.length - 1; i >= 0; i--) {
					const item = items[i]
					if (item.data.iterable === false) continue
					converted.push({
						id: item.id,
						name: item.name || `${item.className} ${item.id}`,
						paperName: item.name,
						type: item.className,
						open: item.data.open,
						children: item.children ? convertItems(item.children) : undefined,
						_wektorPastePaperItem: true, // this lets the built-in code editor in wektor know, that when we paste the item into the editor, it'll resolve it to a reference to the item        
					})					
				}
				return converted
			}

			this.layers = convertItems(wektor.project.layers)
		},

		updateSelection() {
			const selectedItems = wektor.project.selectedItems
			const ids = selectedItems.map(item => item.id)
			this.$store.commit('updateSelection', ids)
		},

		openDialog(dialog) {
			this.$set(this.dialogs, dialog.id, dialog)
		},

		closeDialog(dialog) {
			this.$delete(this.dialogs, dialog.id)
		},

		updateDialogStackingOrder(stack, updateType) {
			// when a dialog is added it will automatically be activated so this would cause a double update
			if (updateType === 'add') return

			for (const [index, id] of stack.entries()) {
				const dialog = this.dialogs[id]
				dialog && this.$set(dialog, 'stackingIndex', index)
			}
		},	

		onContextmenu(event) {
			event.preventDefault()

			const point = { x: event.x, y: event.y }
			const hit = wektor.project.hitTest(point, settings.dialog.hitOptions)

			if (!(hit && hit.item)) return

			if (wektor.project.selectedItems.length > 1) {
				wektor.openDialog({
					id: 'multiple',
					values: wektor.project.selectedItems,
					layout: settings.dialog.layouts.item,
				})
				return
			} 

			if (hit.item.responds('contextmenu')) {
				hit.item.emit('contextmenu')
			} else {
				wektor.openDialog({
					id: hit.item.name || (hit.item.className + hit.item.id), 
					values: hit.item, 
					layout: settings.dialog.layouts.item,
					reference: hit.item,
				})
			}
		},

		undo() {
			wektor.history.undo()
		},

		redo() {
			wektor.history.redo()
		},
	},
}
</script>

<style lang="scss">
@import "./sass/fontface";
@import "./sass/variables";

@include font-face('HKGrotesk', '/static/fonts/HKGrotesk/HKGrotesk-Light', 300);
@include font-face('HKGrotesk', '/static/fonts/HKGrotesk/HKGrotesk-LightItalic', 300, italic);
@include font-face('HKGrotesk', '/static/fonts/HKGrotesk/HKGrotesk-Regular', 400);
@include font-face('HKGrotesk', '/static/fonts/HKGrotesk/HKGrotesk-Medium', 500);

	#main-canvas {
		background-color: white;
	}

#wektor {
	&, input, textarea, button {
		font-family: HKGrotesk;
		font-size: 14pt;
		font-weight: 300;
	}

	input {
		font-kerning: none;
		padding: 0;
	}

	.tool-bar {
		position: absolute;
		top: 0;
		left: 0;
		padding: $padding;
	}
}

</style>
