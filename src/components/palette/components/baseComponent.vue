<script>
export default {
	props: {
		value: null,
		id: String,
		dialogId: String,
		propKey: String,
		payload: {
			type: Object,
			default() {
				return {}
			}
		},
	},

	computed: {
		label() {
			return this.payload.label
		}
	}
}	
</script>