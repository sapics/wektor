import Vue from 'vue'
import Vuex from 'vuex'
import { isInt, isObject, filterObject } from '@/utils'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		contexts: {},
		tools: [],
		shortcuts: [],
		active: {
			tool: null,
			context: null,
		},
	},

	mutations: {
		openContext(state, payload) {
			const { id, spec } = payload

			const context = state.contexts[id]
			if (context) {
				Vue.set(state.contexts, id, {...context, ...spec, open: true})
			} else {
				Vue.set(state.contexts, id, {...spec, open: true})
			}

			state.active.context = state.contexts[id]
		},

		closeContext(state, id) {
			const context = state.contexts[id]
			if (!context) return
			Vue.set(context, 'open', false)
			if (state.active.context === context) state.active.context = null
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
			return getters.getContexts({ open: true })
		},

		lockedContexts: (state, getters) => {
			return getters.getContexts({ locked: true })
		},		

		getOpenContext: (state, getters) => id => {
			return getters.openContexts[id]
		},

		getContext: (state, getters) => selector => {
			const contexts = getters.getContexts(selector)
			return contexts && contexts[0]
		},

		getContexts: (state, getters) => selector => {
			if (isInt(selector)) {
				return state.contexts[selector]
			} else if (isObject(selector)) {
				return filterObject(state.contexts, (id, context) => {
					let match = true
					for (const [key, value] of Object.entries(selector)) {
						if (context[key] !== value) {
							match = false
							break
						}
					}
					return match
				})
			}
		},

		contextIsOpen: (state, getters) => id => {
			return getters.getOpenContext(id) !== undefined
		},
	},
})

export default store