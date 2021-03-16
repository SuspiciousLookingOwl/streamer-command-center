<template>
	<q-item class="q-pa-none">
		<q-item-section avatar>
			<q-icon color="primary" name="volume_up" />
		</q-item-section>
		<q-item-section>
			<q-slider v-model="value" label :min="0" :label-value="label" :max="1" :step="0.01" />
		</q-item-section>
	</q-item>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Model, Prop } from "vue-property-decorator";

@Options({})
export default class CPasswordInput extends Vue {
	@Model("modelValue")
	readonly value!: string;

	@Prop() readonly label!: string;
}
</script>
