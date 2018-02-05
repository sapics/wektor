import { wektor, ChangeFlag } from '@/wektor'
import EventEmitter from 'event-emitter-es6'

class BaseEffect extends EventEmitter {
	constructor(input, spec) {
		super()	
		this.applyOnChanges = []
		this.mirrorChanges = []

		Object.assign(this, spec)

		this.input = input
		this.id = this.constructor.name
		this.on('click', event => this.openDialog(event))
	}

	remove() {
		this.emit('remove')
		this.output.remove()
	}

	openDialog(event, spec) {
		if (!this.options || !this.dialog) return

		// console.log('opt', this.options)

		wektor.openDialog({
			id: this.constructor.name + this.key,
			values: this.options,
			...this.dialog,
			reference: event && event.target,
			// we can't pass the handler directly because we need the right this-context
			changeHandler: (...args) => this.onDialogChange(...args),
			...spec,
		})		
	}

	onDialogChange(target, key, value) {
		console.log('dialog change')
	}

	toJSON() {
		return {
			label: this.label,
			key: this.key,
			id: this.id,
			ownerId: this.original.id,
		}
	}

	set input(item) {
		if (!item) return
		if (this.output) this.output.remove()

		this._input = item
		this.output = this.updateOutput(item)

		if (item === this.original)
			item.opacity = 0
		else
			item.visible = false
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
			this.addInputListeners(input, output)
			this.apply(input, output)	
		}
		output.set({
			opacity: 1,
			visible: true,
			guide: true,
		})
		output.data.changeTracking = true
	}

	updateOutput(input, output, outputParent, newOutput = false) {
		if (!input) {
			output && output.remove()
			return
		}

		if (!output) {
			output = input.clone()
			output.closed = input.closed
			if (outputParent)
				outputParent.addChild(output)
			newOutput = true
		}

		if (input.children) {
			if (newOutput)
				this.initOutput(output, input)

			for (let i = 0; i < Math.max(input.children.length, output.children.length); i++) {
				const inputChild = input.children[i]
				const outputChild = output.children[i]
				this.updateOutput(inputChild, outputChild, output, newOutput)
			}
		} else {
			if (newOutput)
				this.initOutput(output, input)
		}

		return output
	}

	addInputListeners(input, output) {
		const changeTracker = wektor.changeTracker

		for (const change of this.applyOnChanges) {
			const flag = changeTracker.resolveFlag(change)
			changeTracker.on(input, flag, () => this.apply(input, output))
		}

		for (const change of this.mirrorChanges) {
			let flag = changeTracker.resolveFlag(change)
			flag = (flag === undefined) ? change : flag

			switch (flag) {
				case ChangeFlag.STYLE:
					changeTracker.on(input, flag, () => (output.style = input.style))
					break
				case ChangeFlag.SEGMENTS:
				case ChangeFlag.GEOMETRY:
					changeTracker.on(input, flag, () => (output.segments = input.segments))
					break
				default:
					console.warn(`mirroring '${change}' changes is not supported yet. `)
			}
		}			
	}	
}

export default BaseEffect