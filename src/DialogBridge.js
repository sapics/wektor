import { isArray, isFunction, isString, isObject, resolveObjectPath } from '@/utils'
import paper from 'paper'

function isComponentDescription(layout) {
	return (layout.type && isString(layout.type))
}

class DialogBridge {
	constructor(rawValues, layout, changeHandler) {
		// faking private properties, so vue won't be able to watch them
		this.getPrivateProperties = () => {
			return { rawValues, layout, changeHandler }
		}

		this.update()
	}

	update() {
		const { rawValues, layout, changeHandler } = this.getPrivateProperties()
		const convertedValues = this.convertValues(rawValues, layout)
		this.values = this.createProxy(convertedValues, rawValues, changeHandler)		
	}

	convertValues(values, layout) {
		const converted = {}
		
		for (const [key, layoutProp] of Object.entries(layout)) {
			if (isComponentDescription(layoutProp)) {
				let { value } = resolveObjectPath(values, key)

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
					return true   
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

export default DialogBridge