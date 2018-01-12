import BaseTool from '@/tools/BaseTool'
import Snapper from './Snapper'
import paper from 'paper'

const specDefault = {
	shortcut: 'n',
	label: 'snapper'
}

class SnapperTool extends BaseTool {
	constructor(target, spec) {
		spec = Object.assign({}, specDefault, spec)
		super(target, spec)
	}

	onMouseDown(event) {
		// mousedown will close our new dialog directly after we opend it so we have to stop the event
		event.stopPropagation()

		const snapper = new Snapper()
		snapper.openDialog(event)
	}
}

export default SnapperTool