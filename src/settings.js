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
		layouts: {
			item: {
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
			},
			uiStyle: {
				layout: {
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
								options: ['normal', 'italic'],
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
								options: ['normal', 'italic'],
							},			
						},
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