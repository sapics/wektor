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
			key: 'e',
			modifier: 'meta',
			emit: 'toolSearch',			
		},
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
	],
	dialog: {
		hitOptions: {
			tolerance: 5,
			stroke: true,
			fill: true,
		},
		margin: { x: 20, y: -20 },
		keepAlive: true,
		layouts: {
			item: {
				group: {
					label: 'stroke',
					align: 'columns',
					strokeColor: {
						type: 'color',
					},					
					strokeWidth: {
						type: 'number',
					},
				},
				fillColor: {
					type: 'color',
					label: 'fill'
				},				
			}
		}
	},
	units: {
		whitelist: ['px'],
		allowedUnits: ['px', 'cm', 'mm'],
		decimals: 2,
	},
}