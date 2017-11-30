import paper from 'paper'

function getBounds(el) {
	if (el.bounds) {
		return el.bounds
	} else if (el.getBoundingClientRect) {
		const boundingClientRect = el.getBoundingClientRect()
		const {top, left, bottom, right, width, height} = boundingClientRect
		return Object.assign(boundingClientRect, {
			topLeft: {y: top, x: left},
			topRight: {y: top, x: right},
			bottomRight: {y: bottom, x: right},
			bottomLeft: {y: bottom, x: left},
			center: {y: (top + height / 2), x: (left + width / 2)}			
		})
	}
}

function isInt(value) {
	return !isNaN(value) && parseInt(Number(value)) === value && !isNaN(parseInt(value, 10))
}

function isString(value) {
	return typeof value === 'string'
}

function isObject(value) {
	if (value === null) return false
	return (typeof value === 'function' || typeof value === 'object')
}

function isArray(value) {
	return value.constructor === Array
}

function isHtml(value) {
	return /<[a-z][\s\S]*>/i.test(value)
}

function isFunction(value) {
	return (typeof v === 'function') 
}

function toCamelCase(value) {
	return value.replace(/-(.)/, (match, p1) => {
		return p1.toUpperCase(p1)
	})	
}

function makeUniqueId() {
	return '_' + Math.random().toString(36).substr(2, 9)
}

function getUnit(string) {
	const unit = string.replace(/([-+]?[0-9]*\.?[0-9]*)+([\S]+)?/, '$2').trim()
	return unit !== '' ? unit : null
}

function toPx(value, unit, resolution = 72) {
	const inch = 2.54

	let px
	switch (unit) {
		case 'cm':
			px = value * (1 / inch) * resolution
			break
		case 'mm':
			px = value / 10 * (1 / inch) * resolution
			break
		default:
			px = value
	}

	return px
}

function toUnit(valuePx, unit, resolution = 72) {
	const inch = 2.54

	let value
	switch (unit) {
		case 'cm':
			value = valuePx * inch / resolution
			break
		case 'mm':
			value = valuePx * 10 * inch / resolution
			break
		default:
			value = valuePx
			break
	}

	return value
}

function convertUnits(value, from, to, resolution = 72) {
	const valuePx = toPx(value, from, resolution)
	return toUnit(valuePx, to, resolution)
}

function trimZeros(value) {
	return value.replace(/^0+(\d)|(\d)0+$/gm, '$1$2')
}

function round(value, decimals = 2) {
    const factor = Math.pow(10, decimals)
	return Math.round(value * factor) / factor	
}

function mapValue(value, range1, range2) {
	return (value - range1.min) * (range2.max - range2.min) / (range1.max - range1.min) + range2.min
}

function filterObject(object, fn) {
	if (!fn) return object

	return Object.keys(object).reduce((filteredObj, key) => {
		const value = object[key]
		if (fn && fn(key, value)) {
			filteredObj[key] = value
		}
		return filteredObj
	}, {})
}

function elementsOverlap(el1, el2) {
	const rect1 = el1.getBoundingClientRect()
	const rect2 = el2.getBoundingClientRect()

	return !(rect1.right < rect2.left || 
			rect1.left > rect2.right || 
			rect1.bottom < rect2.top || 
			rect1.top > rect2.bottom)
}

function getContrast(color, alpha = true) {
	const { red, green, blue } = alpha ? alphaToWhite(color) : color

	return 1 - (0.2126 * red + 0.7152 * green + 0.0722 * blue)
}

function alphaToWhite(color) {
	return new paper.Color({
		red: 1 + (color.red - 1) * color.alpha,
		green: 1 + (color.green - 1) * color.alpha,
		blue: 1 + (color.blue - 1) * color.alpha,
	})
}

export { 
	isInt, 
	isString, 
	isObject, 
	isArray, 
	isFunction, 
	isHtml, 
	toCamelCase, 
	makeUniqueId, 
	getUnit, 
	toPx, 
	toUnit, 
	trimZeros, 
	round, 
	convertUnits, 
	getBounds, 
	mapValue,
	filterObject, 
	elementsOverlap,
	getContrast,
	alphaToWhite
}