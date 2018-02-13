<template>
	<div class="wek-bubble-wrap">
		<div class="wek-bubble">{{spec.text}}</div>
		<svg class="wek-bubble-pointer" viewBox="0 0 7 10">
			<path vector-effect="non-scaling-stroke" d="M0,0c0,0,2.3,6.6,7,10c0,0-1.9-7.1-0.8-10" />
		</svg>
		<svg 
			class="wek-bubble-close" 
			viewBox="0 0 10 10"
			@click="remove"
		>
			<line vector-effect="non-scaling-stroke" x1="0" y1="0" x2="10" y2="10" />
			<line vector-effect="non-scaling-stroke" x1="10" y1="0" x2="0" y2="10" />
		</svg>
	</div>
</template>

<style lang="scss">
.wek-bubble-wrap {
	.wek-bubble {
		background: white;
		border: 1px solid black;
		border-radius: 2em;
		padding: 1em;
		min-width: 2em;
		max-width: 7em;
		hyphens: auto;
	}

	.wek-bubble-pointer {
		width: auto;
		height: 20px;
		margin-top: -1px;
		margin-left: 2em;
		fill: white;
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
export default {
	props: {
		spec: {
			type: Object,
			default: () => Object(),
		},
		bubbles: Array,
		index: Number,
	},

	created() {
		// setTimeout(this.remove, 10000)
	},

	methods: {
		remove() {
			const { bubbles, index } = this
			bubbles.splice(index, 1)
		}
	},
}
</script>