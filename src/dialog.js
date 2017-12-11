import paper from 'paper'
import { isString, isArray, isObject, isFunction, getBounds, resolveObjectPath } from '@/utils'
import wektor from '@/wektor'

function createPaperReference(item) {
	function getPosition(item) {
		const { x, y } = item.bounds.center
		return { x, y }
	}

	const reference = {
		get position() {
			return getPosition(item)
		},
		bounds: item.bounds
	}

	return reference
}

function createDomIdReference(id) {
	function getPosition(el) {
		const { x, y } = getBounds(el).center
		return { x, y }
	}

	function addListeners(el) {
		el.addEventListener('mouseenter', () => { reference.hover = true })
		el.addEventListener('mouseleave', () => { reference.hover = false })
	}

	function removeListeners() {
		el.removeEventListener('mouseenter', () => { reference.hover = true })
		el.removeEventListener('mouseleave', () => { reference.hover = false })
	}

	let el = document.getElementById(id)

	const reference = {
		update() {
			removeListeners(el)
			el = document.getElementById(id)
			addListeners(el)
		},
		get position() {
			return getPosition(el)
		}
	}
}

function createDomReference(el) {
	function getPosition(el) {
		const { x, y } = getBounds(el).center
		return { x, y }
	}

	const reference = {
		get position() {
			return getPosition(el)
		},
	}

	el.addEventListener('mouseenter', () => {
		reference.hover = true
	})
	el.addEventListener('mouseleave', () => {
		reference.hover = false
	})

	return reference
}

function createReference(arg) {
	if (arg instanceof paper.Item)
		return createPaperReference(arg)
	else if (isString(arg))
		return createDomIdReference(arg)
	else
		return createDomReference(arg)
}

function isComponentDescription(layout) {
	return (layout.type && isString(layout.type))
}

class Dialog {
	constructor({ id, parentId, values, layout, reference, payload, changeHandler }) {
		if (values._converted) {
			this.values = values
			if (changeHandler)
				console.warn(`changeHandler is already defined for values`)
		} else {
			const convertedValues = this.convertValues(values, layout)
			this.values = this.createProxy(convertedValues, values, changeHandler) 
		}

		if (reference) {
			this.reference = createReference(reference)
			const position = this.getReferenceBounds(reference).topRight
			payload = { position, ...payload }
		}

		Object.assign(this, {
			id: id.toString(),
			parentId: (parentId && parentId.toString()),
			layout,
			payload,
		})		
	}

	getReferenceBounds(arg) {
		const item = isString(arg) ? document.getElementById(arg) : arg
		return getBounds(item)
	}

	convertValues(values, layout) {
		const converted = {}
		
		for (const [key, layoutProp] of Object.entries(layout)) {
			if (isComponentDescription(layoutProp)) {
				const { value } = resolveObjectPath(values, key)

				if (value instanceof paper.Color) {
					converted[key] = value.toJSON()
				} else {
					converted[key] = value
				}        	
			} else if (isObject(layoutProp)) {
				// recursively convert nested values
				Object.assign(converted, this.convertValues(values, layoutProp))
			}
		}
		
		return converted	
	}

	createProxy(convertedValues, rawValues, changeHandler) {
		const convertedKeys = Object.keys(convertedValues)

		return new Proxy(convertedValues, {
			get(target, key) {
				if (key === '_converted')
					return true
				else
					return target[key]
			},

			set(target, key, value) {
				if (!convertedKeys.includes(key)) {
					console.warn(`can't set property '${key}' of dialog values. Dialog's layout doesn't describe this property`)
					return false   
				}
				
				const { target: rawTarget, key: rawKey } = resolveObjectPath(rawValues, key)

				let type
				if (value && isArray(value) && value[0] === 'Color') type = 'color'
				
				switch (type) {
					case 'color': 
						rawTarget[rawKey] = paper.Color.importJSON(value)
						break;
					default:
						rawTarget[rawKey] = value       
				}

				if (isFunction(changeHandler)) 
					changeHandler(target, key, value)

				target[key] = value
				return true
			}
		})
	}
}

export default Dialog