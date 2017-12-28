import paper from 'paper'
import EventEmitter from 'event-emitter-es6'
import settings from '@/settings'
import { isArray, isFunction } from '@/utils'
import Dialog from '@/dialog'
import History from './History'
import ChangeTracker from './ChangeTracker'
import ChangeFlag from './ChangeFlag'
import State from './State'

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
				layer: null,
			},
			changeTracker: null, // gets defined in setup()
			state: null,
			dialogs: {},
			history: null,
			settings
		})
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

		this.on('groupItems', () => this.groupItems())
	}

	initChangeTracking() {
		const changeTracker = this.changeTracker = new ChangeTracker(this.project)
		changeTracker.on('change', change => this.handleChange(change))
		changeTracker.on('changes', changes => this.handleChanges(changes))		
	}

	handleChange(change) {
		if (change.flags & ChangeFlag.INSERTION)
			this.history.updateAutoHistory(change)	
	}

	handleChanges(changes) {
		let updateFn

		for (const change of changes) {
			const { item, flags } = change

			if (flags & ChangeFlag.ATTRIBUTE)
				updateFn = () => this.state.update(item, { recursive: false })
			
			if (flags & ChangeFlag.INSERTION)
				updateFn = () => this.state.update()
		}

		console.log(updateFn)
		updateFn && updateFn()
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

	addTool(ToolClass, spec) {
		const tool = new ToolClass(this.project, spec)

		tool.on({
			activate: () => {
				this.emit('activateTool', tool)
			},
		})
		tool.activate()

		this.tools[tool.id] = tool
		this.addShortcut({
			modifier: this.settings.shortcutModifiers.tool,
			key: tool.shortcut,
			callback: () => tool.activate(),			
		})

		this.emit('addTool', tool)
	}

	addTools(array) {
		for (const item of array) {
			if (isArray(item))
				this.addTool(item[0], item[1])
			else
				this.addTool(item)
		}
	}

	openDialog(spec) {
		const dialog = new Dialog(spec)
		this.dialogs[dialog.id] = { ...dialog, open: true }
		console.log(dialog.values)
		this.emit('openDialog', dialog)
	}

	closeDialog(id) {
		const dialog = this.dialogs[id]
		if (!dialog) return
		dialog.open = false
		this.emit('closeDialog', dialog)
	}

	undo() {
		this.history.undo()
	}

	redo() {
		this.history.redo()
	}
}

export default new Wektor(settings)