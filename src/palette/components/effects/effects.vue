<template>
	<div>
		<span class="label">{{label}}</span>
		<vselect
			:value="'add'"
			@input="addEffect($event)"
			:payload="{
				options: effectsOptions,
			}"
		></vselect>
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
			>{{item.label}}</effect>
			<vddl-placeholder style="height: 1px; background: black; width: 100%; margin-top: -1px;"></vddl-placeholder>
		</vddl-list>
	</div>
</template>

<script>
import baseComponent from '../baseComponent'
import vselect from '../vselect'
import effect from './effect'
import wektor from '@/wektor'
import { makeUniqueId } from '@/utils'

export default {
	extends: baseComponent,

	components: { vselect, effect },

	data() {
		return {
			appliedEffects: this.value,
		}
	},

	computed: {
		effectsOptions() {
			const effects = wektor.effects
			const options = ['add']

			for (const [id, effect] of Object.entries(effects)) {
				options.push({ id, label: id, value: id })
			}

			return options
		},
	},

	methods: {
		handleMoved(item) {
			const { index, list } = item
			list.splice(index, 1)
		},

		addEffect(id) {
			if (id === 'add') return

			const effect = this.effectsOptions.find(effect => effect.id === id)
			if (!effect) return

			const key = makeUniqueId()
			this.appliedEffects.push({label: effect.id, key, id: effect.id})
			// const appliedEffects = [...this.appliedEffects, { label: effect.id, key }]

			// this.$emit('input', appliedEffects)
		}
	},
}	
</script>
