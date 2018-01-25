import wektor from '@/wektor'

class BaseEffect {
	constructor(inputItem, spec) {
		this.inputItem = inputItem
		Object.assign(this, spec)
	}

	initOutputItem(output, input) {
		output.data.iterable = false
		wektor.changeTracker.on('segments', input, () => {
			output.segments = input.segments
		})
	}

	set inputItem(item) {
		if (this.outputItem) this.outputItem.remove()
		this._inputItem = item
		this.outputItem = item.clone()
		this.initOutputItem(this.outputItem, item)
		this.apply()
	}

	get inputItem() {
		return this._inputItem
	}

	apply() {
		// do stuff
	}
}

export default BaseEffect