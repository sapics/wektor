import paper from 'paper'

function jsonToColor(json, oldColor = {}) {
	if (!json) return

	const paperColor = new paper.Color()
	paperColor.importJSON(json)
	const type = paperColor.type // the original color-type is stored
	paperColor.type = 'hsb' // we set the paperColor's type to hsb to get the correct hsb-values

	let { red, green, blue, hue, saturation, brightness, lightness, alpha } = paperColor

	if (saturation === 0) 
		hue = oldColor.hue || 0

	if (brightness === 0)
		saturation = oldColor.saturation || 0

	if (hue === 0)
		hue = (oldColor.hue === 360) ? 360 : 0

	return { red, green, blue, hue, saturation, brightness, lightness, alpha, type }
}

function colorToJson(color) {
	if (!color) return

	const paperColor = new paper.Color({
		hue: color.hue,
		saturation: color.saturation,
		brightness: color.brightness,
		alpha: color.alpha,
	})
	paperColor.type = color.type || 'rgb'

	return paperColor.toJSON()
}

export { colorToJson, jsonToColor }