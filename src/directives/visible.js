function setVisibility(el, visible) {
	el.style.visibility = visible ? 'visible' : 'hidden'
}

export default {
	bind(el, binding) {
		setVisibility(el, binding.value)
	},

	update(el, binding, vnode) {
		setVisibility(el, binding.value)
	}
}