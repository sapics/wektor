import paper from 'paper'

function deepExtend(out) {
	out = out || {}

	for (var i = 1; i < arguments.length; i++) {
		var obj = arguments[i]

		if (!obj) continue

		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (typeof obj[key] === 'object')
					out[key] = deepExtend(out[key], obj[key])
			else
				out[key] = obj[key]
			}
		}
	}

	return out
}

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

function isNumeric(val) {
    return Number(parseFloat(val)) === val;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
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

// function getContrast(color, alpha = true) {
// 	const { red, green, blue } = alpha ? alphaToWhite(color) : color

// 	return 1 - (0.2126 * red + 0.7152 * green + 0.0722 * blue)
// }
// 

function getLuminance(color) {
	let components = [color.red, color.green, color.blue]

	components = components.map(component => {
		return component < 0.03928 
			? component / 12.92 
			: Math.pow((component + 0.055) / 1.055, 2.4)
	})

	return 0.2126 * components[0] + 0.7152 * components[1] + 0.0722 * components[2]	
}

// function luminance(r, g, b) {
//     var colorArray = [r, g, b];
//     var colorFactor;
//     var i;
//     for (i = 0; i < colorArray.length; i++) {
//         colorFactor = colorArray[i];
//         if (colorFactor <= 0.03928) {
//             colorFactor = colorFactor / 12.92;
//         } else {
//             colorFactor = Math.pow(((colorFactor + 0.055) / 1.055), 2.4);
//         }
//         colorArray[i] = colorFactor;
//     }
//     return (colorArray[0] * 0.2126 + colorArray[1] * 0.7152 + colorArray[2] * 0.0722) // + 0.05;
// }

function getContrast(color1, color2) {
	const luminance1 = getLuminance(color1)
	const luminance2 = getLuminance(color2)
	let ratio = luminance1 / luminance2
	
	return Math.abs(luminance1 - luminance2)
}

function getBrightness(color) {
	const { red, green, blue } = (color.alpha !== undefined) ? alphaToWhite(color) : color
	return (0.2126 * red + 0.7152 * green + 0.0722 * blue)
}

// function getContrast(color1, color2) {
// 	const brightness1 = getBrightness(color1)
// 	const brightness2 = color2 ? getBrightness(color2) : 1
// 	return Math.abs(brightness2 - brightness1)
// }

function alphaToWhite(color) {
	return {
		red: 1 + (color.red - 1) * color.alpha,
		green: 1 + (color.green - 1) * color.alpha,
		blue: 1 + (color.blue - 1) * color.alpha,
	}
}

// colorToLab and getDeltaE are based on antimatter15's rgb-lab
// https://github.com/antimatter15/rgb-lab/blob/master/color.js

function colorToLab(color) {
	let { red: r, green: g, blue: b } = color
	let x, y, z

	r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
	g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
	b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

	x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
	y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
	z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

	x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116)
	y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116)
	z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116)

	return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

function getDeltaE(colorA, colorB) {
	const labA = colorToLab(colorA)
	const labB = colorToLab(colorB)
	const deltaL = labA[0] - labB[0]
	const deltaA = labA[1] - labB[1]
	const deltaB = labA[2] - labB[2]
	const c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2])
	const c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2])
	const deltaC = c1 - c2
	let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC
	deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH)
	const sc = 1.0 + 0.045 * c1
	const sh = 1.0 + 0.015 * c1
	const deltaLKlsl = deltaL / (1.0)
	const deltaCkcsc = deltaC / (sc)
	const deltaHkhsh = deltaH / (sh)
	const i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh
	const percent = i < 0 ? 0 : Math.sqrt(i)
	const factor = percent / 100
	return factor
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

function constrainElPosition(constraintBounds, elBounds, position) {
		if (elBounds.left < 0)
			position.x = 0
		else if (elBounds.right > constraintBounds.width)
			position.x = constraintBounds.width - elBounds.width

		if (elBounds.top < 0)
			position.y = 0
		else if (elBounds.bottom > constraintBounds.height)
			position.y = constraintBounds.height - elBounds.height	

		return position
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

function toCssPercent(arg, direction) {
	if (isNumber(arg) || arg.test(/px$/)) {
		const size = (direction === 'horizontal') ? window.innerWidth : window.innerHeight
		return (parseFloat(arg) / size) * 100
	} else if (arg.test(/%$/)) {
		return parseFloat(arg)
	}
}

function pointToCssPercent(point) {
	return {
		x: toCssPercent(point.x, 'horizontal'),
		y: toCssPercent(point.y, 'vertical')
	}
}

export { 
	isInt, 
	isNumeric,
	isNumber,
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
	deepExtend,
	colorToLab,
	getDeltaE,
	toCssPercent,
	pointToCssPercent,
	constrainElPosition
}