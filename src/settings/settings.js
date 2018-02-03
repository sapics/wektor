import dialogs from './dialogs'

export default {
	shortcutModifiers: {
		default: 'alt',
		tool: false,
		detailedChange: 'meta',
		fileCommands: 'meta', 
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
			modifier: '<default>',
			callback: wektor => wektor.emit('toolSelectNext')
		},
		{
			key: 'ArrowUp',
			modifier: '<default>',
			callback: wektor => wektor.emit('toolSelectPrev')
		},
		{
			key: 'g',
			modifier: '<default>',
			callback: wektor => wektor.groupItems()
		},
		{
			key: 'z',
			modifier: '<default>',
			callback: wektor => wektor.undo()
		},
		{
			key: 'y',
			modifier: '<default>',
			callback: wektor => wektor.redo(),
			method: 'redo'
		},
		{
			key: ['Backspace', 'Delete'],
			callback: wektor => wektor.deleteSelection(),
		},
		{
			key: 's',
			modifier: '<fileCommands>',
			callback: wektor => wektor.save(),
		},	
	],
	menu: [
		{
			'label': 'search',
			'shortcut': {
				key: 'h',
				modifier: '<default>',
				callback: wektor => wektor.emit('search'),
			},
		},
		{
			label: 'layers',
			shortcut: {
				key: 'l',
				modifier: '<default>',
				callback: wektor => wektor.toggleShowDialog('layers')
			},
		},
		{
			'label': 'preferences',
			'shortcut': {
				key: 'p',
				modifier: '<default>',
				callback: wektor => wektor.toggleShowDialog('preferences'),
			},
		},
		{
			'label': 'scripts',
			'shortcut': {
				key: 'i',
				modifier: '<default>',
				callback: wektor => wektor.toggleShowDialog('scripts'),
			},
		},		
	],
	theme: {
		color: 'black',
		fontSize: 14, // pt
		highlightColor: 'yellow',
		dialog: {
			background: 'white',
			borderColor: 'black',
			color: false,
			fontStyle: 'normal',
			input: {
				color: 'blue',
				fontStyle: 'normal', 
			},			
		},
		systemDialog: {
			background: 'blue',
			borderColor: 'white',
			color: 'white',
			fontStyle: 'normal',
			input: {
				color: 'red',
				fontStyle: 'normal', 
			},		
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
	},
	dialogs,
	units: {
		groups: {
			distances: ['px', 'mm', 'cm'],
		},
		// whitelist: ['px'],
		// allowedUnits: ['px', 'cm', 'mm'],
		decimals: 2,
	},
}