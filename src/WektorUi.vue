<template>
	<div id="wektor">
		<div id="wektor-sidebar">
			<wektor-search
				id="wektor-search"
				ref="search" 
				v-model="searchQuery"
			>
				<tool-bar
					ref="toolbar"
					id="wektor-tool-bar"
					:tools="tools"
					:searchQuery="searchQuery"
				></tool-bar>
				<vmenu 
					ref="menu" 
					id="wektor-menu" 
					:items="menu"
					:searchQuery="searchQuery"
				></vmenu>
			</wektor-search>
		</div>
		<div ref="dialogs">
			<vdialog
				v-for="(dialog, id) in dialogs"
				v-if="dialog.open"
				v-show="dialog.show"
				:key="id"
				:spec="dialog"
			></vdialog>
		</div>
	</div>
</template>

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
		// font-size: 14pt;
		// font-weight: 300;
	}

	input {
		font-kerning: none;
		padding: 0;
	}

	.underline {
		position: relative;

		&::after {
			position: absolute;
			margin: 0 auto;
			color: inherit;
			content: '';
			left: 0;
			right: 0;
			width: 100%;
			left: 0;
			bottom: 3px;
			height: 0;
			background: none;
			border-bottom: calc(1em * 0.08) solid;
		}
	}

	.shortcut {
		text-decoration: underline;
	}
}

#wektor-sidebar {
	position: absolute;
	box-sizing: border-box;
	top: 0;
	left: 0;
	width: 20%;
	height: 100%;
	margin: $padding;
	margin-right: 0;
	pointer-events: none;

	#wektor-search {
		width: 100%;
		input {
			pointer-events: all;
			width: 100%;
			position: absolute;
			transform: translate(0, -100%);			
		}
	}

	#wektor-tool-bar {
		margin-bottom: $padding;
		.tool-select-option .label {
			pointer-events: all;
		}
	}

	#wektor-menu {
		.label {
			pointer-events: all;
		}
	}
}
</style>

<script>
import Vue from 'vue' 
import toolBar from './components/tool-bar.vue'
import vdialog from './palette/vdialog.vue'
import settings from './settings'
import { isArray, isFunction } from './utils.js'
import wektor from '@/wektor'
import createDialog from '@/dialog'
import WektorUiTheme from './WektorUiTheme'
import vmenu from './components/vmenu'
import wektorSearch from './components/wektor-search'

export default {
	name: 'wektorUi',

	props: ['target'],

	components: { toolBar, vdialog, vmenu, wektorSearch },

	data() {
		return {
			dialogs: {},
			layers: [],
			tools: {},
			theme: null,
			menu: wektor.menu,
			searchQuery: null,
		}
	},

	computed: {
		settings() {
			return settings
		},
	},

	created() {
		this.theme = new WektorUiTheme(settings.theme)
		this.theme.activate()
	},

	mounted() {
		window.addEventListener('keydown', this.onKeyDown)
		window.addEventListener('contextmenu', this.onContextmenu)
		window.addEventListener('resize', () => wektor.emit('resize'))			

		wektor.on('openDialog', this.openDialog)
		wektor.on('closeDialog', this.closeDialog)
		wektor.on('showDialog', this.showDialog)
		wektor.on('hideDialog', this.hideDialog)

		wektor.on('addTool', ({ id, tool }) => {
			this.$set(this.tools, id, {
				label: tool.label,
				value: id,
				id,
				shortcut: tool.shortcut				
			})
		})

		wektor.on('removeTool', ({ id }) => {
			this.$delete(this.tools, id)
		})

		wektor.state.on('update', state => {
			// if we assign "this.layers = state.nested" directly, vue won't update the layers-vdialog
			// witch uses this.layers als values
			this.layers.length = 0
			this.layers.push(...state.nested) 
		})
		wektor.state.update()

		wektor.on('search', this.$refs.search.focus)

		wektor.dialogsStackingOrder.on('update', this.updateDialogStackingOrder)

		this.openDefaultDialogs()
	},

	methods: {
		openDefaultDialogs() {
			wektor.openDialog({
				id: 'layers',
				values: this.layers,
				layout: {
					type: 'layers',			
				},
				payload: {
					locked: true, 
					resize: true, 
					css: {
						overflow: 'scroll',
						top: '50%',
						right: '20px',
					},
				},
				convert: false,			
			})	

			wektor.addDialog({
				id: 'scripts',
				layout: {
					type: 'code',
				},
				payload: {
					locked: true,
					css: { 
						width: '50%',
						height: '30%',
						padding: '0',
					},
					fitContent: true,
					resize: true,
				} 
			})

			wektor.addDialog({
				id: 'preferences',
				values: settings,
				layout: settings.dialog.layouts.preferences,
				changeHandler: (target, key, value) => {
					key.startsWith('theme') && this.theme.update()
				},
			})
		},

		onKeyDown(event) {
			const matchedShortcut = wektor.shortcuts.match(event)
			if (matchedShortcut) {
				event.preventDefault()
				isFunction(matchedShortcut.callback) && matchedShortcut.callback(wektor, event)
			}
		},

		openDialog(dialog) {
			this.$set(this.dialogs, dialog.id, dialog)
		},

		closeDialog(dialog) {
			this.$delete(this.dialogs, dialog.id)
		},

		showDialog({id}) {
			const dialog = this.dialogs[id]
			if (dialog) dialog.show = true
		},

		hideDialog({id}) {
			const dialog = this.dialogs[id]
			if (dialog) dialog.show = false
		},

		updateDialogStackingOrder(stack, updateType) {
			// when a dialog is added it will automatically be activated so this would cause a double update
			// if (updateType === 'add') return

			for (const [index, id] of stack.entries()) {
				const dialog = this.dialogs[id]
				dialog && this.$set(dialog, 'stackingIndex', index)
			}
		},	

		onContextmenu(event) {
			event.preventDefault()
			event.stopPropagation()

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
