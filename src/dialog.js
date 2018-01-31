import paper from 'paper'
import { isString, isArray, isObject, isFunction, getBounds, resolveObjectPath, makeUniqueId } from '@/utils'
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
	else if (arg.id)
		return createDomIdReference(arg.id)
	else
		return createDomReference(arg)
}

function isComponentDescription(layout) {
	return (layout.type && isString(layout.type))
}

class Dialog {
	constructor(spec) {
		let id, values, bridge, layout, reference, parent, parentId, nestedIndex, rootId

		if (!spec.id) {
			id = makeUniqueId()
			console.warn(`No id specified for Dialog`)
		} else {
			id = spec.id
		}

		if (!spec.layout) {
			layout = {}
			console.warn(`No layout specified for Dialog '${id}'`)
		} else {
			layout = spec.layout
		}

		if (spec.reference) 
			reference = createReference(spec.reference)

		if (spec.parentId)
			parent = wektor.getDialog(spec.parentId)

		if (spec.parent)
			parent = spec.parent

		if (spec.values && spec.convert !== false)
			bridge = new DialogBridge(spec.values, layout, spec.changeHandler)
		else
			values = spec.values

		if (parent) {
			parentId = parent.id
			rootId = parent.rootId
			nestedIndex = parent.nestedIndex + 1
			if (!spec.values)
				bridge = parent.bridge			
		} else {
			rootId = id
			nestedIndex = 0
		}

		Object.assign(this, {
			id,
			rootId,
			parentId: spec.parentId,
			nestedIndex,
			values,
			bridge,
			layout,
			reference,
			css: spec.css,
			padding: spec.padding,
			locked: spec.locked,
			resize: spec.resize,
			stretchContent: spec.stretchContent,
		})
	}
}

export default Dialog