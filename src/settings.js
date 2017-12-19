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
		{
			key: 'g',
			modifier: 'meta',
			emit: 'groupItems',
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
				name: {
					type: 'text',
				},
				group: {
					align: 'columns',
					stroke: {
						'label': 'stroke',
						'popup': true,
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
		}
	},
	units: {
		whitelist: ['px'],
		allowedUnits: ['px', 'cm', 'mm'],
		decimals: 2,
	},
}