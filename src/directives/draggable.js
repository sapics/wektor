function drag(el, event) {
	event.preventDefault()
	el.style.top = event.pageY - el.delta.y + 'px'
	el.style.left = event.pageX - el.delta.x + 'px'
}

function startDrag(el, event) {
	const {top, left} = el.getBoundingClientRect()
	const delta = {
		x: event.x - left,
		y: event.y - top
	}
	el.dataset.dragging = true
	el.delta = delta
	document.addEventListener('mousemove', el.dragHandler)
}

function endDrag(el) {
	el.dataset.dragging = false
	document.removeEventListener('mousemove', el.dragHandler)
}

export default {
	bind(el, binding) {
		const spec = binding.value

		el.addEventListener('mousedown', event => startDrag(el, event))
		el.addEventListener('mouseup', event => endDrag(el))
		el.dragHandler = function(event) {
			spec && spec.onDrag && spec.onDrag()
			drag(el, event)
		} 
	},

	unbind(el) {
		document.removeEventListener('mousemove', el.dragHandler)
	},
}