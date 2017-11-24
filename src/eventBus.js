import Vue from 'vue'

const eventBus = new Vue({
	data() {
		return {
			active: {
				tool: null,
			},
			tools: [],
			shortcuts: [],
			openContexts: {},
		}
	},
})

export default {
	install(Vue) {
		Vue.prototype.$bus = eventBus
	}
}