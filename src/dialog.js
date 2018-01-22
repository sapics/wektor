import paper from 'paper'
import { isString, isArray, isObject, isFunction, getBounds, resolveObjectPath } from '@/utils'
import { isEqual } from 'underscore'
import wektor from '@/wektor'
import Vue from 'vue'
import DialogBridge from './DialogBridge'

function createPaperReference(item) {
	function getPosition(item) {
		const { x, y } = item.bounds.center
		return { x, y }
	}

	const reference = {
		get position() {
			return getPosition(item)
		},
		bounds: getBounds(item)
	}

	return reference
}

function createDomIdReference(id) {
	function getPosition(el) {
		const { x, y } = getBounds(el).center
		return { x, y }
	}

	function addListeners(el) {
		el.addEventListener('mouseenter', () => { Vue.set(reference, 'hover', true) })
		el.addEventListener('mouseleave', () => { Vue.set(reference, 'hover', false) })
	}

	let el = document.getElementById(id)

	const reference = {
		update() {
			el = document.getElementById(id)
			el && addListeners(el)
			this.exists = (el !== null)
		},
		get position() {
			return el ? getPosition(el) : null
		},
		get bounds() {
			return el ? getBounds(el) : null
		},
	}
	reference.update()

	return reference
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
		bounds: getBounds(el),
	}

	el.addEventListener('mouseenter', () => {
		Vue.set(reference, 'hover', true)
	})
	el.addEventListener('mouseleave', () => {
		Vue.set(reference, 'hover', false)
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
	constructor({ id, parentId, bridge, values, layout, reference, payload, convert, changeHandler }) {
		if (!layout) {
			layout = {}
			console.warn(`No layout specified for Dialog '${id}'`)
		}

		if (reference)
			reference = createReference(reference)

		if (!bridge && convert !== false) {
			bridge = new DialogBridge(values, layout, changeHandler)
		}

		if (!bridge && convert === false)
			this.values = values

		Object.assign(this, {
			id: id.toString(),
			parentId: (parentId && parentId.toString()),
			bridge,
			layout,
			reference,
			payload,
		})		
	}	
}

// class DialogOLD {
// 	constructor({ id, parentId, values, layout, reference, payload, changeHandler, convert }) {
// 		if (isArray(values)) {
// 			const convertedValueSets = values.map(set => {
// 				const convertedValues = this.convertValues(set, layout)
// 				const proxy = this.createProxy(convertedValues, set, changeHandler)
// 				return proxy
// 			})
// 			const commonValues = {}
// 			for (const key in convertedValueSets[0]) {
// 				let common = true
// 				let value = null
// 				for (const set of convertedValueSets) {
// 					if (value !== null && !isEqual(set[key], value)) {
// 						common = false
// 						break
// 					}
// 					value = set[key]
// 				}
// 				commonValues[key] = common ? value : null
// 			}
// 			console.log(commonValues)
// 			this.values = new Proxy(commonValues, {
// 				set(target, key, value) {
// 					for (const set of convertedValueSets) {
// 						set[key] = value
// 					}
// 					return true
// 				},
// 			})
// 		} else if (values._converted || (convert === false)) {
// 			this.values = values
// 			if (changeHandler)
// 				console.warn(`changeHandler is already defined for values`)
// 		} else {
// 			if (!values.name && isFunction(values.toString)) values.name = values.toString()
// 			const convertedValues = this.convertValues(values, layout)
// 			this.values = this.createProxy(convertedValues, values, changeHandler) 
// 		}

// 		if (reference)
// 			this.reference = createReference(reference)

// 		Object.assign(this, {
// 			id: id.toString(),
// 			parentId: (parentId && parentId.toString()),
// 			layout,
// 			payload,
// 		})	
// 	}

// 	updateValues() {
// 		this.values = {
// 			fillColor: ['Color', 1, 1, 0],
// 		}
// 	}

// 	convertValues(values, layout) {
// 		const converted = {}
		
// 		for (const [key, layoutProp] of Object.entries(layout)) {
// 			if (isComponentDescription(layoutProp)) {
// 				let { value } = resolveObjectPath(values, key)

// 				if (value instanceof paper.Color) {
// 					converted[key] = value.toJSON()
// 				} else {
// 					converted[key] = value
// 				}

// 			} else if (isObject(layoutProp)) {
// 				// recursively convert nested values
// 				Object.assign(converted, this.convertValues(values, layoutProp))
// 			}
// 		}
		
// 		return converted	
// 	}

// 	createProxy(convertedValues, rawValues, changeHandler) {
// 		const convertedKeys = Object.keys(convertedValues)
// 		console.log('create proxy')

// 		return new Proxy(convertedValues, {
// 			get(target, key) {
// 				if (key === '_converted')
// 					return true
// 				else
// 					return target[key]
// 			},

// 			set(target, key, value) {
// 				if (!convertedKeys.includes(key)) {
// 					console.warn(`can't set property '${key}' of dialog values. Dialog's layout doesn't describe this property`)
// 					return true   
// 				}
				
// 				const { target: rawTarget, key: rawKey } = resolveObjectPath(rawValues, key)

// 				let type
// 				if (value && isArray(value) && value[0] === 'Color') type = 'color'
				
// 				console.log(';rpxxxxxxx')

// 				switch (type) {
// 					case 'color': 
// 						console.log('set color')
// 						rawTarget[rawKey] = paper.Color.importJSON(value)
// 						break;
// 					default:
// 						console.log(rawTarget)
// 						Vue.set(rawTarget, key, value)
// 						// rawTarget[rawKey] = value       
// 				}

// 				if (isFunction(changeHandler)) 
// 					changeHandler(target, key, value)

// 				target[key] = value
// 				return true
// 			}
// 		})
// 	}
// }

export default Dialog