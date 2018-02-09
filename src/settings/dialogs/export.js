export default {
	id: 'export',
	system: true,
	layout: {
		name: {
			type: 'text',
			label: 'name',
		},
		advanced: {
			type: 'folder',
			label: 'advanced',
			open: false,
			bounds: {
				type: 'select',
				label: 'bounds',
				options: ['view', 'content'],
			},			
			precision: {
				type: 'number',
				label: 'precision',
			},
			embedImages: {
				type: 'boolean',
				label: 'embed images',
			},
		},
		exportButton: {
			type: 'button',
			label: 'export',
		},
	},
}