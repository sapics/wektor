// this is syropian's vue-input-autowidth directive (https://github.com/syropian/vue-input-autowidth/)
// but with an added 'input' eventListener so it also works without vmodel
// and allowing to change the css-formatting of the input at a later point

function createMirror(el) {
	const mirror = document.createElement('span')
	mirror.classList.add(`vue-input-autowidth-mirror-${el.dataset.uuid}`)

	const styles = window.getComputedStyle(el)
	Object.assign(mirror.style, {
		position: "absolute",
		top: "-9999px",
		left: "-9999px",
		width: "auto",
		whiteSpace: "pre",
		opacity: 0,
		ariaHidden: true
	})
	updateMirror(mirror, el)

	return mirror
}

function updateMirror(mirror, el) {
	const styles = window.getComputedStyle(el)
	Object.assign(mirror.style, {
		border: styles.getPropertyValue("border"),
		fontSize: styles.getPropertyValue("font-size"),
		fontFamily: styles.getPropertyValue("font-family"),
		fontWeight: styles.getPropertyValue("font-weight"),
		fontStyle: styles.getPropertyValue("font-style"),
		fontFeatureSettings: styles.getPropertyValue("font-feature-settings"),
		fontKerning: styles.getPropertyValue("font-kerning"),
		fontStretch: styles.getPropertyValue("font-stretch"),
		fontVariant: styles.getPropertyValue("font-variant"),
		fontVariantCaps: styles.getPropertyValue("font-variant-caps"),
		fontVariantLigatures: styles.getPropertyValue("font-variant-ligatures"),
		fontVariantNumeric: styles.getPropertyValue("font-variant-numeric"),
		letterSpacing: styles.getPropertyValue("letter-spacing"),
		padding: styles.getPropertyValue("padding"),
		textTransform: styles.getPropertyValue("text-transform"),
	})
}

function checkWidth(el, binding) {
	const mirror = document.querySelector(`.vue-input-autowidth-mirror-${el.dataset.uuid}`);
	const defaults = { maxWidth: "none", minWidth: "none", comfortZone: 1 };
	const options = Object.assign({}, defaults, binding.value);

	updateMirror(mirror, el)

	el.style.maxWidth = options.maxWidth;
	el.style.minWidth = options.minWidth;

	let val = el.value;
	if (!val) {
		val = el.placeholder || "";
	}
	while (mirror.childNodes.length) {
		mirror.removeChild(mirror.childNodes[0]);
	}
	mirror.appendChild(document.createTextNode(val));
	let newWidth = mirror.getBoundingClientRect().width + options.comfortZone;

	if (newWidth != el.getBoundingClientRect().width) {
		el.style.width = `${newWidth}px`;
	}
}

export default {
	bind: function(el, binding) {
		if (el.tagName.toLocaleUpperCase() !== "INPUT") {
			throw new Error("v-input-autowidth can only be used on input elements.");
		}
		el.dataset.uuid = Math.random().toString(36).slice(-5);
	},
	inserted: function(el, binding) {
		const mirror = createMirror(el)
		document.body.appendChild(mirror)
		checkWidth(el, binding)
		el.addEventListener('input', () => {
			checkWidth(el, binding)
		})		
	},
	componentUpdated: function(el, binding) {
		checkWidth(el, binding);
	}
};