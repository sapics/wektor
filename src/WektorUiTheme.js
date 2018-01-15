import { deepExtend } from '@/utils'

// the fontStyle property isn't the same as css's font-style property! for simplicity we'll combine font-style
// and font-weight (e.g. the fontStyle's options could be ['normal', 'italic', 'bold'])
const specDefault = {
	color: 'black',
	fontSize: 14, // pt
	highlightColor: 'yellow',
	input: {
		color: false,
		fontStyle: 'normal', 
	},
	dialog: {
		background: 'white',
		borderColor: 'black',
		color: false,
		fontStyle: 'normal',
	},
}

class WektorUiTheme {
	constructor(spec) {
		deepExtend(this, specDefault, spec)
	}

	activate() {
		const previousStyleSheet = document.getElementById('wektor-ui-theme')
		previousStyleSheet && this.removeStyleSheet(previousStyleSheet)

		this.styleSheet = document.createElement('style')
		this.styleSheet.id = "wektor-ui-theme"
		this.update()
		document.body.appendChild(this.styleSheet)
	}

	deactivate() {
		this.styleSheet && this.removeStyleSheet(this.styleSheet)
	}

	update() {
		this.styleSheet.innerHTML = `
			:root {
				--wektor-color: ${this.color};
				--wektor-input-color: ${this.input.color || this.color};
				--wektor-dialog-color: ${this.dialog.color || this.color};
				--wektor-dialog-background: ${this.dialog.background};
				--wektor-dialog-border-color: ${this.dialog.borderColor};
			}

			#wektor .highlight {
				background-color: ${this.highlightColor};
			}

			#wektor {
				color: ${this.color};
				font-size: ${this.fontSize}pt;
			}
			#wektor .dialog {
				color: ${this.dialog.color || 'inherit'};
				${this.fontStyleToCss(this.dialog.fontStyle)}
				background: ${this.dialog.background};
				border-color: ${this.dialog.borderColor};
			}
			#wektor input, .input {
				color: ${this.input.color || 'inherit'};
				font-size: ${this.fontSize}pt;
				${this.fontStyleToCss(this.input.fontStyle)}
			}
		`	
	}

	export() {
		return {
			color: this.color,
			fontSize: this.fontSize,
			input: this.input,
			dialog: this.dialog,
		}
	}

	removeStyleSheet(styleSheet) {
		styleSheet.parentNode.removeChild(styleSheet)
	}

	fontStyleToCss(value) {
		let css
		switch (value) {
			case 'normal':
			case 'italic':
				css = `font-style: ${value};`
				break
			case 'bold':
				css = `font-weight: ${value};`
				break
		}
		return css	
	}
}

export default WektorUiTheme