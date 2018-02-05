import { isString, isObject } from '@/utils'

const inch = 2.54

// each unit needs two convertes: from the unit to px and from px to the unit
const converters = {
	'cm-px': (cm, resolution) => cm * (1 / inch) * resolution,
	'px-cm': (px, resolution) => px * inch / resolution,
	
	'mm-px': (mm, resolution) => mm / 10 * (1 / inch) * resolution,
	'px-mm': (px, resolution) => px * 10 * inch / resolution,
}

class UnitValue {
	constructor() {
		const [arg1, arg2, arg3] = arguments
		let value, unit, resolution

		if (isString(arg1)) {
			({ value, unit } = this.extract(arg1))
			resolution = arg2 || 72			
		} else if (isObject(arg1)) {
			({ value, unit } = arg1)
			resolution = arg1.resolution || 72			
		} else {
			value = arg1
			unit = arg2
			resolution = arg3			
		}

		Object.assign(this, { value, unit, resolution })
	}

	extract(string) {
		const value = parseFloat(string)
		const unit = UnitValue.extractUnit(string) || this.defaultUnit

		return {
			value,
			unit,
		}
	}

	convertTo(unit) {
		return UnitValue.convertValue(this.value, this.unit, unit, this.resolution)
	}
	
	static extractUnit(string) {
		const unit = string.replace(/([-+]?[0-9]*\.?[0-9]*)+([\S]+)?/, '$2').trim()
		return (unit !== '') && unit
	}

	static convertValue(value, from, to, resolution = 72) {
		let pxValue
		let convertedValue

		if (from === to) return value

		if (from === 'px') {
			pxValue = value
		} else {
			const toPx = converters[`${from}-px`]
			if (!toPx) {
				console.warn(`no converter defined to convert '${from}' to 'px'`)
				return false
			}
			pxValue = toPx(value, resolution)
		}
		
		if (to === 'px') {
			convertedValue = pxValue
		} else {
			const pxToUnit = converters[`px-${to}`]
			if (!pxToUnit) {
				console.warn(`no converter defined to convert 'px' to '${to}'`)
				return false
			}
			convertedValue = pxToUnit(pxValue, resolution)
		}
		
		return convertedValue
	}
}

class UnitValidator {
	constructor(options) {
		const defaultOptions = {
			defaultUnit: 'px',
			allowedUnits: ['px', 'cm', 'mm'],
			decimals: 2,
			resolution: 72,
		}
		options = Object.assign(defaultOptions, options)
		Object.assign(this, options)
	}

	format(string) {
		string = string.replace(',', '.')
		const unitValue = new UnitValue(string)
	}

	parse(string) {
		string = string.replace(',', '.')

		const unitValue = new UnitValue(string, this.resolution)

		if (!this.allowedUnits.includes(unitValue.unit)) return false

		const value = unitValue.convertTo(this.defaultUnit)
	
		return {
			value,
			unitValue: unitValue.value,
			unit: unitValue.unit
		}
	}	
}

export { UnitValue, UnitValidator, converters }