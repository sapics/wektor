<template>
	<div class="palette-effects">
		<span class="label" v-if="label">{{label}}</span>
		<vselect
			class="palette-effects-select"
			:value="'add'"
			@input="addEffect($event)"
			:payload="{
				options: effectsOptions,
			}"
		></vselect>&nbsp;<span>effect</span>
		<vddl-list class="panel__body--list"
			:list="appliedEffects"
			:horizontal="false"
		>
			<effect v-for="(item, index) in appliedEffects"
				:key="item.key"
				:draggable="item"
				:index="index"
				:wrapper="appliedEffects"
				effect-allowed="move"
				:moved="handleMoved"
				:spec="item"
				:dialogId="dialogId"
			>{{item.label}}</effect>
			<vddl-placeholder style="height: 1px; background: black; width: 100%; margin-top: -1px;"></vddl-placeholder>
		</vddl-list>
	</div>
</template>

<style lang="scss" scoped>
.palette-effects {
	.palette-effects-select {
		float: left
	}
}	
</style>

<script>
import baseComponent from '../baseComponent'
import vselect from '../vselect'
import effect from './effect'
import wektor from '@/wektor'
import { isArray, makeUniqueId, moveArrayElement } from '@/utils'

export default {
	extends: baseComponent,

	components: { vselect, effect },

	computed: {
		appliedEffects() {
			return (this.value && this.value[1].list) || []
		},

		ownerId() {
			return this.value && this.value[1].ownerId
		},

		effectsOptions() {
			const effects = wektor.effects
			const options = ['add']

			for (const [id, effect] of Object.entries(effects)) {
				options.push({ id, label: effect.label || id, value: id })
			}

			return options
		},
	},

	created() {
		this.ownerItem = wektor.project.getItem({ id: this.ownerId })
	},	

	methods: {
		handleMoved(item) {
			const { index, list, draggable } = item
			list.splice(index, 1)

			const wektorEffects = this.ownerItem.wektorEffects
			const effect = wektorEffects.list.find(effect => effect.key === draggable.key)
			const to = list.findIndex(entry => entry.key === draggable.key)
			moveArrayElement(wektorEffects.list, effect, to)
		},

		addEffect(id) {
			if (id === 'add') return

			this.ownerItem.wektorEffects.add(wektor.effects[id])
		},
	},
}	
</script>
