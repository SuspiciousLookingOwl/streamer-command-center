import { promises as fs } from "fs";
import EventEmitter from "events";
import Logger from "./Logger";
import {
	Config,
	Credential,
	DEFAULT_CONFIG,
	CONFIG_FOLDER,
	CREDENTIAL_FILE,
	CONFIG_FILE,
	POPUP_TEMPLATE_FILE,
	DEFAULT_CREDENTIAL,
} from "./constants";

declare interface ConfigManager {
	on(
		event: "updateConfig",
		listener: (section: string, key: string, value: string) => void
	): this;
	on(event: "updateCredential", listener: (key: string, value: string) => void): this;
}

class ConfigManager extends EventEmitter {
	config: Config;
	credential: Credential;

	constructor() {
		super();
		this.config = DEFAULT_CONFIG;
		this.credential = DEFAULT_CREDENTIAL;
	}

	/** Load config from file */
	async loadConfig(): Promise<void> {
		// Create dir if not exists
		try {
			await fs.stat(CONFIG_FOLDER);
		} catch (err) {
			await fs.mkdir(CONFIG_FOLDER);
		}

		// Load config file
		try {
			await fs.stat(CONFIG_FILE);
			Logger.log(`Loading existing config file from ${CONFIG_FILE}`);
			const config = JSON.parse(await fs.readFile(CONFIG_FILE, "utf-8")) as Config;
			this.setConfig(config);
		} catch (err) {
			Logger.warn(`No configuration found, creating default config in ${CONFIG_FILE}.`);
			await fs.writeFile(CONFIG_FILE, JSON.stringify(this.config, null, 2));
		}

		// Load credential file
		try {
			await fs.stat(CREDENTIAL_FILE);
			Logger.log(`Loading existing credential file from ${CREDENTIAL_FILE}`);
			const credential = JSON.parse(
				await fs.readFile(CREDENTIAL_FILE, "utf-8")
			) as Credential;
			this.setCredential(credential, false);
		} catch (err) {
			Logger.warn(
				`No credential file found, creating default credential file in ${CREDENTIAL_FILE}.`
			);
			await fs.writeFile(CREDENTIAL_FILE, JSON.stringify(this.credential, null, 2));
		}

		// Load template
		try {
			await fs.stat(POPUP_TEMPLATE_FILE);
		} catch (err) {
			Logger.warn(
				`No popup template found, creating default template in ${POPUP_TEMPLATE_FILE}.`
			);
			const path =
				process.env.NODE_ENV !== "production" ? `${__dirname}/template` : "./template";
			const template = await fs.readFile(`${path}/popup-alert.html`, "utf-8");
			await fs.writeFile(POPUP_TEMPLATE_FILE, template);
		}
	}

	/** Get popup HTML template */
	async getTemplate(): Promise<string> {
		try {
			await fs.stat(POPUP_TEMPLATE_FILE);
		} catch (err) {
			return "";
		}
		return await fs.readFile(POPUP_TEMPLATE_FILE, "utf-8");
	}

	async setTemplate(template: string): Promise<void> {
		await fs.writeFile(POPUP_TEMPLATE_FILE, template);
	}

	async setCredential(data: Partial<Credential>, emitsEvent = true): Promise<void> {
		for (const key in data) {
			this.credential[key] = data[key] as string;
			if (emitsEvent) this.emit("updateCredential", key, data[key]);
		}
		await fs.writeFile(CREDENTIAL_FILE, JSON.stringify(this.credential, null, 2));
	}

	async setConfig(data: Partial<Config>): Promise<void> {
		for (const section in data) {
			for (const key in data[section]) {
				this.config[section][key] = data[section]?.[key];
				this.emit("updateConfig", section, key, data[key]);
			}
		}
		await fs.writeFile(CONFIG_FILE, JSON.stringify(this.config, null, 2));
	}
}

export default ConfigManager;
