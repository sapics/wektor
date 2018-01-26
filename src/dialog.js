import paper from 'paper'
import { isString, isArray, isObject, isFunction, getBounds, resolveObjectPath } from '@/utils'
import { isEqual } from 'underscore'
import wektor from '@/wektor'
import Vue from 'vue'
import DialogBridge from './DialogBridge'

function createPaperReference(item) {
	function getPosition(item) {
		const { x, y } = item.bounds.center
		return { x, y }
	}

	const reference = {
		get position() {
			return getPosition(item)
		},
		get bounds() {
			return getBounds(item)
		}
	}

	return reference
}

function createDomIdReference(id) {
	function getPosition(el) {
		const { x, y } = getBounds(el).center
		return { x, y }
	}

	function addListeners(el) {
		el.addEventListener('mouseenter', () => { Vue.set(reference, 'hover', true) })
		el.addEventListener('mouseleave', () => { Vue.set(reference, 'hover', false) })
	}

	let el = document.getElementById(id)

	const reference = {
		update() {
			el = document.getElementById(id)
			el && addListeners(el)
			this.exists = (el !== null)
		},
		get position() {
			return el ? getPosition(el) : null
		},
		get bounds() {
			return el ? getBounds(el) : null
		},
	}
	reference.update()

	return reference
}

function createDomReference(el) {
	function getPosition(el) {
		const { x, y } = getBounds(el).center
		return { x, y }
	}

	const reference = {
		get position() {
			return getPosition(el)
		},
		bounds: getBounds(el),
	}

	el.addEventListener('mouseenter', () => {
		Vue.set(reference, 'hover', true)
	})
	el.addEventListener('mouseleave', () => {
		Vue.set(reference, 'hover', false)
	})

	return reference
}

function createReference(arg) {
	if (arg instanceof paper.Item)
		return createPaperReference(arg)
	else if (isString(arg))
		return createDomIdReference(arg)
	else
		return createDomReference(arg)
}

function isComponentDescription(layout) {
	return (layout.type && isString(layout.type))
}

class Dialog {
	constructor({ id, parentId, rootId, nestedIndex, bridge, values, layout, reference, payload, convert, changeHandler }) {
		if (!layout) {
			layout = {}
			console.warn(`No layout specified for Dialog '${id}'`)
		}

		if (reference)
			reference = createReference(reference)

		if (!bridge && convert !== false) {
			bridge = new DialogBridge(values, layout, changeHandler)
		}

		if (!bridge && convert === false)
			this.values = values

		Object.assign(this, {
			id,
			parentId: (parentId && parentId.toString()),
			rootId: rootId || id,
			nestedIndex: nestedIndex || 0,
			bridge,
			layout,
			reference,
			payload,
		})		
	}	
}

export default Dialog