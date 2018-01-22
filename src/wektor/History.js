import { isFunction, isObject } from '@/utils'
import ChangeFlag from './ChangeFlag'

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

class BaseHistory {
	constructor() {
		this.commands = []
		this.index = -1
		this.limit = 0
		this.enabled = true
		this.commandTypes = {
			attribute: AttributeCommand,
			addChild: AddChildCommand,
		} 
	}	
	
	add(command) {
		if (!this.enabled) return

		if (this.index < this.commands.length - 1)
			this.commands.splice(this.index + 1, this.commands.length - this.index)   
		
		this.commands.push(command)
			
		if (this.limit && this.commands.length > this.limit)
			this.commands.shift()            
		
		this.index = this.commands.length - 1

		return this.commands[this.commands.length - 1]
	}

	disable() {
		this.enabled = false
	}

	enable() {
		this.enabled = true
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

class WektorHistory extends BaseHistory {
	constructor(wektor) {
		super()
		this.wektor = wektor
	}

	updateAutoHistory({ item, flags }) {
		console.log(item, flags)

		if (item.data.iterable === false) return
		// item.preventUndoRedo ist set when when we modify an item (in an undo/redo function) and we don't
		// want it to cause a new history entry
		if (item.data.preventUndoRedo === true) {
			delete item.data.preventUndoRedo
			return
		}

		const { project, state } = this.wektor

		if (flags & ChangeFlag.INSERTION) {
			// insertion can also be removal, to distinguish the two we check if the item has a parent
			// a removed item doesn't have a parent anymore
			if (item.parent) {
				const parentId = item.parent.id
				this.add({
					redo: () => {
						const parent = project.getItem({ id: parentId })
						item.data.preventUndoRedo = true
						parent.addChild(item)
					},
					undo: () => {
						item.data.preventUndoRedo = true
						item.remove()
					}
				})
			} else {
				// state is not updated yet, so in it we can look for the former parent of item 
				const itemState = state.flat[item.id]
				const parentId = (itemState && itemState.parentId)
				this.add({
					redo: () => {
						item.data.preventUndoRedo = true
						item.remove()
					},
					undo: () => {
						item.data.preventUndoRedo = true
						const parent = project.getItem({ id: parentId })
						if (!parent)
							console.warn(`can't retrieve former parent item`)
						else
							parent.addChild(item)
					}
				})
			}
		}		
	}
}

export default WektorHistory