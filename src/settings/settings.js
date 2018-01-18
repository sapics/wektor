import layouts from './dialogLayouts'

export default {
	shortcutModifiers: {
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
			modifier: 'meta',
			emit: 'toolSelectNext'
		},
		{
			key: 'ArrowUp',
			modifier: 'meta',
			emit: 'toolSelectPrev'
		},
		{
			key: 'g',
			modifier: 'meta',
			method: 'groupItems'
		},
		{
			key: 'z',
			modifier: 'meta',
			method: 'undo'
		},
		{
			key: 'y',
			modifier: 'meta',
			method: 'redo'
		},
	],
	menu: [
		{
			'label': 'search',
			'shortcut': {
				key: 'h',
				modifier: 'meta',
				callback: ({wektor}) => wektor.emit('search'),
			},
		},
		{
			'label': 'theme',
			'shortcut': {
				key: 'e',
				modifier: 'meta',
				callback: ({wektor}) => wektor.toggleDialog('ui-theme'),
			},
		},
		{
			'label': 'scripts',
			'shortcut': {
				key: 'i',
				modifier: 'meta',
				callback: ({wektor}) => wektor.toggleShowDialog('scripts'),
			},
		},		
	],
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