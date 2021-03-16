import { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
	{
		path: "/alert",
		alias: "/",
		name: "alert",
		component: () => import("pages/Alert.vue"),
	},
	{
		path: "/credential",
		name: "credential",
		component: () => import("pages/Credential.vue"),
	},
	{
		path: "/overlay",
		name: "overlay",
		component: () => import("pages/Overlay.vue"),
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: "/:catchAll(.*)*",
		component: () => import("pages/Error404.vue"),
	},
];

export default routes;
