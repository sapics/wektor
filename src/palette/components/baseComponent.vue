<script>
export default {
	props: {
		id: String,
		dialogId: String,
		spec: {
			type: Object,
			default: () => Object(),
		},
		value: null,
	},

	computed: {
		payload() {
			return this.spec.payload || {}
		},

		label() {
			return this.payload.label
		},
	},
}	
</script>