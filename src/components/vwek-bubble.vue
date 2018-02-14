<template>
	<div class="wek-bubble-wrap"
		v-outside:mousedown="onMouseDownOutside"
	>
		<div class="wek-bubble" 
			v-html="spec.text"
			:style="{'max-width': spec.system ? '10em' : '8em'}"
		></div>
		<svg class="wek-bubble-pointer" viewBox="0 0 7 10">
			<path vector-effect="non-scaling-stroke" d="M0,0c0,0,2.3,6.6,7,10c0,0-1.9-7.1-0.8-10" />
		</svg>
		<svg 
			class="wek-bubble-close" 
			viewBox="0 0 10 10"
			@mousedown.stop="onCloseClick"
		>
			<line vector-effect="non-scaling-stroke" x1="0" y1="0" x2="10" y2="10" />
			<line vector-effect="non-scaling-stroke" x1="10" y1="0" x2="0" y2="10" />
		</svg>
	</div>
</template>

<style lang="scss">
.wek-bubble-wrap {
	position: relative;

	.wek-bubble {
		background: aquamarine;
		border: 1px solid black;
		border-radius: 2em;
		padding: 1em;
		min-width: 2em;
		// hyphens: auto;
	}

	.wek-bubble-pointer {
		width: auto;
		height: 20px;
		margin-top: -1px;
		margin-left: 2em;
		fill: aquamarine;
		stroke: black;
	}

	.wek-bubble-close {
		display: none;
		cursor: pointer;
		position: absolute;
		top: 0;
		right: 0;
		width: 0.5em;
		height: 0.5em;
		stroke: black;
	}

	&:hover {
		.wek-bubble-close {
			display: block;
		}
	}
}	
</style>

<script type="text/javascript">
import vbutton from '@/palette/components/vbutton'

export default {
	components: {vbutton},

	props: {
		spec: {
			type: Object,
			default: () => Object(),
		},
		index: Number,
		bubbles: Array,
	},

	data() {
		return {
			removeDelay: 6 * 1000,
		}
	},

	created() {
		if (!this.spec.system) {
			this.removeAfterTimeout = false
			this.timeout = true
			this.timeoutId = setTimeout(() => { 
				this.timeout = false
				if (this.removeAfterTimeout)
					this.remove() 
			}, this.removeDelay)	
		}
	},

	methods: {
		onCloseClick(event) {
			this.remove()
		},

		onMouseDownOutside(event) {
			if (this.spec.system) return true

			if (!this.timeout)
				this.remove()
			else
				this.removeAfterTimeout = true			
		},

		remove() {
			this.bubbles.splice(this.index, 1)
		}
	},
}
</script>