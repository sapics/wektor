import dialog from './dialog'

export default {
	label: 'bezier',
	shortcut: 'b',
	options: {
		pathPreview: true,
		snapToClose: {
			threshold: 5
		},
		keys: {
			'release': 'escape',
			'dragSegment': 'space',
			'asymmetricHandles': 'command',
			'independendHandles': 'alt'
		},
	},
	dialog,
}