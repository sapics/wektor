import { wektor, ChangeFlag } from '@/wektor'

class BaseEffect {
	constructor(input, spec) {	
		this.applyOnChanges = ['segments']
		this.mirrorChanges = ['style']

		Object.assign(this, spec)

		this.input = input
	}

	set input(item) {
		if (!item) return
		if (this.output) this.output.remove()

		this._input = item
		// this.output = item.clone()

		this.output = this.updateOutput(item)
		// this.initOutput(this.output, item)
		item.opacity = 0
	}

	get input() {
		return this._input
	}

	apply(input, output) {
		// do stuff
	}

	applyAll() {
		if (!this.output) return

		const tryApply = (input, output) => {
			if (input && output)
				this.apply(input, output)
			else
				console.warn(`input's and output's children don't match`)			
		}

		if (this.output.children) {
			for (let i = 0; i < this.output.children.length; i++) {
				const input = this.input.children[i]
				const output = this.output.children[i]
				tryApply(input, output)
			}
		} else {
			tryApply(this.input, this.output)
		}
	}

	initOutput(output, input) {
		if (output.children) {
			wektor.changeTracker.on(input, 'children', () => this.updateOutput(input, output))
		} else {
			const listeners = this.createInputListeners(input, output)
			wektor.changeTracker.on(input, listeners)
			this.apply(input, output)	
		}
		output.data.init = true
		output.data.iterable = false
	}

	updateOutput(input, output, outputParent) {
		if (!input) {
			output && output.remove()
			return
		}

		if (!output) {
			output = input.clone()
			output.closed = input.closed
			if (outputParent)
				outputParent.addChild(output)
		}

		if (input.children) {
			if (!output.data.init === true)
				this.initOutput(output, input)

			for (let i = 0; i < Math.max(input.children.length, output.children.length); i++) {
				const inputChild = input.children[i]
				const outputChild = output.children[i]
				this.updateOutput(inputChild, outputChild, output)
			}
		} else {
			if (!output.data.init === true)
				this.initOutput(output, input)
		}

		return output
	}

	createInputListeners(input, output) {
		const listeners = {}

		for (const change of this.applyOnChanges) {
			const flag = wektor.changeTracker.resolveFlag(change)
			listeners[flag] = () => this.apply(input, output)
		}

		for (const change of this.mirrorChanges) {
			const flag = wektor.changeTracker.resolveFlag(change)
			switch (flag) {
				case ChangeFlag.STYLE:
					listeners[flag] = () => (output.style = input.style)
					break
				case ChangeFlag.SEGMENTS:
				case ChangeFlag.GEOMETRY:
					listeners[flag] = () => (output.segments = input.segments)
					break
				default:
					console.warn(`mirroring '${change}' changes is not supported yet. `)
			}
		}

		return listeners
	}	
}

export default BaseEffect