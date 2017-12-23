<template>
	<div 
		class="palette-code"
		v-outside:mousedown="blur"
	>
		<editor
			ref="ace"
			class="palette-code-editor"
			:content="'test()'"
			height="100%"
			width="100%"
			theme="tomorrow"
		></editor>
	</div>
</template>

<style lang="scss">
.palette-code {
	width: 100%;
	height: 100%;

	.ace_scroller.ace_scroll-left {
		box-shadow: initial !important;
	}	

	.ace_fold-widget:hover {
		border: none;
	}

	.ace_selection {
		background-color: yellow !important;
	}

	.ace_gutter {
		border-right: 1px solid black;
	}

	.ace_active-line {
		background: none !important;
	}
}
</style>

<script>
import editor from 'ace-vue2'
import baseComponent from '../baseComponent'
import 'brace/mode/javascript'
import 'brace/theme/tomorrow'

export default {
	extends: baseComponent,

	components: { editor },

	mounted() {
		const editor = this.editor = this.$refs.ace.editor
		editor.session.$worker.send("changeOptions", [{asi: true}])
		// editor.on('focus', () => {
		// 	console.log('focus', this.dialogId)
		// })
	},

	methods: {
		blur() {
			this.editor.blur()
		}
	},
}	
</script>