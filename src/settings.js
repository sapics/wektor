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
				blendMode: {
					type: 'select',
					'label': 'blend',
					options: ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'luminosity', 'color', 'add', 'subtract', 'average', 'pin-light', 'negation', 'source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'darker', 'copy', 'xor']
				},
				// group: {
				// 	label: 'stroke',
				// 	align: 'columns',
				// 	strokeColor: {
				// 		type: 'color',
				// 	},					
				// 	strokeWidth: {
				// 		type: 'number',
				// 	},
				// },
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