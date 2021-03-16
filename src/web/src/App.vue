<template>
	<q-layout view="hHh Lpr lff">
		<AppHeader v-if="$route.name !== 'overlay'" />
		<router-view v-slot="{ Component }">
			<template v-if="$route.name !== 'overlay'">
				<q-page-container class="q-mt-md q-pb-xl q-mb-xl">
					<keep-alive>
						<component :is="Component" />
					</keep-alive>
				</q-page-container>
			</template>
			<component v-else :is="Component" />
		</router-view>
	</q-layout>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AppHeader from "./components/AppHeader.vue";

@Options({
	components: { AppHeader },
})
export default class App extends Vue {}
</script>
