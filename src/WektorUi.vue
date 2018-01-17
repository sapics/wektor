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
				v-if="dialog.vfor !== false"
				:key="id"
				:spec="dialog"
			></vdialog>
		</div>
	</div>
</template>

<script>
import Vue from 'vue' 
import { mapGetters, mapMutations, mapState } from 'vuex'
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
		this.theme = new WektorUiTheme()
		this.theme.activate()
	},

	mounted() {
		document.addEventListener('keydown', this.onKeydown)
		document.addEventListener('contextmenu', this.onContextmenu)

		wektor.on('activateTool', ({ id, tool }) => {
			this.setActiveTool(id)
		})

		wektor.on('openDialog', this.openDialog)
		wektor.on('closeDialog', this.closeDialog)

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
					fitContent: true,
					position: { x: 700, y: 200 },
					css: {
						overflow: 'scroll',
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
			
			const theme = this.theme
			wektor.addDialog({
				id: 'ui-theme',
				payload: { 
					locked: true,
					applyCustomTheme: false,
				},
				layout: settings.dialog.layouts.uiTheme,
				values: theme,
				changeHandler: () => theme.update()	
			})
		},

		handleCustomCssChange(target, key, value) {
			const { customStyleSheet, customCss } = this

			if (customStyleSheet)
				customStyleSheet.parentNode.removeChild(customStyleSheet)
			
			const styleSheet = document.createElement('style')
			styleSheet.innerHTML = `
				#wektor {
					color: ${customCss.color}!important;
					font-size: ${customCss.fontSize}pt!important;
				}
				.dialog {
					color: ${customCss.dialog.color}!important;
					font-style: ${customCss.dialog.fontStyle}!important;
					background: ${customCss.dialog.background}!important;
					border-color: ${customCss.dialog.borderColor}!important;
				}
				#wektor input, .input {
					color: ${customCss.input.color}!important;
					font-style: ${customCss.input.fontStyle}!important;
					font-size: ${customCss.fontSize}pt!important;
				}
				.theme-border {
					border: 1px solid ${customCss.dialog.borderColor}!important;
				}
				.theme-border_background {
					background: ${customCss.dialog.borderColor}!important;
				}
			`
			document.body.appendChild(styleSheet)
			this.customStyleSheet = styleSheet
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
					if (isFunction(shortcut.callback)) shortcut.callback({ event, wektor })
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

	#wektor-search {
		width: 100%;
		input {
			width: 100%;
			position: absolute;
			transform: translate(0, -100%);			
		}
	}

	#wektor-tool-bar {
		margin-bottom: $padding;
	}
}

</style>
