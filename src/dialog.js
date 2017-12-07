import paper from 'paper'
import { isObject, isFunction, isArray, resolveObjectPath } from '@/utils'

function convertValues(values, layout) {
	const converted = {}
	
	for (const [key, layoutProp] of Object.entries(layout)) {
		if (layoutProp.type && layoutProp.type !== 'group') {
			const { value } = resolveObjectPath(values, key)

			if (value instanceof paper.Color) {
				converted[key] = value.toJSON()
			} else {
				converted[key] = value
			}        	
		} else if (isObject(layoutProp)) {
			// recursively convert nested values
			Object.assign(converted, convertValues(values, layoutProp))
		} else {
			console.warn(`Property '${key}'' of layout is neither a layout-component-description nor a group object`)
		}
	}
	
	return converted
}

function createDialog(rawValues, layout, changeHandler) {
	const convertedValues = convertValues(rawValues, layout)
	const convertedKeys = Object.keys(convertedValues)
	
	const convertedProxy = new Proxy(convertedValues, {
		set(target, key, value) {
			if (!convertedKeys.includes(key)) {
				console.warn(`can't set property '${key}' of dialog values. Dialog's layout doesn't describe this property`)
				return false   
			}
			
			const { target: rawTarget, key: rawKey } = resolveObjectPath(rawValues, key)
			
			if (isFunction(changeHandler)) 
				changeHandler(target, key, value)

			let type
			if (isArray(value) && value[0] === 'Color') type = 'color'
			
			switch (type) {
				case 'color': 
					rawTarget[rawKey] = paper.Color.importJSON(value)
					break;
				default:
					rawTarget[rawKey] = value       
			}

			target[key] = value
			return true
		}
	})
	
	return {
		values: convertedProxy,
		layout
	}
}

// function createDialog(values, layout, changeHandler) {
// 	function resolveValues() {
// 		const { values, layout, changeHandler } = this
// 		const resolvedValues = {}

// 		for (let [key, value] of Object.entries(layout)) {
// 			const prop = values[key]

// 			if (prop instanceof paper.Color) {
// 				resolvedValues[key] = prop.toJSON()
// 			} else {
// 				resolvedValues[key] = prop
// 			}
// 		}

// 		return new Proxy(resolvedValues, {
// 			set(target, key, value) {
// 				target[key] = value

// 				if (isFunction(changeHandler)) 
// 					changeHandler(target, key, value)

// 				let type
// 				if (isArray(value) && value[0] === 'Color') type = 'color'

// 				switch (type) {
// 					case 'color':
// 						values[key] = paper.Color.importJSON(value)
// 						break

// 					default:
// 						values[key] = value
// 				}

// 				return true
// 			}
// 		})
// 	}
// }

export default createDialog