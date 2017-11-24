import paper from 'paper'
import { isArray, makeUniqueId } from '../utils.js'

class BaseTool extends paper.Tool {
	constructor(target, spec) {
		super()

		const id = makeUniqueId()
		this.set({ target, spec, id })

		const eventKeys = [
			'onMouseDown',
			'onMouseDrag',
			'onMouseMove',
			'onMouseUp',
			'onKeyDown',
			'onKeyUp',
			'onActivate',
			'onDeactivate'
		]

		for (const key of eventKeys) {
			const event = this[key]
			if (event) {
				this.on(key.substr(2).toLowerCase(), event)
			}
		}
	}

	onlySelect(value) {
		this.target && (this.target.selected = false)

		if (isArray(value)) {
			for (const item of value)
				item.selected = true
		} else {
			value.selected = true
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
}

export default BaseTool