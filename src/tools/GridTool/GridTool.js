import BaseTool from '@/tools/BaseTool'
import specDefault from './spec'

class GridTool extends BaseTool {
	constructor(target, spec) {
		spec = Object.assign({}, specDefault, spec)
		super(target, spec)
	}

	onMouseDown(event) {
		this.emit('open-dialog')
	}
}

export default GridTool