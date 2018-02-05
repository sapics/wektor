import EventEmitter from 'event-emitter-es6'
import ChangeFlag from './ChangeFlag'
import { isFunction, isObject, isPaperItem, isInt, isString, isNumber } from '@/utils'
import paper from 'paper'

class ChangeTracker {
	constructor(project) {
		// super()
		this.project = project
		this.listeners = {}
		this.itemListeners = {}
		this.ChangeFlag = ChangeFlag
		this.enabled = true
		this.init()
	}

	init() {
		const project = this.project
		const view = project.view

		project._changes = []
		project._changesById = {}

		view.onFrame = () => {
			if (!this.enabled) return

			if (project._changes.length) {
				let changed = false
				for (const change of project._changes) {
					const { item, flags } = change

					if (item.guide && item.data.changeTracking !== true)
						continue

					for (const name in ChangeFlag) {
						const flag = ChangeFlag[name]
						if (flags & flag) {
							this.emit(flag, { ...change, flag })
							this.emit(flag, item, { ...change, flag })
						}
					}
				}
			}
			project._changes = []
			project._changesById = {}
		}
	}

	emit(flag) {
		flag = this.resolveFlag(flag)
		let listeners, payload

		if (arguments.length === 3) {
			const item = arguments[1]
			payload = arguments[2]
			listeners = this.itemListeners[flag] && this.itemListeners[flag][item.id]
		} else {
			payload = arguments[1]
			listeners = this.listeners[flag]
		}

		if (!listeners) return
		
		for (const listener of listeners) {
			const callback = listener.callback
			isFunction(callback) && callback(payload)
		}
	}

	responds(arg1, arg2, arg3) {
		if (isPaperItem(arg1)) {
			const item = arg1
			const flag = this.resolveFlag(arg2)
			const callback = arg3
			return this.getItemListener(item, flag, callback) !== undefined
		} else {
			const flag = this.resolveFlag(arg1)
			const callback = arg2
			return this.getListener(flag, callback) !== undefined
		}
	}

	on(...args) {
		this.onOff(true, ...args)
	}

	off(...args) {
		this.onOff(false, ...args)
	}

	onOff(on, arg1, arg2, arg3) {
		if (isPaperItem(arg1)) {
			const method = on ? this.addItemListener.bind(this) : this.removeItemListener.bind(this)
			const item = arg1

			if (isObject(arg2)) {
				const listeners = arg2
				for (const [flag, callback] of Object.entries(listeners)) {
					method(item, flag, callback)
				}
			} else {
				const flag = arg2
				const callback = arg3
				method(item, flag, callback)
			}
		} else if (isObject(arg1)) {
			const method = on ? this.addListener.bind(this) : this.removeListener.bind(this)
			const listeners = arg1
			for (const [flag, callback] of Object.entries(listeners))
				method(flag, callback)
		} else {
			const method = on ? this.addListener.bind(this) : this.removeListener.bind(this)
			const flag = arg1
			const callback = arg2
			method(flag, callback)
		}
	}

	addListener(flag, callback) {
		flag = this.resolveFlag(flag)

		if (!this.listeners[flag])
			this.listeners[flag] = []

		if (this.responds(flag, callback))
			return

		this.listeners[flag].push({
			flag, callback
		})
	}

	removeListener(flag, callback) {
		flag = this.resolveFlag(flag)

		const listenerIndex = this.getListenerIndex(flag, callback)
		if (listenerIndex === -1) return

		this.listeners[flag].splice(listenerIndex, 1)
		this.cleanUpListeners(flag)
	}

	getListener(flag, callback) {
		flag = this.resolveFlag(flag)

		const listeners = this.listeners[flag]
		if (!listeners) return
		return listeners.find(listener => listener.callback === callback )	
	}

	getListenerIndex(flag, callback) {
		flag = this.resolveFlag(flag)

		const listeners = this.listeners[flag]
		if (!listeners) return -1
		return listeners.findIndex(listener => listener.callback === callback )	
	}		

	addItemListener(item, flag, callback) {
		flag = this.resolveFlag(flag)

		if (!this.itemListeners[flag])
			this.itemListeners[flag] = {}

		if (!this.itemListeners[flag][item.id])
			this.itemListeners[flag][item.id] = []

		if (this.responds(item, flag, callback))
			return

		this.itemListeners[flag][item.id].push({
			flag,
			callback
		})
	}

	removeItemListener(item, flag, callback) {
		flag = this.resolveFlag(flag)

		const listenerIndex = this.getItemListenerIndex(flag, item, callback)
		if (listenerIndex === -1) return

		this.itemListeners[flag][item.id].splice(listenerIndex, 1)
		this.cleanUpListeners(flag, item)
	}

	getItemListener(item, flag, callback) {
		flag = this.resolveFlag(flag)

		const listeners = this.itemListeners[flag] && this.itemListeners[flag][item.id]
		if (!listeners) return
		return listeners.find(listener => listener.callback === callback)
	}

	getItemListenerIndex(item, flag, callback) {
		flag = this.resolveFlag(flag)

		const listeners = this.itemListeners[flag] && this.itemListeners[flag][item.id]
		if (!listeners) return -1
		return listeners.findIndex(listener => listener.callback === callback)
	}	

	cleanUpListeners(arg1, arg2) {
		if (isObject(arg1)) {
			const item = arg1
			const flag = this.resolveFlag(arg2)
			const listeners = this.itemListeners[flag] && this.itemListeners[flag][item.id]
			if (!listeners.length) delete this.itemListeners[flag][item.id]
			if (!Object.keys(this.itemListeners[flag]).length) delete this.itemListeners[flag]
		} else {
			const flag = this.resolveFlag(arg1)
			const listeners = this.listeners[flag]
			if (!listeners.length) delete this.listeners[flag]
		}
	}	

	resolveFlag(flag) {
		if (isInt(flag)) return flag
		if (isNumber(flag)) return parseInt(flag)
		if (isString(flag)) return ChangeFlag[ flag.toUpperCase() ] 
	}
}

export default ChangeTracker