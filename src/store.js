import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		contexts: {},
		tools: [],
		shortcuts: [],
		active: {
			tool: null,
		},
	},

	mutations: {
		openContext(state, payload) {
			const { id, spec } = payload

			if (state.contexts[id])
				Vue.set(state.contexts[id], 'open', true)
			else
				Vue.set(state.contexts, id, {...spec, open: true})
		},

		closeContext(state, id) {
			const context = state.contexts[id]
			if (context)
				Vue.set(context, 'open', false)
		},

		modifyContext(state, { id, key, value }) {
			const context = state.contexts[id]
			Vue.set(state.contexts, id, { ...context, [key]: value })
		},

		activateTool(state, tool) {
			state.active.tool = tool
		},
	},

	getters: {
		contexts: state => state.contexts,

		openContexts: (state, getters) => {
			return Object.keys(state.contexts).reduce((obj, key) => {
				const context = state.contexts[key]
				if (context.open) {
					obj[key] = context
				}
				return obj
			}, {})
		},

		getOpenContext: (state, getters) => id => {
			return getters.openContexts[id]
		},

		getContext: (state, getters) => id => {
			return state.contexts[id]
		},

		contextIsOpen: (state, getters) => id => {
			return getters.getOpenContext(id) !== undefined
		},
	},
})

export default store