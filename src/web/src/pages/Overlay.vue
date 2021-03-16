<template>
	<transition name="fade">
		<div v-if="isShowingPopUp" v-html="html"></div>
	</transition>
</template>

<script lang="ts">
import { Vue } from "vue-property-decorator";
import { parsePlaceholder } from "../util";

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

export default class Overlay extends Vue {
	websocket!: WebSocket;
	isShowingPopUp = false;
	html = "";
	currentDonation: Donation | null = null;
	donationQueue: Donation[] = [];

	mounted() {
		this.connect();
	}

	unmounted() {
		this.websocket.close();
	}

	connect() {
		this.websocket = new WebSocket("ws://localhost:8082");
		this.websocket.onmessage = (event) => {
			const { name, data } = JSON.parse(event.data);
			if (name !== "donation") return;
			this.donationQueue.push(data);
			void this.alert();
		};
		this.websocket.onclose = async () => {
			// Reconnecting
			await new Promise((r) => setTimeout(r, 1000));
			this.connect();
		};
	}

	async alert() {
		if (this.currentDonation) return;
		this.currentDonation = this.donationQueue.shift() || null;
		if (!this.currentDonation) return;

		await Promise.all([this.showPopUp(), this.playAudio()]);
		await new Promise((r) => setTimeout(r, 1000));
		this.currentDonation = null;
		void this.alert();
	}

	async showPopUp() {
		if (!this.currentDonation) return;
		const { message, amount, donator, popup } = this.currentDonation;
		let html = this.currentDonation?.htmlTemplate;
		if (html) html = parsePlaceholder(html, { message, amount, donator });
		this.html = html;
		this.isShowingPopUp = true;
		await new Promise((r) => setTimeout(r, popup.duration));
		this.html = "";
		this.isShowingPopUp = false;
	}

	playAudio() {
		return new Promise((resolve) => {
			if (!this.currentDonation) return resolve(0);
			const { popup, tts } = this.currentDonation;
			const audio = new Audio(popup.audioUrl);
			audio.volume = popup.volume;
			audio.onended = () => {
				if (tts.base64) {
					const audio = new Audio(`data:audio/wav;base64,${tts.base64}`);
					audio.volume = tts.volume || 1;
					void audio.play();
					setTimeout(() => {
						audio.pause();
						resolve(0);
					}, tts.maximumDuration);
					audio.onended = resolve;
				} else {
					resolve(0);
				}
			};
			void audio.play();
		});
	}
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
	opacity: 0;
}
</style>
