const theme = {
	type: 'popup',
	label: 'theme',
	system: true,
	'theme.font': {
		align: 'columns',
		label: 'font',
		'theme.fontSize': {
			type: 'number',
			unit: 'pt',
			useUnit: false,
		},
		'theme.color': {
			type: 'color',
			label: 'color',
			return: 'css',
		},
	},
	'theme.highlight': {
		type: 'folder',
		open: true,
		label: 'highlight',
		'theme.highlight.color': {
			type: 'color',
			label: 'color',
			return: 'css',
		},
		'theme.highlight.background': {
			type: 'color',
			label: 'background color',
			return: 'css',
		},		
	},	
	dialogs: {
		type: 'folder',
		label: 'dialogs',
		open: false,
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
		'theme.dialog.input': {
				align: 'columns',
				label: 'input',
				'theme.dialog.input.color': {
					type: 'color',
					label: 'color',
					return: 'css',
				},
				'theme.dialog.input.fontStyle': {
					type: 'select',
					options: ['normal', 'italic', 'bold'],
				},	
		},		
	},
	systemDialogs: {
		type: 'folder',
		label: 'system dialogs',
		open: false,
		'theme.systemDialog.background': {
			type: 'color',
			label: 'background color',
			return: 'css',
		},
		'theme.systemDialog.borderColor': {
			type: 'color',
			label: 'border color',
			return: 'css',
		},
		'theme.systemDialog.font': {
			align: 'columns',
			label: 'font',
			'theme.systemDialog.color': {
				type: 'color',
				label: 'color',
				return: 'css',
			},
			'theme.systemDialog.fontStyle': {
				type: 'select',
				options: ['normal', 'italic', 'bold'],
			},			
		},
	},			
}

const preferences = {
	id: 'preferences',
	system: true,
	layout: {
		'shortcutModifiers.default': {
			type: 'select',
			label: 'modifier key',
			options: ['meta', 'ctrl', 'alt', 'shift'],
		},
		theme,
	},
}

export default preferences