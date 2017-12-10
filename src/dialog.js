import paper from 'paper'
import { isObject, isString, isFunction, isArray, resolveObjectPath } from '@/utils'

function isComponentDescription(layout) {
	return (layout.type && isString(layout.type))
}

const reservedKeys = ['type', 'label', 'align']

function convertValues(values, layout) {
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
			Object.assign(converted, convertValues(values, layoutProp))
		} else {
			if (!reservedKeys.includes(key))
				console.warn(`Property '${key}' of layout is neither a layout-component-description nor a group object`)
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
	
	return {
		values: convertedProxy,
		layout
	}
}

export default createDialog