const uiTheme = {
	'theme.font': {
		align: 'columns',
		label: 'font',
		'theme.fontSize': {
			type: 'number',
			unit: 'pt',
		},
		'theme.color': {
			type: 'color',
			label: 'color',
			return: 'css',
		},
	},
	'theme.highlightColor': {
		type: 'color',
		label: 'highlight',
		return: 'css',
	}, 
	'theme.input': {
			align: 'columns',
			label: 'input',
			'theme.input.color': {
				type: 'color',
				label: 'color',
				return: 'css',
			},
			'theme.input.fontStyle': {
				type: 'select',
				options: ['normal', 'italic', 'bold'],
			},	
	},						
	'theme.dialog': {
		label: 'dialog',
		align: 'indent',
		'theme.dialog.background': {
			type: 'color',
			label: 'background color',
			return: 'css',
		},
		'theme.dialog.borderColor': {
			type: 'color',
			label: 'border color',
			return: 'css',
		},
		'theme.dialog.font': {
			align: 'columns',
			label: 'font',
			'theme.dialog.color': {
				type: 'color',
				label: 'color',
				return: 'css',
			},
			'theme.dialog.fontStyle': {
				type: 'select',
				options: ['normal', 'italic', 'bold'],
			},			
		},
	},				
}

const preferences = {
	'shortcutModifiers.default': {
		type: 'select',
		label: 'modifier key',
		options: ['meta', 'ctrl', 'alt', 'shift'],
	},
	'theme': {
		label: 'theme',
		popup: true,
		...uiTheme
	},
}

const item = {
	folder: {
		type: 'folder',
		closed: true,
		blendMode: {
			type: 'select',
			'label': 'blend',
			options: ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'luminosity', 'color', 'add', 'subtract', 'average', 'pin-light', 'negation', 'source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'darker', 'copy', 'xor']
		},		
	},
	// name: {
	// 	label: 'name:',
	// 	type: 'text',
	// },
	// group: {
	// 	align: 'columns',
	// 	stroke: {
	// 		'label': 'stroke',
	// 		'popup': true,
	// 		'strokeWidth': {
	// 			type: 'number',
	// 			label: 'width',
	// 			unit: 'px',
	// 		},
	// 		strokeCap: {
	// 			type: 'select',
	// 			label: 'cap',
	// 			options: ['round', 'square', 'butt'],
	// 		},
	// 		strokeJoin: {
	// 			type: 'select',
	// 			label: 'join',
	// 			options: ['miter', 'round', 'bevel'],
	// 		},
	// 		miterLimit: {
	// 			type: 'number',
	// 			label: 'miter',
	// 		},						
	// 	},				
	// 	strokeWidth: {
	// 		type: 'number',
	// 		unit: 'px',
	// 	},
	// 	strokeColor: {
	// 		type: 'color',
	// 	},												
	// },
	// fillColor: {
	// 	type: 'color',
	// 	label: 'fill'
	// },
	// advanced: {
	// 	label: 'advanced',
	// 	folder: true,
	// 	open: false,
	// 	blendMode: {
	// 		type: 'select',
	// 		'label': 'blend',
	// 		options: ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'luminosity', 'color', 'add', 'subtract', 'average', 'pin-light', 'negation', 'source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'darker', 'copy', 'xor']
	// 	},
	// 	'wektorEffects': {
	// 		type: 'effects',
	// 	},		
	// },				
}

export default { item, preferences }