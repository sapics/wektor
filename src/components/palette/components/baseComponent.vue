<script>
export default {
	props: ['value', 'label', 'id', 'contextId'],	

	mounted() {
		this.$on('change', () => {
			this.$bus.$emit(`context-${this.contextId}-change`, this.id, this.value)
		})		
	},
}	
</script>