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
	alt: {
		mac: '&#8997;',
	},
}

const os = bowser.mac 
	? 'mac' : bowser.windows 
		? 'windows' : null

export default {
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
			const shortcut = this.shortcut

			if (!this.shortcut.modifier) return

			const modifier = wektor.shortcuts.resolveModifierPlaceholder(this.shortcut.modifier)

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
			const narrowClass = shortcutKey === 'i'
				? 'shortcut narrow'
				: ''
			const descenderClass = shortcutKey === 'g'
				? 'low-descender'
				: 'jypq'.includes(shortcutKey)
					? 'descender'
					: ''

			let labelHtml = ''
			labelHtml += this.modifierKey ? `<span class="shortcut" style="font-size: 0.8em;">${this.modifierKey}</span>&nbsp;` : ''
			labelHtml += label.slice(0, shortcutKeyPos)
			labelHtml += `<span class="shortcut underline ${descenderClass} ${narrowClass}">${shortcutKey}</span>`
			labelHtml += label.slice(shortcutKeyPos + shortcutKey.length, label.length)

			return labelHtml							
		},
	}	
}