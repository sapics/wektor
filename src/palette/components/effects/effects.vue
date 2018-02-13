<template>
	<div class="palette-effects"
		tabindex="0" 
		@keydown.delete.stop="removeEffect(selectedEffect)"
	>
		<span class="label" v-if="label">{{label}}</span>
		<vselect
			class="palette-effects-select"
			:value="'add'"
			@input="addEffect($event)"
			:payload="{
				options: effectsOptions,
			}"
		></vselect>&nbsp;<span>effect</span>
		<vddl-list class="applied-effects"
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
				@selected="selectEffect(item)"
				:isSelected="(selectedEffect && item.key === selectedEffect.key)"
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

	.applied-effects {
		margin-left: 0.8em;
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

	data() {
		return {
			selectedEffect: null,
		}
	},

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
			wektorEffects.apply()
		},

		addEffect(id) {
			if (id === 'add') return

			this.ownerItem.wektorEffects.add(wektor.effects[id])
			wektor.emit('updateDialogBridge', { id: this.dialogId })
		},

		removeEffect(item) {
			if (!item) return

			const wektorEffects = this.ownerItem.wektorEffects
			const effect = wektorEffects.list.find(effect => effect.key === item.key)
			effect.remove()
			const dialog = wektor.dialogs[this.dialogId]
			wektor.emit('updateDialogBridge', { id: this.dialogId })
		},

		selectEffect(item) {
			this.$el.focus()
			this.selectedEffect = item
		},
	},
}	
</script>
