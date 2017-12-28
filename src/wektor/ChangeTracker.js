import EventEmitter from 'event-emitter-es6'
import ChangeFlag from './ChangeFlag'

class ChangeTracker extends EventEmitter {
	constructor(project) {
		super()
		this.project = project
		this.init()
	}

	init() {
		const project = this.project
		const view = project.view

		project._changes = []
		project._changesById = {}

		view.onFrame = () => {
			if (project._changes.length) {
				let changed = false
				for (const change of project._changes) {
					const { item, flags } = change

					if (item.data.iterable === false) {
						continue
					}

					if (flags & (ChangeFlag.INSERTION | ChangeFlag.ATTRIBUTE)) {
						this.emit('change', change)
						changed = true
					}
				}
				changed && this.emit('changes', project._changes)
			}
			project._changes = []
			project._changesById = {}
		}
	}
}

export default ChangeTracker