import layouts from './dialogLayouts'

export default {
	shortcutModifiers: {
		default: 'alt',
		tool: false,
		detailedChange: 'meta', 
	},
	shortcutTargetExlude: [
		'input', 
		'textarea', 
		'select', 
		'button',
	],
	shortcuts: [
		{
			key: 'ArrowDown',
			modifier: 'default',
			emit: 'toolSelectNext'
		},
		{
			key: 'ArrowUp',
			modifier: 'default',
			emit: 'toolSelectPrev'
		},
		{
			key: 'g',
			modifier: 'default',
			method: 'groupItems'
		},
		{
			key: 'z',
			modifier: 'default',
			method: 'undo'
		},
		{
			key: 'y',
			modifier: 'default',
			method: 'redo'
		},
		{
			key: ['Backspace', 'Delete'],
			method: 'deleteSelection',
		},	
	],
	menu: [
		{
			'label': 'search',
			'shortcut': {
				key: 'h',
				modifier: 'default',
				callback: ({wektor}) => wektor.emit('search'),
			},
		},
		{
			'label': 'preferences',
			'shortcut': {
				key: 'p',
				modifier: 'default',
				callback: ({wektor}) => wektor.toggleDialog('preferences'),
			},
		},
		{
			'label': 'scripts',
			'shortcut': {
				key: 'i',
				modifier: 'default',
				callback: ({wektor}) => wektor.toggleShowDialog('scripts'),
			},
		},		
	],
	theme: {
		color: 'black',
		fontSize: 14, // pt
		highlightColor: 'yellow',
		input: {
			color: false,
			fontStyle: 'normal', 
		},
		dialog: {
			background: 'white',
			borderColor: 'black',
			color: false,
			fontStyle: 'normal',
		},	
	},
	history: {
		maxUndos: 80,
	},
	dialog: {
		hitOptions: {
			tolerance: 5,
			stroke: true,
			fill: true,
			match: ({item}) => item.data.iterable !== false,
		},
		margin: 20,
		keepAlive: true,
		layouts,
	},
	units: {
		whitelist: ['px'],
		allowedUnits: ['px', 'cm', 'mm'],
		decimals: 2,
	},
}