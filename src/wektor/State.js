import EventEmitter from 'event-emitter-es6'
import { isArray } from '@/utils'

class WektorState extends EventEmitter {
	constructor(project) {
		super()
		this.project = project
		this.nested = null
		this.flat = null
	}

	// todo:
	// single item, replace only attributes and not the children
	update(items) {
		function convertItems(items) {
			const converted = []
			for (let i = items.length - 1; i >= 0; i--) {
				const item = items[i]
				if (item.data.iterable === false) continue
				const convertedItem = {
					id: item.id,
					parentId: (item.parent || item.project || {}).id,
					name: item.name || `${item.className} ${item.id}`,
					paperName: item.name,
					type: item.className,
					open: item.data.open,
					selected: item.selected,
					children: item.children ? convertItems(item.children) : undefined,
					_wektorPastePaperItem: true, // this lets the built-in code editor in wektor know, that when we paste the item into the editor, it'll resolve it to a reference to the item        
				}
				flat[item.id] = convertedItem
				converted.push(convertedItem)					
			}
			return converted
		}

		let flat = this.flat

		if (!items) {
			flat = {}
			this.nested = convertItems(this.project.layers)
			this.flat = flat
		} else {
			items = isArray(items) ? items : [items]
			const converted = convertItems(items)
			const con = converted[0]
			const n = this.flat[con.id]
			n.name = 'fuuuuuuu'
			console.log(this.nested)
		}

		this.emit('update', { flat: this.flat, nested: this.nested })
	}
}

export default WektorState