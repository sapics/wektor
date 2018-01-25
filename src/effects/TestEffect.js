import BaseEffect from './BaseEffect'

class TestEffect extends BaseEffect {
	apply() {
		if (!(this.inputItem && this.outputItem)) return
		this.outputItem.fillColor = this.inputItem.fillColor
		this.outputItem.fillColor.hue += 100
	}
}

export default TestEffect