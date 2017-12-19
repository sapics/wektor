import paper from 'paper'
import { isArray, makeUniqueId } from '../utils.js'

class BaseTool extends paper.Tool {
	constructor(target, spec) {
		super()

		const id = makeUniqueId()
		this.set({ ...spec, target, id, })

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
	}

	openDialog(dialog, id) {
		const values = Object.assign({}, this, this.options)
		id = id
			? this.constructor.name + '>' + id
			: this.constructor.name + makeUniqueId()
		this.emit('open-dialog', { id, values, ...dialog })
	}

	onOpenSettings(payload) {
		if (!(this.dialogs && this.dialogs.settings)) {
			console.log(`Tool ${this.label} (${this.constructor.name}) doesn't provide a settings dialog`)
			return
		}

		this.openDialog({ ...this.dialogs.settings, payload }, 'settings')
	}

	onlySelect(value) {
		this.target && (this.target.selected = false)

		if (isArray(value)) {
			for (const item of value)
				this.select(item)
		} else {
			this.select(value)
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
}

export default BaseTool