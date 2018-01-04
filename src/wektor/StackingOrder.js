import EventEmitter from 'event-emitter-es6'

class StackingOrder extends EventEmitter {
	constructor() {
		super()
		this.stack = []
	}

	add(element) {
		this.stack.push(element)
		this.emit('update', this.stack, 'add')
	}

	remove(element) {
		const index = this.stack.indexOf(element)
		this.stack.splice(index, 1)
		this.emit('update', this.stack, 'remove')
	}

	activate(element) {
		const stack = this.stack
		const from = stack.indexOf(element)
		const to = stack.length - 1

		if (from === to) return

		stack.splice(to, 0, stack.splice(from, 1)[0])	
		this.emit('update', stack, 'activate')
	}
}

export default StackingOrder