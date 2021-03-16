<template>
	<div>
		<q-header class="bg-grey-2 text-dark shadow-2">
			<q-toolbar>
				<q-btn flat @click="showDrawer = !showDrawer" round dense icon="menu" />
				<q-toolbar-title>Streamer Command Center</q-toolbar-title>
			</q-toolbar>
		</q-header>

		<q-drawer v-model="showDrawer" :width="225" :breakpoint="0" bordered class="bg-grey-3">
			<q-scroll-area class="fit">
				<q-list>
					<template v-for="(item, index) in menuList" :key="index">
						<q-item
							clickable
							:active="item.route.name === $route.name"
							:to="item.route"
							v-ripple
						>
							<q-item-section avatar>
								<q-icon :name="item.icon" />
							</q-item-section>
							<q-item-section>
								{{ item.label }}
							</q-item-section>
						</q-item>
						<q-separator :key="'sep' + index" v-if="item.separator" />
					</template>
				</q-list>
			</q-scroll-area>
		</q-drawer>
	</div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({})
export default class AppHeader extends Vue {
	showDrawer = true;
	menuList = [
		{
			icon: "announcement",
			label: "Popup Alert",
			separator: true,
			route: {
				name: "alert",
			},
		},
		{
			icon: "lock",
			label: "Credentials",
			separator: true,
			route: {
				name: "credential",
			},
		},
	];
}
</script>
