import paper from 'paper'
import EventEmitter from 'event-emitter-es6'
import settings from '@/settings'
import { isArray, isFunction, isString, moveArrayElementToEnd } from '@/utils'
import Dialog from '@/dialog'
import History from './History'
import ChangeTracker from './ChangeTracker'
import ChangeFlag from './ChangeFlag'
import State from './State'
import StackingOrder from './StackingOrder'
import Vue from 'vue'

class Wektor extends EventEmitter {
	constructor(settings) {
		super()

		Object.assign(this, {
			project: null,
			view: null,
			tools: {},
			shortcuts: [],
			active: {
				tool: null,
				toolId: null,
				layer: null,
			},
			changeTracker: null,
			state: null,
			dialogs: {},
			dialogsStackingOrder: new StackingOrder(),
			history: null,
			settings
		})
	}

	execute(string) {
		this.project._scope.execute(string)
	}

	setup(project) {
		if (!(project instanceof paper.Project)) {
			console.warn(`project (${project}) must be a paper.Project`)
			return
		}

		this.project = project
		this.active.layer = this.project.activeLayer

		this.history = new History(this)
		this.state = new State(this.project)
		this.initShortcuts()
		this.initChangeTracking()
		this.initMenu()

		this.on('groupItems', () => this.groupItems())
	}

	initMenu() {
		this.menu = this.settings.menu

		for (const entry of this.settings.menu) {
			this.addShortcut(entry.shortcut)
		}
	}

	initChangeTracking() {
		const changeTracker = this.changeTracker = new ChangeTracker(this.project)
		changeTracker.on('attribute', change => this.state.update())	
		changeTracker.on('insertion', change => {
			this.history.updateAutoHistory(change)
			this.state.update()
		})
	}

	groupItems() {
		// selectedItems may contain groups and also their children.
		// to group these groups correctly we have to delete their children from the selectedItems array
		function resolveGroups(items, root = true) {
			for (const item of items) {
				if (item.hasChildren() && item.parent)
					resolveGroups(item.children, false)
				else if (!item.parent || !root)
					selectedItems = selectedItems.filter(selectedItem => selectedItem !== item)
			}
		}

		let selectedItems = this.project.selectedItems
		resolveGroups(selectedItems)

		if (!selectedItems.length) return
		if ((selectedItems.length === 1) && ['Group', 'Layer'].includes(selectedItems[0].className)) return

		new paper.Group({
			children: selectedItems,
			selected: true
		})
	}

	deleteSelection() {
		const selectedItems = this.project.selectedItems
		for (const item of selectedItems)
				item.remove()
	}

	initShortcuts() {
		for (const shortcut of this.settings.shortcuts) {
			this.addShortcut(shortcut)
		}
	}

	addShortcut(shortcut) {
		if (!shortcut.callback) {
			const { emit: emitName, method: methodName } = shortcut

			if (methodName || emitName) {
				shortcut.callback = () => {
					if (emitName) this.emit(emitName)
					if (methodName) {
						if (isFunction(this[methodName]))
							this[methodName]()
						else
							console.warn(`wektor.${methodName} is not a function`)
					}
				}
			}
		}

		this.shortcuts.push(shortcut)
	}

	removeTool(id) {
		const tool = this.tools[id]
		tool && tool.remove()
		delete this.tools[id]
		this.emit('removeTool', { id })
	}

	addTool(id, arg) {
		let tool

		if (this.tools[id]) {
			console.warn(`Tool with id '${id}' already exists! It will be overwritten.`)
			this.removeTool(id)
		}

		if (isFunction(arg)) {
			// class declarations are also functions in javascript
			const ToolClass = arg
			tool = new ToolClass(this.project)
		} else {
			const toolSpec = arg
			tool = new paper.Tool(toolSpec)
		}

		tool._wektorToolId = id

		tool.on({
			activate: () => {
				Vue.set(this.active, 'tool',  tool)
				Vue.set(this.active, 'toolId',  tool._wektorToolId)
				this.emit('activateTool', tool)
			},
		})

		this.tools[id] = tool
		this.addShortcut({
			modifier: this.settings.shortcutModifiers.tool,
			key: tool.shortcut,
			callback: () => tool.activate(),			
		})

		this.emit('addTool', { id, tool })
		// activate after emit, so the tool-list has added the tool before selecting it
		tool.activate()
	}

	addTools(object) {
		for (const [id, item] of Object.entries(object)) {
			this.addTool(id, item)
		}
	}

	addDialog(spec) {
		if (this.dialogs[spec.id]) {
			console.warn(`Dialog with id '${spec.id}' already exists`)
			return
		}

		const dialog = new Dialog(spec)
		this.dialogs[dialog.id] = dialog
		this.dialogsStackingOrder.add(dialog.id)
		this.emit('addDialog', dialog)
		this.emit('updateDialogs', this.dialogs, 'add')
	}

	openDialog(arg) {
		const spec = isString(arg) ? { id: arg } : arg

		let dialog = this.dialogs[spec.id]

		if (!dialog) {
			dialog = new Dialog(spec)
			this.dialogs[dialog.id] = dialog
		} else {
			dialog.bridge && dialog.bridge.update()
		}

		dialog.open = true
		dialog.show = true

		this.emit('openDialog', dialog)
		this.emit('updateDialogs', this.dialogs, 'open')
		this.dialogsStackingOrder.add(dialog.id)
	}

	getDialog(id) {
		const dialog = this.dialogs[id]
		if (!dialog) {
			console.warn(`There is no dialog with id '${id}'`)
			return false
		} else {
			return dialog
		}
	}

	toggleDialog(id) {
		let dialog = this.getDialog(id)
		if (!dialog) return

		if (dialog.open) 
			this.closeDialog(id)
		else 
			this.openDialog(id)
	}

	toggleShowDialog(id) {
		let dialog = this.dialogs[id]
		if (!dialog) return

		if (dialog.show)
			this.hideDialog(id)
		else
			this.showDialog(id)
	}

	openChildDialog(spec) {
		const parentDialog = this.getDialog(spec.parentId)
		if (!parentDialog) return

		if (parentDialog.bridge)
			spec.bridge = parentDialog.bridge
		else
			spec.values = parentDialog.values

		this.openDialog(spec)
	}

	showDialog(id) {
		const dialog = this.dialogs[id]
		if (!dialog) return

		if (dialog.open !== true)
			this.openDialog(id)

		dialog.show = true
		this.emit('showDialog', dialog)
		this.emit('updateDialogs', this.dialogs, 'show')
	}	

	hideDialog(id) {
		const dialog = this.dialogs[id]
		if (!dialog) return
		dialog.show = false
		this.emit('hideDialog', dialog)
		this.emit('updateDialogs', this.dialogs, 'hide')
	}

	closeDialog(id) {
		const dialog = this.dialogs[id]
		if (!dialog) return
		dialog.open = false
		this.dialogsStackingOrder.remove(id)
		this.emit('closeDialog', dialog)
		this.emit('updateDialogs', this.dialogs, 'close')
	}

	activateDialog(id) {
		const dialog = this.dialogs[id]
		if (!dialog) return
		this.dialogsStackingOrder.activate(id)
	}

	undo() {
		this.history.undo()
	}

	redo() {
		this.history.redo()
	}
}

export default new Wektor(settings)