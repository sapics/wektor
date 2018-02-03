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

	undo() {
		super.undo()
		this.wektor.emit('undo')
	}

	redo() {
		super.redo()
		this.wektor.emit('redo')
	}

	updateAutoHistory({item, flags}) {
		if (item.data.iterable === false) return

		// item.preventHistoryOnce ist set when when we modify an item in an undo/redo function and we don't
		// want it to cause a new history entry
		if (item.data.preventHistoryOnce === true) {
			delete item.data.preventHistoryOnce
			return
		}

		if (flags & ChangeFlag.INSERTION) {
			// insertion can also be removal, to distinguish the two we check if the item has an index.
			if (item.index === undefined)
				this.handleRemoval(item)
			else
				this.handleInsertion(item)
		}
	}

	handleInsertion(item) {
		const parentId = item.parent && item.parent.id
		const projectIndex = item.project.index

		// layers that are direct children of a project don't have a parent so their project will 
		// be treated as their parent. For now only one project is supported. Later on we'll have
		// to fetch the right project for the given projectIndex.
		const project = this.wektor.project
		const parent = parentId && project.getItem({ id: parentId })

		this.add({
			redo: () => {
				item.data.preventHistoryOnce = true

				if (parent)
					parent.addChild(item)
				else
					project.addLayer(item)
			},
			undo: () => {
				item.data.preventHistoryOnce = true
				item.remove()
			}
		})
	}

	handleRemoval(item) {
		// the state is not updated yet, so we can look for the former parent
		const itemState = this.wektor.state.flat[item.id]
		if (!itemState) {
			console.warn(`No state information for item with id '${item.id}'`)
			return
		}

		const parentId = itemState.parentId
		const projectIndex = itemState.projectIndex

		// layers that are direct children of a project don't have a parent so their project will 
		// be treated as their parent. For now only one project is supported. Later on we'll have
		// to fetch the right project for the given projectIndex.
		const project = this.wektor.project
		const parent = parentId && project.getItem({ id: parentId })

		this.add({
			redo: () => {
				item.data.preventHistoryOnce = true
				item.remove()
			},
			undo: () => {
				item.data.preventHistoryOnce = true
				if (parent)
					parent.addChild(item)
				else
					project.addLayer(item)
			}
		}) 		
	}
}

export default WektorHistory