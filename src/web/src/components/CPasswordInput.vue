<template>
	<q-input v-model="value" outlined :label="label" :type="isVisible ? 'text' : 'password'">
		<template v-slot:append>
			<q-icon
				:name="isVisible ? 'visibility_off' : 'visibility'"
				class="cursor-pointer"
				@click="isVisible = !isVisible"
			/>
		</template>
	</q-input>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Model, Prop } from "vue-property-decorator";

@Options({})
export default class CPasswordInput extends Vue {
	@Model("modelValue")
	readonly value!: string;

	@Prop() readonly label!: string;

	isVisible = false;
}
</script>
