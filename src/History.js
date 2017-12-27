import { isFunction, isObject } from '@/utils'

class Command {
	undo() {
		this.execute('undo')
	}
	
	redo() {
		this.execute('redo')      
	}    
}

class AttributeCommand extends Command {
	constructor({item, attributes}) {
		super()
		Object.assign(this, arguments[0])
	}
	
	execute(action) {
		const map = {
			undo: 'from',
			redo: 'to'
		}
		
		for (const [key, description] of Object.entries(this.attributes)) {
			this.item[key] = description[ map[action] ]
		}        
	}
}

class AddChildCommand extends Command {
	constructor({parent, child, oldParent}) {
		super()
		Object.assign(this, arguments[0])
	}
	
	execute(action) {
		switch (action) {
			case 'undo':
				if (this.oldParent) {
					this.oldParent.addChild(this.child)
				}
				break
			case 'redo':
				this.parent.addChild(this.child)
				break
		}
	}
}

class History {
	constructor() {
		this.commands = []
		this.index = -1
		this.limit = 0
		this.commandTypes = {
			attribute: AttributeCommand,
			addChild: AddChildCommand,
		} 
	}
	
	add(...args) {
		if (this.index < this.commands.length - 1)
			this.commands.splice(this.index + 1, this.commands.length - this.index)   
		
		if (isObject(args[0])) {
			const command = args[0]
			this.commands.push(command)
		} else {
			const type = args[0]
			const CommandType = this.commandTypes[type]
			if (!CommandType) {
				console.warn(`There is no command of type '${type}' specified.`)
			} else { 
				args.shift() // remove the type (arg[0])
				this.commands.push(new CommandType(...args))
			}
		}
			
		if (this.limit && this.commands.length > this.limit)
			this.commands.shift()            
		
		this.index = this.commands.length - 1

		return this.commands[this.commands.length - 1]
	}
	
	execute(command, action) {
		if (!command || !isFunction(command[action])) return
		command[action]()
	}
	
	undo() {
		const command = this.commands[this.index]

		if (!command) return
		
		this.execute(command, 'undo')
		this.index--
	}
	
	redo() {
		const command = this.commands[this.index + 1]
		
		if (!command) return
		
		this.execute(command, 'redo')
		this.index++        
	}
	
	clear() {
		this.commands = []
		this.index = -1
	}
}

export default History