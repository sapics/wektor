import context from './context.js'

export default {
	label: 'bezier',
	shortcut: 'b',
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
	context,
}