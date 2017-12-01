import BaseTool from '@/tools/BaseTool'
import specDefault from './spec'
import { makeUniqueId } from '@/utils.js'
import Grid from './Grid'
import paper from 'paper'

class GridTool extends BaseTool {
	constructor(target, spec) {
		spec = Object.assign({}, specDefault, spec)
		super(target, spec)
	}

	onMouseDown(event) {
		// mousedown will close our new dialog directly after we opend it so we have to stop the event
		event.stopPropagation()

		var group = new Grid()

		this.target.addChild(group)
	}
}

export default GridTool