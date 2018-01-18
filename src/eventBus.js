import Vue from 'vue'

const eventBus = new Vue({
	data: {
		globalLocked: false,
	},
})

export default {
	install(Vue) {
		Vue.prototype.$bus = eventBus
	}
}