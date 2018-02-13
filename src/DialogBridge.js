import { isArray, isFunction, isString, isObject, resolveObjectPath } from '@/utils'
import paper from 'paper'
import wektor from '@/wektor'

function isComponentDescription(layout) {
	const type = layout.type
	return type && isString(type) && !['palette', 'folder', 'popup'].includes(type)
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

		function convert(value) {
			if (!value) {
				return value
			} else if (value instanceof paper.Item) {
				return { id: value.id }
			} else if (isFunction(value.toJSON)) {
				return value.toJSON()
			} else if (isArray(value)) {
				return value.map(element => convert(element))
			} else {
				return value
			}			
		}
		
		for (const [key, layoutProp] of Object.entries(layout)) {
			if (isComponentDescription(layoutProp)) {
				let { value } = resolveObjectPath(values, key)
				converted[key] = convert(value)
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
				if (value && isArray(value)) {
					const types = ['Color', 'WektorEffects']
					if (types.includes(value[0]))
						type = value[0]
				} else if (value && value._wektorPastePaperItem) {
					type = 'paperItem'
				}
				
				switch (type) {
					case 'Color': 
						rawTarget[rawKey] = paper.Color.importJSON(value)
						break
					case 'WektorEffects':
						break
					case 'paperItem':
						rawTarget[rawKey] = wektor.project.getItem({ id: value.id })
						break
					default:
						rawTarget[rawKey] = value       
				}

				if (isFunction(changeHandler)) 
					changeHandler(target, key, rawTarget[rawKey])

				target[key] = value
				return true
			}
		})
	}	
}

export default DialogBridge