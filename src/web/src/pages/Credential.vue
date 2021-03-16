<template>
	<q-page padding>
		<div class="row">
			<div class="col-12 col-lg-4">
				<q-form class="q-gutter-md">
					<h5 class="text-h5 q-my-xs">Credentials</h5>
					<c-password-input
						v-model="credential.saweriaAlertUrl"
						outlined
						label="Saweria Alert URL"
					/>
					<c-password-input
						v-model="credential.karyakarsaAlertUrl"
						outlined
						label="Karyakarsa Alert URL"
					/>

					<q-separator class="q-my-lg" />

					<q-btn outline color="primary" label="Save" @click="saveCredential" />
				</q-form>
			</div>
		</div>
	</q-page>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { useQuasar } from "quasar";
import CPasswordInput from "../components/CPasswordInput.vue";

@Options({
	setup() {
		const $q = useQuasar();
		return { $q };
	},
	components: { CPasswordInput },
})
export default class Credential extends Vue {
	credential = {
		saweriaAlertUrl: "",
		karyakarsaAlertUrl: "",
	};

	visibility = {
		saweriaAlertUrl: false,
		karyakarsaAlertUrl: false,
	};

	async mounted() {
		this.credential = (await this.$axios.get("http://localhost:8082/api/credential")).data;
	}

	async saveCredential() {
		await this.$axios.patch("http://localhost:8082/api/credential", {
			...this.credential,
		});

		this.$q.notify({
			message: "Credentials Saved!",
			type: "positive",
			closeBtn: true,
		});
	}
}
</script>
