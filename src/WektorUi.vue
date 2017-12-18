<template>
	<div id="wektor">
		<tool-bar ref="toolbar" class="tool-bar" :tools="tools"></tool-bar>
		<div ref="dialogs">
			<vdialog
				v-for="(dialog, id) in dialogs"
				:key="id"
				:id="id"
				:parentId="dialog.parentId"
				:values="dialog.values"
				:layout="dialog.layout"
				:reference="dialog.reference"
				:payload="dialog.payload"
			></vdialog>
			<vdialog
				key="layers"
				:values="layers"
				:layout="{
					type: 'layers',
				}"
				:payload="{ locked: true }"
			>
			</vdialog>
		</div>
	</div>
</template>

<script>
import Vue from 'vue' 
import { mapGetters, mapMutations, mapState } from 'vuex'
import toolBar from './components/tool-bar.vue'
import vdialog from './palette/vdialog.vue'
import settings from './settings.js'
import { isArray, isFunction } from './utils.js'
import wektor from '@/wektor'
import createDialog from '@/dialog'

export default {
	name: 'wektorUi',

	props: ['target'],

	components: { toolBar, vdialog },

	data() {
		return {
			dialogs: {},
			layers: null,
		}
	},

	computed: {
		tools() {
			return wektor.tools
		},

		settings() {
			return settings
		},

		test() {
			const layers = this.layers
			return {
				layers
			}
		}
	},

	mounted() {
		document.addEventListener('keydown', this.onKeydown)
		document.addEventListener('contextmenu', this.onContextmenu)

		wektor.on('activateTool', tool => {
			this.setActiveTool(tool.id)
		})

		wektor.on('openDialog', this.openDialog)
		wektor.on('closeDialog', this.closeDialog)

		wektor.on('updateChildren', this.updateChildren)
		wektor.on('updateSelection', this.updateSelection)
	},

	methods: {
		...mapMutations([
			// 'openDialog',
			'addTool',
			'setActiveTool'
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

		updateChildren() {
			const countTypeOf = {}
			const store = this.$store

			function convertItems(items) {
				const converted = []
				for (let i = items.length - 1; i >= 0; i--) {
					const item = items[i]
					if (item.data.iterable === false) continue
					converted.push({
						id: item.id,
						name: item.name || item.toString(),
						type: item.className,
						open: item.data.open,
						children: item.children ? convertItems(item.children) : undefined	        
					})					
				}

				// for (const item of items) {
				// 	if (item.data.iterable === false) continue
				// 	// if (!item.name) {
				// 	// 	const type = item.className
				// 	// 	let count = countTypeOf[type]
				// 	// 	if (count === undefined) {
				// 	// 		count = countTypeOf[type] = 1
				// 	// 	} else {
				// 	// 		count = (countTypeOf[type] += 1)
				// 	// 	}
				// 	// 	console.log(type, countTypeOf[type])
				// 	// 	item.name = `${type} ${count}`
				// 	// }
				// 	converted.push({
				// 		id: item.id,
				// 		name: item.name || item.toString(),
				// 		type: item.className,
				// 		open: item.data.open,
				// 		children: item.children ? convertItems(item.children) : undefined	        
				// 	})
				// }
				return converted
			}

			this.layers = convertItems(wektor.project.layers)
		},

		updateSelection() {
			const selectedItems = wektor.project.selectedItems
			const ids = selectedItems.map(item => item.id)
			this.$store.commit('updateSelection', ids)
		},

		openDialog(dialog) {
			this.$set(this.dialogs, dialog.id, dialog)
		},

		closeDialog(dialog) {
			this.$delete(this.dialogs, dialog.id)
		},		

		onContextmenu(event) {
			event.preventDefault()

			const point = { x: event.x, y: event.y }
			const hit = wektor.project.hitTest(point, settings.dialog.hitOptions)

			if (!(hit && hit.item)) return

			if (hit.item.responds('contextmenu')) {
				hit.item.emit('contextmenu')
			} else {
				wektor.openDialog({
					id: hit.item.className + hit.item.id, 
					values: hit.item, 
					layout: settings.dialog.layouts.item,
					reference: hit.item,
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

	input {
		font-kerning: none;
		padding: 0;
	}

	.tool-bar {
		position: absolute;
		top: 0;
		left: 0;
		padding: $padding;
	}
}

</style>
