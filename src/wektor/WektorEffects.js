import BaseEffect from '@/effects/BaseEffect'
import wektor from '@/wektor'
import { 
	isArray, isObject, isFunction, isString, 
	moveArrayElementToEnd, removeArrayElement, 
	makeUniqueId, getTimeStamp, 
} from '@/utils'

class WektorEffects {
	constructor(item) {
		this.item = item
		this.list = []
		wektor.changeTracker.on(item, 'insertion', change => {
			// no index means removal
			if (item.index === undefined)
				this.remove()
		})
	}

	apply() {
		if (!this.list.length) {
			this.item.opacity = 1
		}

		for (let i = 0; i < this.list.length; i++) {
			const effect = this.list[i]
			const prevEffect = this.list[i - 1]
			const input = prevEffect
				? prevEffect.output
				: this.item
			effect.input = input
		} 
	}

	add(arg1, arg2) {
		let effect

		wektor.speak(`<span class="italic">Right-click</span> the effect to open it's settings.`)

		if (isArray(arg1)) {
			const array = arg1
			for (let i = 0; i < array.length; i++) {
				this.add(array[i])	
			}
			return
		}

		if (isFunction(arg1)) {
			// class constructors are also functions
			const Constructor = arg1
			const spec = arg2
			effect = new Constructor(null, spec)
			effect.label = Constructor.label
		} else if (isObject(arg1)) {
			const spec = arg1
			effect = new BaseEffect(null, spec)
			effect.label = spec.label
		}

		const index = this.list.length
		effect.key = makeUniqueId()
		effect.original = this.item
		effect.on('remove', () => {
			removeArrayElement(this.list, effect)
			this.apply()
		})
		this.list[index] = effect
		this.apply()
	}

	toJSON() {
		const effectsJSON = this.list.map(effect => effect.toJSON())
		return [
			'WektorEffects',
			{
				list: effectsJSON,
				ownerId: this.item.id
			}
		]
	}

	remove() {
		for (let i = 0; i < this.list.length; i++) {
			const effect = this.list[i]
			effect.remove()
		} 		
	}	
}

export default WektorEffects