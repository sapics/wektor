<template>
	<div 
		class="palette-drop"
		@dragover.prevent
		@drop="onDrop"
	>
		<span class="label">{{label}}:</span>&nbsp;<span>{{item.name}}</span>
	</div>
</template>

<script>
import baseComponent from './baseComponent'
import { isArray, isFunction } from '@/utils'

export default {
	extends: baseComponent,

	computed: {
		item() {
			return this.value || {}
		},

		allowedTypes() {
			return this.payload.allowedTypes || 'all'
		}
	},

	methods: {
		onDrop(event) {
			const data = event.dataTransfer.getData('text')
			const item = JSON.parse(data)

			if (this.validateDropItem(item))
				this.$emit('input', item)
		},

		validateDropItem(item) {
			const allowedTypes = this.allowedTypes

			if (allowedTypes === 'all') return true

			if (isArray(allowedTypes)) return allowedTypes.includes(item.type)

			if (isFunction(allowedTypes)) return allowedTypes(item)

			return allowedTypes === item.type
		}
	},
}	
</script>