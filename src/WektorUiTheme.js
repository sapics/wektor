import { deepExtend } from '@/utils'

// the fontStyle property isn't the same as css's font-style property! for simplicity we'll combine font-style
// and font-weight (e.g. the fontStyle's options could be ['normal', 'italic', 'bold'])
// const specDefault = {
// 	color: 'black',
// 	fontSize: 14, // pt
// 	highlightColor: 'yellow',
// 	input: {
// 		color: false,
// 		fontStyle: 'normal', 
// 	},
// 	dialog: {
// 		background: 'white',
// 		borderColor: 'black',
// 		color: false,
// 		fontStyle: 'normal',
// 	},
// }

class WektorUiTheme {
	constructor(spec) {
		this.spec = spec
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
		const { color, fontSize, dialog, systemDialog, highlightColor } = this.spec

		this.styleSheet.innerHTML = `
			:root {
				--wektor-color: ${color};
				--wektor-highlight-color: ${highlightColor};

				--wektor-dialog-color: ${dialog.color || color};
				--wektor-dialog-input-color: ${dialog.input.color || color};			
				--wektor-dialog-background: ${dialog.background};
				--wektor-dialog-border-color: ${dialog.borderColor};

				--wektor-systemDialog-color: ${systemDialog.color || color};
				--wektor-systemDialog-input-color: ${systemDialog.input.color || color};
				--wektor-systemDialog-background: ${systemDialog.background};
				--wektor-systemDialog-border-color: ${systemDialog.borderColor};				
			}

			#wektor .highlight {
				background-color: ${highlightColor};
				color: white;
			}
			#wektor {
				color: ${color};
				font-size: ${fontSize}pt;
			}		
			#wektor .dialog {
				color: ${dialog.color || 'inherit'};
				${this.fontStyleToCss(dialog.fontStyle)}
				background: ${dialog.background};
				border-color: ${dialog.borderColor};
			}
			#wektor .dialog input, #wektor .dialog .input {
				color: ${dialog.input.color || 'inherit'};				
				font-size: ${fontSize}pt;				
				${this.fontStyleToCss(dialog.input.fontStyle)}
			}
			#wektor .systemDialog {
				color: ${systemDialog.color || 'inherit'};
				${this.fontStyleToCss(systemDialog.fontStyle)}
				background: ${systemDialog.background};
				border-color: ${systemDialog.borderColor};
			}
			#wektor .systemDialog input, #wektor .systemDialog .input {
				color: ${systemDialog.input.color || 'inherit'};				
				font-size: ${fontSize}pt;				
				${this.fontStyleToCss(systemDialog.input.fontStyle)}
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