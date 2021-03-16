import os from "os";
import path from "path";

export interface Credential {
	saweriaAlertUrl: string;
	karyakarsaAlertUrl: string;
	[key: string]: string;
}

export const DEFAULT_CREDENTIAL: Credential = {
	saweriaAlertUrl: "",
	karyakarsaAlertUrl: "",
};

export interface Config {
	popup: {
		duration: number;
		audioUrl: string;
		volume: number;
	};
	tts: {
		enabled: boolean;
		maximumDuration: number;
		language: "en" | "id";
		volume: number;
	};
	[key: string]: Record<string, any>;
}

export const DEFAULT_CONFIG: Config = {
	popup: {
		duration: 5000,
		audioUrl: "https://uploads.twitchalerts.com/sound-defaults/default.ogg",
		volume: 1,
	},
	tts: {
		enabled: false,
		maximumDuration: 15000,
		language: "en",
		volume: 1,
	},
};

export const CONFIG_FOLDER = path.join(os.homedir(), ".scc");
export const CONFIG_FILE = path.join(CONFIG_FOLDER, "config.json");
export const CREDENTIAL_FILE = path.join(CONFIG_FOLDER, "credential.json");
export const POPUP_TEMPLATE_FILE = path.join(CONFIG_FOLDER, "popup-alert.html");
