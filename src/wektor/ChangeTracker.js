import EventEmitter from 'event-emitter-es6'
import ChangeFlag from './ChangeFlag'
import { isFunction } from '@/utils'

class ChangeTracker extends EventEmitter {
	constructor(project) {
		super()
		this.project = project
		this.listeners = {
			itemChange: {},
		}
		this.init()
	}

	init() {
		const project = this.project
		const view = project.view

		project._changes = []
		project._changesById = {}

		view.onFrame = () => {
			if (project._changes.length) {
				let changed = false
				for (const change of project._changes) {
					const { item, flags } = change

					if (item.data.iterable === false) {
						continue
					}

					const itemChangeListener = this.listeners.itemChange[item.id]
					if (itemChangeListener) {
						const callback = itemChangeListener.callback
						if (flags & itemChangeListener.flag)
							isFunction(callback) && callback()
					}

					if (flags & (ChangeFlag.INSERTION | ChangeFlag.ATTRIBUTE)) {
						this.emit('change', change)
						changed = true
					}
				}
				changed && this.emit('changes', project._changes)
			}
			project._changes = []
			project._changesById = {}
		}
	}

	onItemChange(id, flag, callback) {
		this.listeners.itemChange[id] = {
			flag,
			callback
		}
	}

	offItemChange(id) {
		delete this.listeners.itemChange[id]
	}
}

export default ChangeTracker