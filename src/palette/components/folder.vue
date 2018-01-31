<template>
	<div class="palette-wrap palette-folder">
		<div v-if="spec.label" 
			class="palette-folder-label-wrapper"
		>
			<span class="palette-chevron">&#9656;</span>
			<span class="palette-label">{{spec.label}}</span>
		</div>
		<slot></slot>
	</div>
</template>

<script>
import baseComponent from './baseComponent'

export default {
	extends: baseComponent,
}	
</script>