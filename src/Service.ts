import Router from "koa-router";
import ConfigManager from "./ConfigManager";

export default class Service {
	configManager: ConfigManager;
	router: Router;

	constructor(config: ConfigManager) {
		this.configManager = config;
		this.router = new Router();

		this.registerRoute();
	}

	registerRoute(): void {
		this.router.get("/config", async (ctx) => {
			ctx.body = {
				...this.configManager.config,
				htmlTemplate: await this.configManager.getTemplate(),
			};
		});

		/** Update config */
		this.router.patch("/config", async (ctx) => {
			const { tts, popup, htmlTemplate } = ctx.body;
			await this.configManager.setConfig({ tts, popup });
			await this.configManager.setTemplate(htmlTemplate);
		});

		this.router.get("/credential", async (ctx) => {
			ctx.body = this.configManager.credential;
		});

		/** Update config */
		this.router.patch("/credential", async (ctx) => {
			this.configManager.setCredential(ctx.body);
		});
	}
}

/** Get config */
