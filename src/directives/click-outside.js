function isObject(a) {
    return (!!a) && (a.constructor === Object)
}

function addClickEvent(event, type = 'click') {
	document.body.addEventListener(type, event)
}

function removeClickEvent(event, type = 'click') {
	document.body.removeEventListener(type, event)
}

export default {
	bind(el, binding, vnode) {
		const value = binding.value
		const valueIsObject = isObject(value)
		const enabled = valueIsObject ? value.enabled : true
		const callback = valueIsObject ? binding.value.callback : binding.value

		el.event = function(event) {
			console.log('click outside')
			if (!(el === event.target || el.contains(event.target)))
				callback(event)
		}

		if (enabled)
			addClickEvent(el.event)
	},

	update(el, binding, vnode) {
		// if value.enabled isn't set (value is just the callback) nothing has to be updated
		if (!isObject(binding.value))
			return

		const enabled = binding.value.enabled
		const enabledOld = binding.oldValue.enabled

		if (enabled === enabledOld) 
			return

		if (enabled)
			addClickEvent(el.event)
		else
			removeClickEvent(el.event)
	},

	unbind(el) {
		removeClickEvent(el.event)
	},
}