<template>
	<div id="wektor">
		<tool-bar ref="toolbar" class="tool-bar" :tools="tools"></tool-bar>
		<div ref="palettes">
			<vdialog
				v-for="(dialog, id) in openDialogs"
				:key="id"
				:id="id"
				:values="dialog.values"
				:layout="dialog.layout"
				:payload="dialog.payload"
			></vdialog>
		</div>
	</div>
</template>

<script>
import Vue from 'vue' 
import { mapGetters, mapMutations, mapState } from 'vuex'
import toolBar from './components/tool-bar.vue'
import vdialog from './components/palette/vdialog.vue'
import settings from './settings.js'
import { isArray } from './utils.js'
import wektor from '@/wektor'

export default {
	name: 'wektorUi',

	props: ['target'],

	components: { toolBar, vdialog },

	computed: {
		...mapState([
			'tools',
		]),

		...mapGetters([
			'openDialogs',
			'dialogs'
		]),

		settings() {
			return settings
		},
	},

	mounted() {
		wektor.tools[0].activate()
		document.addEventListener('keydown', this.onKeydown)
		document.addEventListener('contextmenu', this.onContextmenu)

		wektor.on('addTool', this.addTool)
		wektor.on('activateTool', this.activateTool)
	},

	methods: {
		...mapMutations([
			'openDialog',
			'addTool',
			'activateTool'
		]),

		onKeydown(event) {			
			const exlcude = settings.shortcutTargetExlude
			if (exlcude.includes(event.target.tagName.toLowerCase())) return

			let shortcutMatched = false
			for (const shortcut of wektor.shortcuts) {
				if (event.key === shortcut.key && (!shortcut.modifier || event[shortcut.modifier + 'Key'])) {
					if (shortcutMatched) console.warn('multiple shortcuts matched event')
					shortcutMatched = true
					if (shortcut.callback instanceof Function) shortcut.callback()
					event.preventDefault()
				}
			}
		},

		onContextmenu(event) {
			event.preventDefault()

			const point = { x: event.x, y: event.y }
			const hit = this.target.hitTest(point, settings.dialog.hitOptions)

			if (!hit) return
			if (!hit.item) return

			if (hit.item.dialog) {
				const dialog = hit.item.dialog
				dialog.payload = {
					referenceEl: hit.item
				}
				this.openDialog(dialog)
			} else if (['Path', 'Shape'].includes(hit.item.constructor.name) && !hit.item.data.noSelect) {
				this.openDialog({
					id: hit.item.id,
					layout: settings.dialog.layouts.item,
					values: hit.item,
					payload: {
						referenceEl: hit.item,
					}
				})
			}
		},
	},
}
</script>

<style lang="scss">
@import "./sass/fontface";
@import "./sass/variables";

@include font-face('HKGrotesk', '/static/fonts/HKGrotesk/HKGrotesk-Light', 300);
@include font-face('HKGrotesk', '/static/fonts/HKGrotesk/HKGrotesk-LightItalic', 300, italic);
@include font-face('HKGrotesk', '/static/fonts/HKGrotesk/HKGrotesk-Medium', 500);

#wektor {
	&, input, textarea, button {
		font-family: HKGrotesk;
		font-size: 14pt;
		font-weight: 300;
	}

	.tool-bar {
		position: absolute;
		top: 0;
		left: 0;
		padding: $padding;
	}
}

</style>
