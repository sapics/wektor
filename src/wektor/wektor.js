import paper from 'paper'
import EventEmitter from 'event-emitter-es6'
import settings from '@/settings'
import { isArray, isObject, isFunction, isString, moveArrayElementToEnd, removeArrayElement, makeUniqueId } from '@/utils'
import Dialog from '@/dialog'
import WektorHistory from './WektorHistory'
import ChangeTracker from './ChangeTracker'
import ChangeFlag from './ChangeFlag'
import State from './State'
import StackingOrder from './StackingOrder'
import Vue from 'vue'
import Shortcuts from './Shortcuts'
import BaseEffect from '@/effects/BaseEffect'

class WektorEffects {
	constructor(item) {
		this.item = item
		this.list = []
	}

	apply() {
		if (!this.list.length) {
			this.item.opacity = 1
		}

		for (let i = 0; i < this.list.length; i++) {
			const effect = this.list[i]
			const prevEffect = this.list[i - 1]
			const input = prevEffect
				? prevEffect.output
				: this.item
			effect.input = input
		} 
	}

	add(arg1, arg2) {
		let effect

		if (isArray(arg1)) {
			const array = arg1
			for (let i = 0; i < array.length; i++) {
				this.add(array[i])	
			}
			return
		}

		if (isFunction(arg1)) {
			// class constructors are also functions
			const Constructor = arg1
			const spec = arg2
			effect = new Constructor(null, spec)
			effect.label = Constructor.label
		} else if (isObject(arg1)) {
			const spec = arg1
			effect = new BaseEffect(null, spec)
			effect.label = spec.label
		}

		const index = this.list.length
		effect.key = makeUniqueId()
		effect.original = this.item
		effect.on('remove', () => {
			removeArrayElement(this.list, effect)
			this.apply()
		})
		this.list[index] = effect
		this.apply()
	}

	toJSON() {
		const effectsJSON = this.list.map(effect => effect.toJSON())
		return [
			'WektorEffects',
			{
				list: effectsJSON,
				ownerId: this.item.id
			}
		]
	}	
}

class ImprovedEventEmitter extends EventEmitter {
	on(...args) {
		const arg = args[0]
		if (isObject(arg)) {
			for (const [type, listener] of Object.entries(arg)) {
				super.on(type, listener)
			}
		} else {
			super.on(...args)
		}
	}	
}

class Wektor extends ImprovedEventEmitter {
	constructor(settings) {
		super()

		paper.Item.inject({		
			get wektorEffects() {
				if (!this._wektorEffects)
					this._wektorEffects = new WektorEffects(this)

				return this._wektorEffects
			}
		})		

		Object.assign(this, {
			project: null,
			view: null,
			tools: {},
			effects: {},
			shortcuts: null,
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

		this.history = new WektorHistory(this)
		this.state = new State(this.project)
		this.shortcuts = new Shortcuts(this)
		this.initShortcuts()
		this.initChangeTracking()
		this.initMenu()

		this.on('groupItems', () => this.groupItems())
	}

	initMenu() {
		this.menu = this.settings.menu

		for (const entry of this.menu) {
			this.shortcuts.add(entry.shortcut)
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
			this.shortcuts.add(shortcut)
			// this.addShortcut(shortcut)
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
		this.shortcuts.add({
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

	removeTool(id) {
		const tool = this.tools[id]
		tool && tool.remove()
		delete this.tools[id]
		this.emit('removeTool', { id })
	}

	addEffect(id, Constructor) {
		if (this.effects[id])
			console.warn(`Effect with id '${id}' already exists! It will be overwritten.`)

		Constructor.label = Constructor.label || id
		this.effects[id] = Constructor
	}

	addEffects(object) {
		for (const [id, effect] of Object.entries(object)) {
			this.addEffect(id, effect)
		}		
	}

	removeEffect(id) {
		delete this.effects[id]
	}

	// addDialog(spec) {
	// 	if (this.dialogs[spec.id]) {
	// 		console.warn(`Dialog with id '${spec.id}' already exists`)
	// 		return
	// 	}

	// 	const dialog = new Dialog(spec)
	// 	this.dialogs[dialog.id] = dialog
	// 	this.dialogsStackingOrder.add(dialog.id)
	// 	this.emit('addDialog', dialog)
	// 	this.emit('updateDialogs', this.dialogs, 'add')
	// }
	
	addDialog(spec) {
		if (this.dialogs[spec.id]) {
			console.warn(`Dialog with id '${spec.id}' already exists`)
			return
		}

		const dialog = new Dialog(spec)
		this.dialogs[dialog.id] = dialog
		this.emit('addDialog', dialog)
		this.emit('updateDialogs', this.dialogs, 'add')
		return dialog
	}

	openDialog(arg) {
		const spec = isString(arg) ? { id: arg } : arg

		let dialog = this.dialogs[spec.id]

		if (!dialog) {
			dialog = this.addDialog(spec)
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
		dialog.show = false
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