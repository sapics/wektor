<template>
	<div id="wektor">
		<tool-bar ref="toolbar" class="tool-bar" :tools="tools"></tool-bar>
		<div ref="palettes">
<!-- 			<keep-alive :exclude="settings.context.keepAlive ? null : 'context'"> -->
				<context
					v-for="(context, id) in openContexts"
					:key="id"
					:id="id"
					:values="context.values"
					:layout="context.layout"
					:payload="context.payload"
				></context>
			<!-- </keep-alive> -->
		</div>
	</div>
</template>

<script>
import Vue from 'vue' 
import toolBar from './components/tool-bar.vue'
import context from './components/palette/context.vue'
import settings from './settings.js'
import {isArray} from './utils.js'

export default {
	name: 'wektor',

	props: ['target'],

	components: { toolBar, context },

	computed: {
		shortcuts() {
			return this.$bus.shortcuts
		},

		tools() {
			return this.$bus.tools
		},

		openContexts() {
			return this.$bus.openContexts
		},

		settings() {
			return settings
		}
	},

	mounted() {
		// this.target.removeChildren()
		document.addEventListener('keydown', this.onKeydown)
		document.addEventListener('contextmenu', this.onContextmenu)
		this.initShortcuts()
		this.$bus.$on('open-context', this.openContext)
		this.$bus.$on('close-context', this.closeContext)
	},

	methods: {
		initShortcuts() {
			for (const shortcut of settings.shortcuts) {
				this.addShortcut(shortcut)
			}
		},

		addShortcut(shortcut) {
			if (!shortcut.callback && !shortcut.emit)
				console.warn(`shortcut (${shortcut.modifier} + ${shortcut.key}) doesn't provide a callback or an emit-event-name.`)
			else if (!shortcut.callback && shortcut.emit)
				shortcut.callback = () => this.$bus.$emit(shortcut.emit)

			this.shortcuts.push(shortcut)
		},

		addTool(Tool, spec) {
			const tool = new Tool(this.target, spec)
			tool.on('activate', () => {
				this.$bus.active.tool = tool
			})
			tool.activate()

			this.tools.push(tool)
			this.shortcuts.push({ 
				modifier: settings.shortcutModifiers.tool,
				key: tool.spec.shortcut,
				callback: () => tool.activate(),
			})
		},

		addTools(array) {
			for (const item of array) {
				if (isArray(item))
					this.addTool(item[0], item[1])
				else
					this.addTool(item)
			}
		},

		onKeydown(event) {			
			const exlcude = settings.shortcutTargetExlude
			if (exlcude.includes(event.target.tagName.toLowerCase())) return

			let shortcutMatched = false
			for (const shortcut of this.shortcuts) {
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
			const hit = this.target.hitTest(point, settings.context.hitOptions)

			console.log({hit})

			if (!hit) return
			if (!hit.item) return

			if (['Path', 'Shape'].includes(hit.item.constructor.name)) {
				this.openContext(hit.item.id, {
					layout: settings.context.layouts.item,
					values: hit.item,
					payload: {
						referenceEl: hit.item,
					}
				})
			}
		},

		openContext(id, context) {
			Vue.set(this.openContexts, id, context)
		},

		closeContext(id) {
			this.$delete(this.openContexts, id)
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
