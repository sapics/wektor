<template>
	<div>
		x:<number 
			ref="x"
			v-model="value.x"
		></number>,
		y:<number
			ref="y"
			v-model="value.y"
		></number>
	</div>
</template>

<script type="text/javascript">
import number from './number.vue'

export default {
	props: ['value'],

	components: {number},
}
</script>