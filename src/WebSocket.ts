import { Server } from "ws";
import { AlertDonation } from "karyakarsa/dist/interfaces";
import { Client as Karyakarsa } from "karyakarsa";
import { EmittedDonation } from "saweria/dist/types";
import Saweria from "saweria";
import { Server as HTTPServer } from "http";
import * as tts from "google-tts-api";
import { minify } from "html-minifier-terser";
import ConfigManager from "./ConfigManager";
import Logger from "./Logger";

interface Donation {
	donator: string;
	amount: number;
	message: string;
	media?: { src: string[]; tag: string };
	sound?: Record<string, string>;
	htmlTemplate: string;
	popup: {
		duration: number;
		audioUrl: string;
		volume: number;
	};
	tts: {
		enabled: boolean;
		base64: string;
		maximumDuration: number;
		language: "en" | "id";
		volume: number;
	};
}

export default class WebSocketClient {
	private karyakarsa: Karyakarsa;
	private saweria: Saweria;
	private wss: Server;

	constructor(private configManager: ConfigManager, server: HTTPServer) {
		this.karyakarsa = new Karyakarsa();
		this.saweria = new Saweria();
		this.wss = new Server({
			server,
		});
		configManager.on("updateCredential", (key) => {
			if (key === "karyakarsaAlertUrl") this.startKaryakarsa();
			else if (key === "saweriaAlertUrl") this.startSaweria();
		});
	}

	private startSaweria(): void {
		const alertUrl = WebSocketClient.parseAlertUrl(
			this.configManager.credential.saweriaAlertUrl
		);
		this.saweria.removeAllListeners();
		this.saweria.logout();
		if (!alertUrl) return;
		this.saweria.setStreamKey(alertUrl);
		this.saweria.on("donations", this.saweriaDonationHandler.bind(this));
		this.saweria.on("error", this.startSaweria.bind(this));
	}

	private startKaryakarsa(): void {
		const alertUrl = WebSocketClient.parseAlertUrl(
			this.configManager.credential.karyakarsaAlertUrl
		);
		this.karyakarsa.removeAllListeners();
		try {
			this.karyakarsa.disconnect();
		} catch (err) {
			/* ignore  */
		}
		if (!alertUrl) return;
		this.karyakarsa.setStreamKey(alertUrl);
		this.karyakarsa.on("donation", this.karyakarsaDonationHandler.bind(this));
		this.karyakarsa.run();
	}

	private saweriaDonationHandler(donations: EmittedDonation[]) {
		for (const donation of donations)
			this.sendDonation({
				donator: donation.donator,
				amount: donation.amount,
				message: donation.message,
				media: donation.media,
				sound: donation.sound,
			});
	}

	private karyakarsaDonationHandler(donation: AlertDonation) {
		this.sendDonation({
			donator: donation.name,
			amount: donation.total,
			message: donation.notes,
		});
	}

	run(): void {
		this.startKaryakarsa();
		this.startSaweria();

		setInterval(() => {
			// restart every 3 minutes
			this.startSaweria();
		}, 3 * 60 * 1000);
	}

	private async sendDonation(donation: Partial<Donation>) {
		let ttsBase64 = "";
		if (
			this.configManager.config.tts.enabled &&
			donation.message &&
			donation.message.length < 200
		) {
			try {
				ttsBase64 = await tts.getAudioBase64(donation.message, {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					lang: this.configManager.config.tts.language as any,
				});
			} catch (err) {
				Logger.error("Failed to get TTS audio data");
				console.error(err);
			}
		}

		this.broadcast("donation", {
			...donation,
			popup: this.configManager.config.popup,
			tts: {
				...this.configManager.config.tts,
				base64: ttsBase64,
			},
			htmlTemplate: minify(await this.configManager.getTemplate(), {
				collapseWhitespace: true,
				conservativeCollapse: true,
				continueOnParseError: true,
				minifyCSS: true,
				removeComments: true,
			}),
		});
	}

	private broadcast(name: "donation", data: Partial<Donation>): void;
	private broadcast(name: string, data?: unknown): void {
		this.wss.clients.forEach((client) => {
			client.send(JSON.stringify({ name, data }));
		});
	}

	static parseAlertUrl(url: string): string {
		if (url.startsWith("http")) url = new URL(url).searchParams.get("streamKey") || url;
		return url;
	}
}
