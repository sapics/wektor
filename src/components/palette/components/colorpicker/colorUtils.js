// converters taken from paper.js' Color Class (https://github.com/paperjs/paper.js/blob/5291043a5fdd1f5191702fa8acfda570cb0b0c1a/src/style/Color.js)

// For hsb-rgb conversion, used to lookup the right parameters in the
// values array.
var hsbIndices = [
	[0, 3, 1], // 0
	[2, 0, 1], // 1
	[1, 0, 3], // 2
	[1, 2, 0], // 3
	[3, 1, 0], // 4
	[0, 1, 2]  // 5
]

var converters = {
	'rgb-hsb': function(r, g, b) {
		var max = Math.max(r, g, b),
			min = Math.min(r, g, b),
			delta = max - min,
			h = delta === 0 ? 0
				:   ( max == r ? (g - b) / delta + (g < b ? 6 : 0)
					: max == g ? (b - r) / delta + 2
					:            (r - g) / delta + 4) * 60; // max == b
		return [h, max === 0 ? 0 : delta / max, max];
	},

	'hsb-rgb': function(h, s, b) {
		// Scale h to 0..6 with modulo for negative values too
		h = (((h / 60) % 6) + 6) % 6;
		var i = Math.floor(h), // 0..5
			f = h - i,
			i = hsbIndices[i],
			v = [
				b,                      // b, index 0
				b * (1 - s),            // p, index 1
				b * (1 - s * f),        // q, index 2
				b * (1 - s * (1 - f))   // t, index 3
			];
		return [v[i[0]], v[i[1]], v[i[2]]];
	},

	// HSL code is based on:
	// http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
	'rgb-hsl': function(r, g, b) {
		var max = Math.max(r, g, b),
			min = Math.min(r, g, b),
			delta = max - min,
			achromatic = delta === 0,
			h = achromatic ? 0
				:   ( max == r ? (g - b) / delta + (g < b ? 6 : 0)
					: max == g ? (b - r) / delta + 2
					:            (r - g) / delta + 4) * 60, // max == b
			l = (max + min) / 2,
			s = achromatic ? 0 : l < 0.5
					? delta / (max + min)
					: delta / (2 - max - min);
		return [h, s, l];
	},

	'hsl-rgb': function(h, s, l) {
		// Scale h to 0..1 with modulo for negative values too
		h = (((h / 360) % 1) + 1) % 1;
		if (s === 0)
			return [l, l, l];
		var t3s = [ h + 1 / 3, h, h - 1 / 3 ],
			t2 = l < 0.5 ? l * (1 + s) : l + s - l * s,
			t1 = 2 * l - t2,
			c = [];
		for (var i = 0; i < 3; i++) {
			var t3 = t3s[i];
			if (t3 < 0) t3 += 1;
			if (t3 > 1) t3 -= 1;
			c[i] = 6 * t3 < 1
				? t1 + (t2 - t1) * 6 * t3
				: 2 * t3 < 1
					? t2
					: 3 * t3 < 2
						? t1 + (t2 - t1) * ((2 / 3) - t3) * 6
						: t1;
		}
		return c;
	},

	'rgb-gray': function(r, g, b) {
		// Using the standard NTSC conversion formula that is used for
		// calculating the effective luminance of an RGB color:
		// http://www.mathworks.com/support/solutions/en/data/1-1ASCU/index.html?solution=1-1ASCU
		return [r * 0.2989 + g * 0.587 + b * 0.114];
	},

	'gray-rgb': function(g) {
		return [g, g, g];
	},

	'gray-hsb': function(g) {
		return [0, 0, g];
	},

	'gray-hsl': function(g) {
		// TODO: Is lightness really the same as brightness for gray?
		return [0, 0, g];
	},
}

function jsonToColor(json, oldColor = {}) {
	if (!json) return

	const type = (typeof json[1] === 'string') ? json[1] : 'rgb'

	switch (type) {
		case 'rgb':
			var [, red, green, blue, alpha] = json
			var [hue, saturation, brightness] = converters['rgb-hsb'](red, green, blue)
			break
	}

	alpha = (alpha !== undefined) ? alpha : 1

	if (saturation === 0) 
		hue = oldColor.hue || 0

	if (brightness === 0)
		saturation = oldColor.saturation || 0

	if (hue === 0)
		hue = oldColor.hue || 0

	return {
		alpha, red, green, blue, hue, saturation, brightness,
	}
}

function colorToJson(color, returnType = 'rgb') {
	if (!color) return

	const colorType = color.type || 'hsb'

	switch (colorType) {
		case 'hsb':
			var { hue, saturation, brightness, alpha } = color
			var [ red, green, blue ] = converters['hsb-rgb']( hue, saturation, brightness)

			break

		case 'rgb':
			var { red, green, blue, alpha } = color
			var [ hue, saturation, brightness ] = converters['rgb-hsb'](red, green, blue)
			break
	}	

	switch (returnType) {
		case 'rgb':
			return ['Color', red, green, blue, alpha]

		case 'hsb':
			return ['Color', 'hsb', hue, saturation, brightness, alpha]
	}
}

export { converters, colorToJson, jsonToColor }