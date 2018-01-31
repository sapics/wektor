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
		payload: {
			type: Object,
			default: () => Object(),
		}
	},

	computed: {
		label() {
			return this.payload.label
		},
	},
}	
</script>