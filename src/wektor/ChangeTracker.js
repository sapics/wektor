import EventEmitter from 'event-emitter-es6'
import ChangeFlag from './ChangeFlag'
import { isFunction, isInt, isString } from '@/utils'

class ChangeTracker {
	constructor(project) {
		// super()
		this.project = project
		this.listeners = {}
		this.itemListeners = {}
		this.ChangeFlag = ChangeFlag
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

					if (item.data.iterable === false)
						continue

					for (const name in ChangeFlag) {
						const flag = ChangeFlag[name]
						if (flags & flag) {
							this.emit(flag)
							this.emit(flag, item)
						}
					}
				}
			}
			project._changes = []
			project._changesById = {}
		}
	}

	emit(flag, item) {
		flag = this.sanitizeFlag(flag)
		let listeners

		if (item)
			listeners = this.itemListeners[flag] && this.itemListeners[flag][item.id]
		else
			listeners = this.listeners[flag]

		if (!listeners) return
		
		for (const listener of listeners) {
			const callback = listener.callback
			isFunction(callback) && callback()
		}
	}

	responds(flag, arg1, arg2) {
		flag = this.sanitizeFlag(flag)
		let item, callback

		if (isFunction(arg1)) {
			callback = arg1
			return this.getListener(flag, callback) !== undefined
		} else {
			item = arg1
			callback = arg2
			return this.getItemListener(flag, item, callback) !== undefined
		}
	}	

	on(flag, arg1, arg2) {
		flag = this.sanitizeFlag(flag)

		if (isFunction(arg1)) {
			const callback = arg1
			this.addListener(flag, callback)
		} else {
			const item = arg1
			const callback = arg2
			this.addItemListener(flag, item, callback)
		}
	}

	off(flag, arg1, arg2) {
		flag = this.sanitizeFlag(flag)

		if (isFunction(arg1)) {
			const callback = arg1
			this.removeListener(flag, callback)
		} else {
			const item = arg1
			const callback = arg2
			this.removeItemListener(flag, item, callback)
		}
	}	

	addListener(flag, callback) {
		if (!this.listeners[flag])
			this.listeners[flag] = []

		if (this.responds(flag, callback))
			return

		this.listeners[flag].push({
			flag, callback
		})
	}

	removeListener(flag, callback) {
		const listenerIndex = this.getListenerIndex(flag, callback)
		if (listenerIndex === -1) return

		this.listeners[flag].splice(listenerIndex, 1)
		this.cleanUpListeners(flag)
	}

	getListener(flag, callback) {
		const listeners = this.listeners[flag]
		if (!listeners) return
		return listeners.find(listener => listener.callback === callback )	
	}

	getListenerIndex(flag, callback) {
		const listeners = this.listeners[flag]
		if (!listeners) return -1
		return listeners.findIndex(listener => listener.callback === callback )	
	}		

	addItemListener(flag, item, callback) {
		if (!this.itemListeners[flag])
			this.itemListeners[flag] = {}

		if (!this.itemListeners[flag][item.id])
			this.itemListeners[flag][item.id] = []

		if (this.responds(flag, item, callback))
			return

		this.itemListeners[flag][item.id].push({
			flag,
			callback
		})
	}

	removeItemListener(flag, item, callback) {
		const listenerIndex = this.getItemListenerIndex(flag, item, callback)
		if (listenerIndex === -1) return

		this.itemListeners[flag][item.id].splice(listenerIndex, 1)
		this.cleanUpListeners(flag, item)
	}

	getItemListener(flag, item, callback) {
		const listeners = this.itemListeners[flag] && this.itemListeners[flag][item.id]
		if (!listeners) return
		return listeners.find(listener => listener.callback === callback)
	}

	getItemListenerIndex(flag, item, callback) {
		const listeners = this.itemListeners[flag] && this.itemListeners[flag][item.id]
		if (!listeners) return -1
		return listeners.findIndex(listener => listener.callback === callback)
	}	

	cleanUpListeners(flag, item) {
		if (item) {
			const listeners = this.itemListeners[flag] && this.itemListeners[flag][item.id]
			if (!listeners.length) delete this.itemListeners[flag][item.id]
			if (!Object.keys(this.itemListeners[flag]).length) delete this.itemListeners[flag]
		} else {
			const listeners = this.listeners[flag]
			if (!listeners.length) delete this.listeners[flag]
		}
	}	

	// onItemChange(id, flag, callback) {
	// 	if (!this.listeners.itemChange[id])
	// 		this.listeners.itemChange[id] = []
	// 	this.listeners.itemChange[id].push({ flag, callback })
	// }

	// offItemChange(id, flag, callback) {
	// 	// delete this.listeners.itemChange[id]
	// }

	sanitizeFlag(flag) {
		return isString(flag) ? ChangeFlag[ flag.toUpperCase() ] : flag
	}
}

export default ChangeTracker