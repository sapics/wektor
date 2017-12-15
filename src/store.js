import Vue from 'vue'
import Vuex from 'vuex'
import { isInt, isObject, filterObject } from '@/utils'
import wektor from '@/wektor'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		dialogs: {},
		active: {
			tool: null,
			dialog: null,
		},
		selection: [],
		drag: false,
	},

	mutations: {
		openDialog(state, payload) {
			const { id } = payload
			const storedDialog = state.dialogs[id] || {}

			if (!id) console.warn(`no id provided for the dialog-menu:`, payload)

			Vue.set(state.dialogs, id, { ...storedDialog, ...payload, open: true })
			state.active.dialog = state.dialogs[id]
		},

		closeDialog(state, id) {
			const dialog = state.dialogs[id]
			if (!dialog) return
			Vue.set(dialog, 'open', false)
			if (state.active.dialog.id === id) state.active.dialog = null
		},

		modifyDialog(state, { id, key, value }) {
			const dialog = state.dialogs[id]
			Vue.set(state.dialogs, id, { ...dialog, [key]: value })
		},

		setActiveTool(state, id) {
			state.active.tool = id
		},

		activateDialog(state, id) {
			state.active.dialog = id
		},

		deactivateDialog(state, id) {
			if (state.active.dialog === id)
				state.active.dialog = null
		},		

		setDrag(state, value) {
			state.drag = value
		},

		updateSelection(state, arrayOfIds) {
			state.selection = arrayOfIds
		},
	},

	getters: {
		dialogs: state => state.dialogs,

		openDialogs: (state, getters) => {
			return getters.getDialogs({ open: true })
		},

		lockedDialogs: (state, getters) => {
			return getters.getDialogs({ locked: true })
		},		

		getOpenDialog: (state, getters) => id => {
			return getters.openDialogs[id]
		},

		getDialog: (state, getters) => selector => {
			const dialogs = getters.getDialogs(selector)
			if (!dialogs) return null
			const keys = Object.keys(dialogs)
			return dialogs[keys[0]]
		},

		getDialogs: (state, getters) => selector => {
			if (isObject(selector)) {
				return filterObject(state.dialogs, (id, dialog) => {
					let match = true
					for (const [key, value] of Object.entries(selector)) {
						if (dialog[key] !== value) {
							match = false
							break
						}
					}
					return match
				})
			} else {
				const dialog = state.dialogs[selector]
				return dialog ? { [selector]: dialog } : null
			}
		},

		dialogIsOpen: (state, getters) => id => {
			return getters.getOpenDialog(id) !== undefined
		},

		itemIsSelected: (state, getters) => id => {
			return state.selection.includes(id)
		},
	},
})

export default store