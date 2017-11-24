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
		const {value, arg} = binding
		const eventType = arg
		const valueIsObject = isObject(value)
		const enabled = valueIsObject ? value.enabled : true
		const callback = valueIsObject ? binding.value.callback : binding.value

		el.event = function(event) {
			if (!(el === event.target || el.contains(event.target)))
				callback(event)
		}

		if (enabled)
			addClickEvent(el.event, eventType)
	},

	update(el, binding, vnode) {
		const {value, oldValue, arg} = binding

		// if value.enabled isn't set (value is just the callback) nothing has to be updated
		if (!isObject(value))
			return

		const enabled = value.enabled
		const enabledOld = oldValue.enabled
		const eventType = arg

		if (enabled === enabledOld) 
			return

		if (enabled)
			addClickEvent(el.event, eventType)
		else
			removeClickEvent(el.event, eventType)
	},

	unbind(el, binding) {
		const eventType = binding.arg
		removeClickEvent(el.event, eventType)
	},
}