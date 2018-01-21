import bowser from 'bowser'
import wektor from '@/wektor'
import settings from '@/settings'

// function modifierToKey(modifier) {
// 	if (modifier === 'default')
// 		modifier = settings.shortcutModifiers.default
// 	const os = bowser.mac ? 'mac' : bowser.windows ? 'windows' : null
// 	const map = {
// 		meta: {
// 			mac: 'cmd',
// 			windows: 'ctrl', // ?
// 		},
// 		shift: {
// 			mac: 'shift',
// 			windows: 'shift'
// 		},
// 	}
// 	return map[modifier] && map[modifier][os]
// }

const modifierKeyMap = {
	meta: {
		mac: 'cmd',
		windows: 'ctrl',
	},
}

const os = bowser.mac 
	? 'mac' : bowser.windows 
		? 'windows' : null

export default {
	watch: {
		'settings': {
			handler() {
				console.log('gibts doch nich')
			},
			deep: true,
		}
	},

	computed: {
		settings() {
			return wektor.settings
		},

		shortcutModifiers() {
			return this.settings.shortcutModifiers
		},

		defaultModifier() {
			return this.shortcutModifiers.default
		},

		modifierKey() {
			const { shortcut } = this
			const modifier = shortcut.modifier === 'default' ? this.defaultModifier : shortcut.modifier

			if ( !modifierKeyMap[modifier] )
				return modifier
			else
				return modifierKeyMap[modifier][os]
		},

		labelHtml() {
			const { label, shortcut } = this

			if (!label) return null
			if (!(shortcut && shortcut.key)) return this.label

			const shortcutKey = shortcut.key
			const shortcutKeyPos = label.indexOf(shortcutKey)
			let labelHtml = ''
			labelHtml += this.modifierKey ? `<span class="shortcut">${this.modifierKey}</span>&nbsp;` : ''
			labelHtml += label.slice(0, shortcutKeyPos)
			labelHtml += `<span class="shortcut">${shortcutKey}</span>`
			labelHtml += label.slice(shortcutKeyPos + shortcutKey.length, label.length)

			return labelHtml							
		},
	}	
}