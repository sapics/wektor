export default {
	props: {
		searchQuery: String,
	},

	data() {
		return {
			searchPropKey: 'label',
			focused: null,
		}
	},

	computed: {
		filteredItems() {
			let searchQuery = this.searchQuery

			if (!searchQuery || searchQuery === '') return this.items

			searchQuery = searchQuery.toLowerCase()

			const filteredItems = this.items.filter(item => this.searchFilter(item, searchQuery))
			return filteredItems
		},
	},

	methods: {
		searchFilter(item, searchQuery) {
			const searchProperty = item[this.searchPropKey]
			return searchProperty && (searchProperty.indexOf(searchQuery) > -1)
		},

		focusItem(id) {
			this.focused = this.filteredItems[id]
		},
	},
}