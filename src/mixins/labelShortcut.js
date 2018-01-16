import bowser from 'bowser'

function modifierToKey(modifier) {
	const os = bowser.mac ? 'mac' : bowser.windows ? 'windows' : null
	const map = {
		'meta': {
			'mac': 'cmd',
			'windows': 'ctrl', // ?
		}
	}

	return map[modifier] && map[modifier][os]
}

export default {
	computed: {
		labelHtml() {
			const { label, shortcut } = this

			if (!label) return null
			if (!(shortcut && shortcut.key)) return this.label

			const shortcutKey = shortcut.key
			const shortcutKeyPos = label.indexOf(shortcutKey)
			const modifierKey = modifierToKey(shortcut.modifier)

			let labelHtml = ''
			labelHtml += modifierKey ? `<span class="shortcut">${modifierKey}</span>&nbsp;` : ''
			labelHtml += label.slice(0, shortcutKeyPos)
			labelHtml += `<span class="shortcut">${shortcutKey}</span>`
			labelHtml += label.slice(shortcutKeyPos + shortcutKey.length, label.length)

			return labelHtml			
		}
	}	
}