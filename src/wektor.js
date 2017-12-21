import paper from 'paper'
import EventEmitter from 'event-emitter-es6'
import settings from './settings'
import { isArray, isFunction } from '@/utils'
import Dialog from './dialog'

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
			dialogs: {},
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

		this.initShortcuts()
		this.initChangeTracking()

		this.on('groupItems', () => this.groupItems())
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

	initChangeTracking() {
		const project = this.project
		const view = project.view

		const ChangeFlag = {
			APPEARANCE: 1 << 0,
			CHILDREN: 1 << 1,
			INSERTION: 1 << 2,
			GEOMETRY: 1 << 3,
			SEGMENTS: 1 << 4,
			STROKE: 1 << 5,
			STYLE: 1 << 6,
			ATTRIBUTE: 1 << 7,
			CONTENT: 1 << 8,
			PIXELS: 1 << 9,
			CLIPPING: 1 << 10,
			VIEW: 1 << 11
		}

		project._changes = []
		project._changesById = {}

		view.onFrame = () => {
			if (project._changes.length) {
				for (const change of project._changes) {
					const { item, flags } = change
					for (const name in ChangeFlag) {
						const mask = ChangeFlag[name]
						if (flags & mask) {
							switch (name) {
								case 'CHILDREN':
									this.emit('updateChildren')
									break
								case 'ATTRIBUTE':
									this.emit('updateAttribute')
									break
							}
						}
					}
				}
			}
			project._changes = []
			project._changesById = {}
		}
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
		this.emit('openDialog', dialog)
	}

	closeDialog(id) {
		const dialog = this.dialogs[id]
		if (!dialog) return
		dialog.open = false
		this.emit('closeDialog', dialog)
	}
}

export default new Wektor(settings)