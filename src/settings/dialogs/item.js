const item = {
	layout: {
		name: {
			label: 'name',
			type: 'text',
		},
		group: {
			align: 'columns',
			stroke: {
				type: 'popup',
				'label': 'stroke',
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
				units: 'distances',				
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
			type: 'folder',
			open: false,
			label: 'advanced',
			blendMode: {
				type: 'select',
				'label': 'blend',
				options: ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'luminosity', 'color', 'add', 'subtract', 'average', 'pin-light', 'negation', 'source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'darker', 'copy', 'xor']
			},
			'wektorEffects': {
				type: 'effects',
			},		
		},	
	},			
}

export default item