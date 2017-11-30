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
		drag: false,
	},

	mutations: {
		openContext(state, payload) {
			const { id } = payload
			const storedContext = state.contexts[id] || {}

			if (!id) console.warn(`no id provided for the context-menu:`, payload)

			Vue.set(state.contexts, id, { ...storedContext, ...payload, open: true })
			state.active.context = state.contexts[id]
		},

		closeContext(state, id) {
			const context = state.contexts[id]
			if (!context) return
			Vue.set(context, 'open', false)
			if (state.active.context.id === id) state.active.context = null
		},

		modifyContext(state, { id, key, value }) {
			const context = state.contexts[id]
			Vue.set(state.contexts, id, { ...context, [key]: value })
		},

		activateTool(state, tool) {
			state.active.tool = tool
		},

		activateContext(state, id) {
			state.active.context = state.contexts[id]
		},

		setDrag(state, value) {
			state.drag = value
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
			if (!contexts) return null
			const keys = Object.keys(contexts)
			return contexts[keys[0]]
		},

		getContexts: (state, getters) => selector => {
			if (isObject(selector)) {
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
			} else {
				const context = state.contexts[selector]
				return context ? { [selector]: context } : null
			}
		},

		contextIsOpen: (state, getters) => id => {
			return getters.getOpenContext(id) !== undefined
		},
	},
})

export default store