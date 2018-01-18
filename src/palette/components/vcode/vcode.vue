<template>
	<div 
		class="palette-code"
		v-outside:mousedown="blur"
	>
		<editor
			ref="ace"
			class="palette-code-editor"
			height="100%"
			width="100%"
			theme="tomorrow"
		></editor>
		<span 
			class="palette-code-run-button"
			@click="runCode"
		>&#9656;</span>
	</div>
</template>

<style lang="scss">
.palette-code {
	width: 100%;
	height: 100%;
	isolation: isolate;

	.palette-code-run-button {
		position: absolute;
		width: 0.8em;
		top: 0.8em;
		right: 0;
		cursor: default;
		z-index: 999999999;
		color: var(--wektor-dialog-border-color);
	}

	.ace_print-margin {
		display: none;
	}

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
		border-right: 1px solid var(--wektor-dialog-border-color);
	}

	.ace_active-line {
		background: none !important;
	}
}
</style>

<script>
import paper from 'paper'
import editor from 'ace-vue2'
import baseComponent from '../baseComponent'
import 'brace/mode/javascript'
import 'brace/theme/tomorrow'
import wektor from '@/wektor'

export default {
	extends: baseComponent,

	components: { editor },

	mounted() {
		const editor = this.editor = this.$refs.ace.editor
		editor.session.$worker.send("changeOptions", [{asi: true}])
		editor.container.addEventListener('drop', this.handleDrop)
		this.$bus.$on('resize-dialog', dialogId => {
			if (dialogId === this.dialogId) {
				editor.resize()
			}
		})
	},

	methods: {
		blur() {
			this.editor.blur()
		},

		runCode() {
			const code = this.editor.getValue()
			wektor.execute(code)
		},

		handleDrop(event) {
			const text = event.dataTransfer.getData('text')
			const object = JSON.parse(text)
			if (object._wektorPastePaperItem === true) {
				const { id, paperName } = object
				const query = paperName ? `{ name: '${paperName}' }` : `{ id: ${id} }`
				this.editor.insert(`project.getItem(${query})`)
			}
		},
	},
}	
</script>