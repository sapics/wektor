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
			label: 'search',
			shortcut: {
				key: 'h',
				modifier: '<default>',
				callback: wektor => wektor.emit('search'),
			},
		},
		{
			label: 'layers',
			shortcut: {
				key: 'y',
				modifier: '<default>',
				callback: wektor => wektor.toggleShowDialog('layers')
			},
		},
		{
			label: 'preferences',
			shortcut: {
				key: 'p',
				modifier: '<default>',
				callback: (wektor, event) => wektor.toggleShowDialog('preferences', event),
			},
		},
		{
			label: 'scripts',
			shortcut: {
				key: 'i',
				modifier: '<default>',
				callback: wektor => wektor.toggleShowDialog('scripts'),
			},
		},
		{
			label: 'export',
			shortcut: {
				key: 'e',
				modifier: '<default>',
				callback: wektor => wektor.openDialog('export'),
			}
		},	
	],
	theme: {
		color: 'black',
		fontSize: 14, // pt
		highlight: {
			background: 'aquamarine',
			color: 'black',
		},
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
			background: 'white',
			borderColor: 'black',
			color: 'black',
			fontStyle: 'italic',
			input: {
				color: 'blue',
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
		},
		margin: 20,
		keepAlive: true,
	},
	dialogs,
	scope: {
		handleSize: 5,
	},
	units: {
		groups: {
			distances: ['px', 'mm', 'cm'],
		},
		// whitelist: ['px'],
		// allowedUnits: ['px', 'cm', 'mm'],
		decimals: 2,
	},
	export: {
		name: 'wektor.svg',
		bounds: 'view',
		precision: 5,
		embedImages: true,	
	},
}