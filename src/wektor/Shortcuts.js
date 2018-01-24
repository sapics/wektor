import { isFunction, isArray } from '@/utils'

class Shortcuts {
	constructor(wektor) {
		this.wektor = wektor
		this.shortcuts = []
	}

	add(shortcut) {
		this.shortcuts.push(shortcut)
		return shortcut	
	}

	remove(shortcut) {
		const { shortcuts } = this
		const index = shortcuts.findIndex(item => item.key === shortcut.key && item.modifier === shortcut.modifier)
		index && shortcuts.splice(index, 1)
	}

	match(event) {
		const exlcude = this.wektor.settings.shortcutTargetExlude
		if (exlcude.includes(event.target.tagName.toLowerCase())) return

		if (['Meta', 'Alt', 'Shift', 'Control'].includes(event.key)) return

		let matchedShortcut = null

		for (const shortcut of this.shortcuts) {
			if (this.shortcutMatches(shortcut, event)) {
				if (matchedShortcut) console.warn('multiple shortcuts matched event')
				matchedShortcut = shortcut
			}
		}

		return matchedShortcut		
	}

	shortcutMatches(shortcut, event) {
		const eventKey = this.getPhysicalKey(event)

		if (!this.keyMatches(shortcut, eventKey)) return false

		if (!shortcut.modifier) {
			if (!this.eventHasModifiers(event))
				return true
			else
				return false
		}

		const modifiers = isArray(shortcut.modifier) ? shortcut.modifier : [shortcut.modifier]
		const resolvedModifiers = this.resolveModifierPlaceholders(modifiers)

		if (!this.modifiersMatch(resolvedModifiers, event)) return false

		return true	
	}

	eventHasModifiers(event) {
		return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
	}

	keyMatches(shortcut, key) {
		return isArray(shortcut.key)
			? shortcut.key.includes(key)
			: shortcut.key === key		
	}

	modifiersMatch(shortcutModifiers, event) {
		for (const modifier of ['alt', 'ctrl', 'meta', 'shift']) {
			const eventHasModifier = event[modifier + 'Key']
			const shortcutHasModifier = shortcutModifiers.includes(modifier)

			if (eventHasModifier && !shortcutHasModifier) return false
			if (!eventHasModifier && shortcutHasModifier) return false
		}
		return true
	}

	getPhysicalKey(event) {
		let key = event.code.replace(/^Key/g, '')
		key = key.length === 1 ? key.toLowerCase() : key
		return key
	}

	resolveModifierPlaceholders(modifiers) {
		return modifiers.map(modifier => this.resolveModifierPlaceholder(modifier))
	}

	resolveModifierPlaceholder(modifier) {
		const settings = this.wektor.settings
		const result = modifier.match(/^<(.*)>$/)

		if (!result) return modifier

		const placeholder = result[1]
		const replacement = settings.shortcutModifiers[placeholder]

		if (!replacement) {
			console.warn(`There is no modifier defined for placeholder '${placeholder}'`)
			return false
		}

		return replacement
	}
}

export default Shortcuts