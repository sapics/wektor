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
		<vddl-list
			:list="appliedEffects"
		>
			<effect v-for="(effect, index) of appliedEffects"
				:key="effect.id"
				:index="index"
				:item="effect"
				:wrapper="appliedEffects"
				:dialogId="dialogId"
				:id="id"
			>{{id}}</effect>
		</vddl-list>
	</div>
</template>

<script>
import baseComponent from '../baseComponent'
import vselect from '../vselect'
import effect from './effect'
import wektor from '@/wektor'

export default {
	extends: baseComponent,

	components: { vselect, effect },

	data() {
		return {
			appliedEffects: [],			
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
		}
	},

	methods: {
		addEffect(id) {
			if (id === 'add') return
			this.appliedEffects.push(this.effectsOptions[id])
		}
	},
}	
</script>
