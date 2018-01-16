const item = {
	name: {
		label: 'name:',
		type: 'text',
	},
	group: {
		align: 'columns',
		stroke: {
			'label': 'stroke',
			'popup': true,
			'strokeWidth': {
				type: 'number',
				label: 'width',
				unit: 'px',
			},
			strokeCap: {
				type: 'select',
				label: 'cap',
				options: ['round', 'square', 'butt'],
			},
			strokeJoin: {
				type: 'select',
				label: 'join',
				options: ['miter', 'round', 'bevel'],
			},
			miterLimit: {
				type: 'number',
				label: 'miter',
			},						
		},				
		strokeWidth: {
			type: 'number',
			unit: 'px',
		},
		strokeColor: {
			type: 'color',
		},												
	},
	fillColor: {
		type: 'color',
		label: 'fill'
	},
	advanced: {
		blendMode: {
			type: 'select',
			'label': 'blend',
			options: ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'luminosity', 'color', 'add', 'subtract', 'average', 'pin-light', 'negation', 'source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'darker', 'copy', 'xor']
		},			
	},				
}

const uiTheme = {
	font: {
		align: 'columns',
		label: 'font',
		fontSize: {
			type: 'number',
			unit: 'pt',
		},
		color: {
			type: 'color',
			label: 'color',
			return: 'css',
		},
	},
	highlightColor: {
		type: 'color',
		label: 'highlight',
		return: 'css',
	}, 
	input: {
			align: 'columns',
			label: 'input',
			'input.color': {
				type: 'color',
				label: 'color',
				return: 'css',
			},
			'input.fontStyle': {
				type: 'select',
				options: ['normal', 'italic', 'bold'],
			},	
	},						
	dialog: {
		label: 'dialog',
		align: 'indent',
		'dialog.background': {
			type: 'color',
			label: 'background color',
			return: 'css',
		},
		'dialog.borderColor': {
			type: 'color',
			label: 'border color',
			return: 'css',
		},
		font: {
			align: 'columns',
			label: 'font',
			'dialog.color': {
				type: 'color',
				label: 'color',
				return: 'css',
			},
			'dialog.fontStyle': {
				type: 'select',
				options: ['normal', 'italic', 'bold'],
			},			
		},
	},				
}

export default { item, uiTheme }