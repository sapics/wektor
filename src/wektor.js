import paper from 'paper'
import EventEmitter from 'event-emitter-es6'
import settings from '@/settings'
import { isArray } from '@/utils'

class Wektor extends EventEmitter {
	constructor(settings) {
		super()

		Object.assign(this, {
			target: null, // defined in setup
			tools: {},
			shortcuts: [],
			active: {
				tool: null,
			},
			settings
		})
	}

	setup(target) {
		if (target instanceof paper.Item)
			this.target = target
		else
			console.warn(`target (${target}) must a paper-item`)
	}

	initShortcuts() {
		for (const shortcut of this.settings.shortcuts) {
			this.addShortcut(shortcut)
		}
	}

	addShortcut(shortcut) {
		if (!shortcut.callback && !shortcut.emit)
			console.warn(`shortcut (${shortcut.modifier} + ${shortcut.key}) doesn't provide a callback or an emit-event-name.`)
		else if (!shortcut.callback && shortcut.emit)
			shortcut.callback = () => this.emit(shortcut.emit)

		this.shortcuts.push(shortcut)
	}

	addTool(ToolClass, spec) {
		const tool = new ToolClass(this.target, spec)

		tool.on({
			activate: () => {
				this.emit('activateTool', tool)
			},

			'open-dialog': this.openDialog,
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
}

export default new Wektor(settings)