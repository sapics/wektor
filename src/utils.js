function getBounds(el) {
	if (el.bounds) {
		return el.bounds
	} else if (el.getBoundingClientRect) {
		const boundingClientRect = el.getBoundingClientRect()
		const {top, left, bottom, right, width, height} = boundingClientRect
		return Object.assign({}, boundingClientRect, {
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

export { isInt, isString, isObject, isArray, isFunction, isHtml, toCamelCase, makeUniqueId, getUnit, toPx, toUnit, trimZeros, round, convertUnits, getBounds }