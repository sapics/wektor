const uiThemeLayout = {
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
	id: 'preferences',
	layout: {
		'shortcutModifiers.default': {
			type: 'select',
			label: 'modifier key',
			options: ['meta', 'ctrl', 'alt', 'shift'],
		},
		'theme': {
			label: 'theme',
			type: 'popup',
			...uiThemeLayout,
		},
	},
}

export default preferences