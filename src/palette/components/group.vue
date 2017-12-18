<template>
	<div class="palette">	
		<template v-for="(child, index) in children">
			<group
				v-if="child.type === 'group'"
				:key="child.key"
				:id="`${id}-${child.key}`"
				:data-id="child.key"
				:dialogId="dialogId"
				:payload="child.payload"
				:values="child.values"
				:layout="child.layout"				
			>
			</group>
			<component
				v-else
				:is="child.component"
				:key="child.key"
				:propKey="child.key"
				:id="`${id}-${child.key}`"
				:data-id="child.key"
				:dialogId="dialogId"
				:payload="child.payload"
				v-model="child.value"
			></component>			
		</template>
	</div>
</template>

<script type="text/javascript">
import palette from '../palette'

export default {
	extends: palette,
	
	name: 'group',
}
</script>