<template>
	<div
		@mousedown="onMouseDown"
	>
		<div ref="pointer"></div>
	</div>
</template>

<style lang="scss" scoped>
.pointer {
	position: absolute;
}
</style>

<script>
import { mapValue } from '@/utils'	

export default {
	props: {
		value: {},
		direction: {
			type: String,
			default: 'vertical' // 'vertical', 'horizontal' || 'both'
		},
	},

	data() {
		return {
			size: {
				width: 0,
				height: 0
			},
			pointerSize: {
				width: 0,
				height: 0,
			},
			range: {
				min: 0, max: 1
			},
			factorHorizontal: null,
			factorVertical: null
		}
	},

	computed: {
		internalValue: {
			get() {
				return this.value
			},
			set(value) {
				this.$emit('input', value)
			}
		},

		pointerPos() {
			const internalValue = this.internalValue
			let pos = {}
			let normValueX
			let normValueY

			switch (this.direction) {
				case 'horizontal':
					normValueX = this.normalizeValue(this.internalValue, this.range)
					pos.left = `calc(${normValueX} * (100% - ${this.pointerSize.width}px))`
					break

				case 'vertical':
					normValueY = this.normalizeValue(this.internalValue, this.range)
					// pos.top = normValueY * (this.size.height - this.pointerSize.height) + 'px'
					pos.top = `calc(${normValueY} * (100% - ${this.pointerSize.height}px))`
					break

				case 'both':
					normValueX = this.normalizeValue(this.internalValue.x, this.range.x)
					normValueY = this.normalizeValue(this.internalValue.y, this.range.y)
					pos = {
						left: `calc(${normValueX} * (100% - ${this.pointerSize.width}px))`,
						top: `calc(${normValueY} * (100% - ${this.pointerSize.height}px))`
					}
			}

			return pos
		},

		isHorizontal() {
			const direction = this.direction
			return direction === 'horizontal' || direction === 'both'
		},

		isVertical() {
			const direction = this.direction
			return direction === 'vertical' || direction === 'both'
		},
	},

	mounted() {
		this.setElSize()
		this.setPointerSize()
	},

	methods: {
		normalizeValue(value, range) {
			return mapValue(value, range, { min: 0, max: 1 })
		},

		setElSize() {
			const { width, height } = this.$el.getBoundingClientRect()
			this.size = {
				width, height
			}
		},

		setPointerSize() {
			const { pointer } = this.$refs
			const { width, height } = pointer.getBoundingClientRect()
			this.pointerSize = {
				width, height
			}
		},

		onMouseDown(event) {
			event.stopPropagation()
			this.bindListeners()
			this.onChange(event)
		},

		bindListeners() {
			window.addEventListener('mousemove', this.onChange)
			window.addEventListener('mouseup', this.unbindListeners)
		},

		unbindListeners(event) {
			event.stopPropagation()
			window.removeEventListener('mousemove', this.onChange)
			window.removeEventListener('mouseup', this.unbindListeners)
		},

		onChange(event) {
			event.preventDefault()

			const el = this.$el
			const {top, left, width, height} = el.getBoundingClientRect()
			const {pageX, pageY} = event
			const x = pageX - left
			const y = pageY - top
			
			const factorVertical = this.cropFactor(1 / height * y)
			const factorHorizontal = this.cropFactor(1 / width * x)

			this.factorHorizontal = factorHorizontal
			this.factorVertical = factorVertical

			let value
			switch (this.direction) {
				case 'vertical':
					value = mapValue(factorVertical, { min: 0, max: 1 }, this.range)
					break
				case 'horizontal':
					value = mapValue(factorHorizontal, { min: 0, max: 1 }, this.range)
					break
				case 'both':
					value = {
						x: mapValue(factorHorizontal, { min: 0, max: 1 }, this.range.x),
						y: mapValue(factorVertical, { min: 0, max: 1 }, this.range.y)
					}
			}

			this.internalValue = value
		},

		cropFactor(factor) {
			if (factor < 0) factor = 0
			if (factor > 1) factor = 1
			return factor			
		},		
	}	
}	
</script>