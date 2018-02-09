import paper from 'paper'
import wektor from '@/wektor'
import { isArray, makeUniqueId } from '../utils.js'

class BaseTool extends paper.Tool {
	constructor(target, spec) {
		super()

		spec = Object.assign({
			cursor: 'crosshair'
		}, spec)
		this.set({ ...spec, target })

		const eventKeys = [
			'onMouseDown',
			'onMouseDrag',
			'onMouseMove',
			'onMouseUp',
			'onKeyDown',
			'onKeyUp',
			'onActivate',
			'onDeactivate',
			'onOpenSettings'
		]

		for (const key of eventKeys) {
			const event = this[key]
			if (event) {
				this.on(key.substr(2).toLowerCase(), event)
			}
		}

		this.on('contextmenu', this.onContextMenu)
		this.on('activate', () => {
			this.activateCursor()
		})
	}

	set cursor(cursor) {
		this._cursor = cursor
		this.activateCursor()
	}

	get cursor() {
		return this._cursor
	}

	activateCursor() {
		document.body.style.cursor = this.cursor || 'default'
	}

	onContextMenu(event) {
		this.openDialog(event)
	}

	onDialogChange() {
		console.log('change')
	}

	openDialog(event) {
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

	select(item) {
		function selectParentGroups(item) {
			if (item.parent && item.parent.className === 'Group') {
				item.parent.selected = true
				selectParentGroups(item.parent)
			}
		}

		item.selected = true
		selectParentGroups(item)
	}

	getHit(target, event, options, returnType = null) {
		options = Object.assign({}, {
			tolerance: 5
		}, options)

		const result = target.hitTest(event.point, options)
		if (!result)
			return false

		if (result.item && result.item.data.noSelect) return false

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