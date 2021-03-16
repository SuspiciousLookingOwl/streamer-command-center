<template>
	<q-page padding>
		<div class="row q-col-gutter-x-xl">
			<div class="col-12 col-lg-6 q-gutter-md">
				<div class="row q-my-none q-py-none">
					<h5 class="text-h5 q-my-xs">Popup Alert</h5>
				</div>
				<q-input
					outlined
					v-model.number="popup.duration"
					suffix="ms"
					type="number"
					label="PopUp Duration"
				/>

				<q-input outlined v-model="popup.audioUrl" label="Audio URL">
					<template v-slot:after>
						<q-btn flat size="lg" dense icon="play_arrow" @click="playAudio" />
					</template>
				</q-input>

				<c-volume-slider
					v-model="popup.volume"
					:label="`Volume: ${Math.round(popup.volume * 100)}`"
				/>
			</div>
			<div class="col-12 col-lg-6 q-gutter-md">
				<div class="row q-my-none q-py-none items-center">
					<h5 class="text-h5 q-my-xs">Text to Speech</h5>
					<q-icon name="error" class="q-px-md" size="sm" color="negative">
						<q-tooltip class="text-body2">
							This uses an unofficial API to get TTS data from Google Translate, use
							at your own risk! (Though most likely it won't do any harm)
						</q-tooltip>
					</q-icon>
					<q-toggle dense v-model="tts.enabled" />
				</div>
				<template v-if="tts.enabled">
					<q-input
						outlined
						v-model.number="tts.maximumDuration"
						suffix="ms"
						type="number"
						label="Maximum TTS Duration"
					/>

					<q-select
						outlined
						label="Language"
						v-model="tts.language"
						:options="languages"
						emit-value
						map-options
					>
						<template v-slot:after>
							<q-btn flat size="lg" dense icon="play_arrow" @click="playTTS" />
						</template>
					</q-select>

					<c-volume-slider
						v-model="tts.volume"
						:label="`Volume: ${Math.round(tts.volume * 100)}`"
					/>
				</template>
			</div>
		</div>

		<q-separator class="q-my-lg" />

		<div class="row q-my-none q-py-none">
			<h5 class="text-h5 q-mt-xs q-mb-md">Template</h5>
		</div>
		<div class="row q-col-gutter-x-xl">
			<div class="col-12 col-lg-6">
				<prism-editor
					v-model="htmlTemplate"
					class="html-editor"
					:highlight="highlighter"
					line-numbers
				/>
			</div>
			<div class="col-12 col-lg-6" ref="htmlPreview"></div>
		</div>

		<q-separator class="q-my-lg" />

		<div class="row">
			<div class="col-12 col-lg-6 q-gutter-md">
				<q-input outlined v-model="overlayUrl" type="text" label="Overlay URL" readonly>
					<template v-slot:after>
						<q-btn flat icon="content_copy" @click="copyOverlayUrl" />
					</template>
				</q-input>
				<q-btn outline color="primary" label="Save" @click="saveConfig" />
			</div>
		</div>
	</q-page>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Ref, Watch } from "vue-property-decorator";
import { copyToClipboard } from "quasar";
import CVolumeSlider from "../components/CVolumeSlider.vue";
import { parsePlaceholder } from "../util";

import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

@Options({
	components: { CVolumeSlider, PrismEditor },
})
export default class Alert extends Vue {
	@Ref("htmlPreview") htmlPreview!: HTMLDivElement;

	overlayUrl = "http://localhost:8082/overlay";
	popup = {
		duration: 5000,
		audioUrl: "https://uploads.twitchalerts.com/sound-defaults/default.ogg",
		volume: 1,
	};
	tts = {
		enabled: false,
		maximumDuration: 15000,
		language: "en",
		volume: 1,
	};
	htmlTemplate = "";
	htmlPreviewShadow!: ShadowRoot;

	languages = [
		{
			label: "English",
			value: "en",
		},
		{
			label: "Indonesia",
			value: "id",
		},
	];

	async mounted() {
		const config = (await this.$axios.get("http://localhost:8082/api/config")).data;
		this.popup = config.popup;
		this.tts = config.tts;
		this.htmlTemplate = config.htmlTemplate;
		this.htmlPreviewShadow = this.htmlPreview.attachShadow({ mode: "closed" });
	}

	@Watch("htmlTemplate")
	onHtmlTemplateChange() {
		this.htmlPreviewShadow.innerHTML = parsePlaceholder(this.htmlTemplate, {
			message: "Example Message",
			amount: 155000,
			donator: "John Doe",
		});
	}

	playAudio() {
		const audio = new Audio(this.popup.audioUrl);
		audio.volume = this.popup.volume;
		void audio.play();
	}

	playTTS() {
		const audio = new Audio(
			`/audio/tts_${this.tts.language === "en" ? "english" : "indonesia"}.mp3`
		);
		audio.volume = this.tts.volume;
		void audio.play();
	}

	highlighter(code: string) {
		return highlight(code, languages.html, "html");
	}

	async copyOverlayUrl() {
		await copyToClipboard(this.overlayUrl);
		this.$q.notify({
			message: "Overlay URL Copied to Clipboard!",
			type: "positive",
			closeBtn: true,
		});
	}

	async saveConfig() {
		await this.$axios.patch("http://localhost:8082/api/config", {
			popup: this.popup,
			tts: this.tts,
			htmlTemplate: this.htmlTemplate,
		});

		this.$q.notify({
			message: "Configuration Saved!",
			type: "positive",
			closeBtn: true,
		});
	}
}
</script>

<style>
.html-editor {
	background: #2d2d2d;
	color: #ccc;
	height: 400px;
	resize: vertical;
	font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
	font-size: 14px;
	line-height: 1.5;
	padding: 5px;
}

.prism-editor__textarea:focus {
	outline: none;
}
</style>
