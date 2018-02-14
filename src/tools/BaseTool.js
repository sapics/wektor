import paper from 'paper'
import wektor from '@/wektor'
import { isArray, makeUniqueId, isFunction } from '../utils.js'

function isRightClick(event) {
	return (event.event.button === 2 || event.modifiers.control) 
}

function getEventName(handlerName) {
	return handlerName.substr(2).toLowerCase()
}

function isCanvasEvent(event) {
	return (event.event.target.id === 'main-canvas')
}

class BaseTool extends paper.Tool {
	constructor(target, spec) {
		super()

		spec = Object.assign({
			cursor: 'crosshair'
		}, spec)
		this.set({ ...spec, target })

		const eventKeys = [
			'onKeyDown',
			'onKeyUp',
			'onActivate',
			'onDeactivate',
			'onOpenSettings'
		]

		for (const key of eventKeys) {
			const eventHandler = this[key]
			if (eventHandler) {
				this.on(getEventName(key), eventHandler)
			}
		}

		for (const key of ['onMouseMove', 'onMouseDrag']) {
			const eventHandler = this[key]
			if (eventHandler) {
				this.on(getEventName(key), event => {
					if (isCanvasEvent(event))
						eventHandler.bind(this)(event)
				})
			}
		}		

		for (const key of ['onMouseDown', 'onMouseUp']) {
			const eventHandler = this[key]
			if (eventHandler) {
				this.on(getEventName(key), event => {
					if (!isRightClick(event) && isCanvasEvent(event))
						eventHandler.bind(this)(event)
				})
			}
		}

		this.on('contextmenu', this.onContextMenu)
		this.on('activate', () => {
			this.activateCursor()
		})
	}

	set cursor(cursor) {
		this._cursor = cursor
		this.activateCursor(cursor)
	}

	get cursor() {
		return this._cursor
	}

	set tooltip(string) {
		this._tooltip = string
		wektor.emit('speak', string)
	}

	get tooltip() {
		return this._tooltip
	}

	activateCursor(cursor) {
		document.body.style.cursor = this.cursor
	}

	onContextMenu(event) {
		this.openDialog(event)
	}

	onDialogChange() {
		console.log('change')
	}

	openDialog(event) {
		console.log('open dialog')
		if (!this.options || !this.dialog) return

		wektor.openDialog({
			id: this.constructor.name,
			values: this.options,
			...this.dialog,
			reference: event && event.target,
			// we can't pass the handler directly because we need the right this-context
			changeHandler: (...args) => this.onDialogChange(...args)
		})
	}

	// openDialog(dialog, id) {
	// 	const values = Object.assign({}, this, this.options)
	// 	id = id
	// 		? this.constructor.name + '>' + id
	// 		: this.constructor.name + makeUniqueId()
	// 	this.emit('open-dialog', { id, values, ...dialog })
	// }

	// onOpenSettings(payload) {
	// 	if (!(this.dialogs && this.dialogs.settings)) {
	// 		console.log(`Tool ${this.label} (${this.constructor.name}) doesn't provide a settings dialog`)
	// 		return
	// 	}

	// 	this.openDialog({ ...this.dialogs.settings, payload }, 'settings')
	// }

	onlySelect(value, options) {
		this.target && this.target.deselectAll()

		const select = function(item) {
			item.selected = true

			if (options && (options.segments || options.points)) {
				for (const segment of item.segments) {
					if (options.segments)
						segment.select = true
					else if (options.points)
						segment.point.selected = true
				}
			}
		}

		if (isArray(value)) {
			for (const item of value)
				select(item)
		} else {
			select(value)
		}
	}

	select(value, options) {
		const selectParentGroups = function(item) {
			if (item.parent && item.parent.className === 'Group') {
				item.parent.selected = true
				selectParentGroups(item.parent)
			}
		}

		const select = function(item) {
			item.selected = true

			if (options.parents) selectParentGroups(item)

			if (options && (options.segments || options.points)) {
				for (const segment of item.segments) {
					if (options.segments)
						segment.select = true
					else if (options.points)
						segment.point.selected = true
				}
			}
		}

		if (isArray(value)) {
			for (const item of value)
				select(item)
		} else {
			select(value)
		}			
	}

	getHit(target, event, options, returnType = null) {
		options = Object.assign({}, {
			tolerance: 5
		}, options)

		const result = target.hitTest(event.point, options)
		if (!result)
			return false

		if (!returnType) 
			return result

		let returnObj
		if (returnType === 'handle')
			returnObj = (result.type === 'handle-in' || result.type === 'handle-out') ? result : false
		else
			returnObj = result[returnType]

		return returnObj
	}

	getHitItem(target, event, options) {
		return this.getHit(target, event, Object.assign({fill: true, stroke: true}, options), 'item')
	}

	getHitSegment(target, event, options) {
		return this.getHit(target, event, Object.assign({segments: true}, options), 'segment')
	}

	getHitHandle(target, event, options) {
		return this.getHit(target, event, Object.assign({handles: true}, options), 'handle')
	}

	// an name like "top-left" will be converted to "topLeft"
	toPropertyName(name) {
		return name.replace(/-(.)/, (match, p1) => p1.toUpperCase(p1))	
	}

	get isActive() {
		return (wektor.active.tool === this)
	}  	
}

export default BaseTool