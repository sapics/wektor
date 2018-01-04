import paper from 'paper'

function getBounds(el) {
	if (el.bounds) {
		var { top, topLeft, topRight, topCenter, bottom, bottomLeft, bottomRight, bottomCenter, left, leftCenter, right, rightCenter, x, y, width, height, center } = el.bounds 
		return {
			top,
			topLeft: { x: topLeft.x, y: topLeft.y },
			topRight: { x: topRight.x, y: topRight.y },
			topCenter: { x: topCenter.x, y: topCenter.y },
			bottom,
			bottomLeft: { x: bottomLeft.x, y: bottomLeft.y },
			bottomRight: { x: bottomRight.x, y: bottomRight.y },
			bottomCenter: { x: bottomCenter.x, y: bottomCenter.y },
			left,
			leftCenter: { x: leftCenter.x, y: leftCenter.y },
			right,
			rightCenter: { x: rightCenter.x, y: rightCenter.y },
			x,
			y,
			width,
			height,
			center: { x: center.x, y: center.y },
		}
	} else if (el.getBoundingClientRect) {
		const boundingClientRect = el.getBoundingClientRect()
		var {top, left, bottom, right, width, height} = boundingClientRect
		return Object.assign(boundingClientRect, {
			topLeft: { y: top, x: left },
			topRight: { y: top, x: right },
			bottomLeft: { y: bottom, x: left },
			bottomRight: { y: bottom, x: right },
			leftCenter: { y: (top + height / 2), x: left },
			topCenter: { y: top, x: (left + width / 2) },
			rightCenter: { y: (top + height / 2), x: right },
			center: { y: (top + height / 2), x: (left + width / 2) }			
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
	if (!value) return false
	return value.constructor === Array
}

function isHtml(value) {
	return /<[a-z][\s\S]*>/i.test(value)
}

function isFunction(value) {
	return (typeof value === 'function') 
}

function toCamelCase(value) {
	return value.replace(/-(.)/, (match, p1) => {
		return p1.toUpperCase(p1)
	})	
}

function makeUniqueId() {
	return '_' + Math.random().toString(36).substr(2, 9)
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
	return {
		red: 1 + (color.red - 1) * color.alpha,
		green: 1 + (color.green - 1) * color.alpha,
		blue: 1 + (color.blue - 1) * color.alpha,
	}
}

function resolvePropertyPath(obj, str, resolveKey = true) {
    let segments = str.split('.')
    
    if (resolveKey) {
        return segments.reduce(resolve, obj || self)
    } else {
        const key = segments[segments.length - 1]
        segments = segments.slice(0, -1)
        return {
            obj: segments.reduce(resolve, obj || self),
            key: key,
        }
    }
    
    function resolve(prev, curr) {
        return prev ? prev[curr] : undefined
    }
}

function resolveObjectPath(obj, path) {
    function resolve(prev, curr) {
        return prev ? prev[curr] : undefined
    }
    
    const segments = path.split('.')
    const key = segments[segments.length - 1]
    const targetSegments = segments.slice(0, -1)
    const target = targetSegments.reduce(resolve, obj || self)
    const value = target[key]
    
    return {
        target,
        key,
        value
    }
}

function isInViewport(arg) {
	if (!arg) return

	const { top, left, bottom, right } = (arg.getBoundingClientRect ? arg.getBoundingClientRect() : arg)

	return (
		top >= 0 &&
		left >= 0 &&
		bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		right <= (window.innerWidth || document.documentElement.clientWidth)
	)
}

function getDistance(point1, point2) {
	const a = point1.x - point2.x
	const b = point1.y - point2.y
	const c = Math.sqrt( a * a + b * b )
	return c
}

function moveArrayElementToEnd(array, element) {
	const from = array.indexOf(element)
	const to = array.length - 1
	array.splice(to, 0, array.splice(from, 1)[0])
	return array
}

function removeArrayElement(array, element) {
	
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
	trimZeros, 
	round,  
	getBounds, 
	mapValue,
	filterObject, 
	elementsOverlap,
	getContrast,
	alphaToWhite,
	resolvePropertyPath,
	resolveObjectPath,
	isInViewport,
	getDistance,
	moveArrayElementToEnd,
}