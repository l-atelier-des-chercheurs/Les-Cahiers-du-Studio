<template>
  <!-- a capture, from the + button, straight in the browser: for now a
  sound, from the microphone, 1 minute at most (photo and video to come).
  A round button starts and stops; a level shows the microphone works.
  Once stopped: listened to, captured again or added. The parent uploads
  it: it emits "submit" with a File, then sets is_creating / error as
  props. The microphone is released as soon as the window closes. -->
  <BaseModal
    :disabled="!file || is_creating"
    @close="$emit('close')"
    @submit="submit"
  >
    <template #header>{{ $t("capture_sound") }}</template>

    <div class="m_modal--field">
      <div class="m_modal--box m_capture">
        <p v-if="device_error" class="m_capture--message">
          {{ device_error }}
        </p>

        <template v-else-if="file">
          <audio :src="file_url" controls />
          <!-- once added: how much of it is sent, then saved by the server -->
          <div
            v-if="is_creating && upload_progress !== null"
            class="m_capture--upload"
            role="status"
          >
            <div class="m_capture--uploadBar" aria-hidden="true">
              <span :style="{ transform: `scaleX(${upload_progress})` }" />
            </div>
            <p class="m_capture--message">{{ upload_label }}</p>
          </div>
          <button
            v-else
            type="button"
            class="textLink"
            :disabled="is_creating"
            @click="retake"
          >
            {{ $t("capture_again") }}
          </button>
        </template>

        <template v-else>
          <button
            type="button"
            class="m_capture--record"
            :class="{ 'is--recording': is_recording }"
            :disabled="!stream"
            :aria-label="$t(is_recording ? 'capture_stop' : 'capture_start')"
            @click="is_recording ? stop() : start()"
          >
            <span />
          </button>

          <div class="m_capture--level" aria-hidden="true">
            <span :style="{ transform: `scaleX(${level})` }" />
          </div>

          <p class="m_capture--time" :class="{ 'is--ending': is_ending }">
            {{ formatDuration(elapsed) }} / {{ formatDuration(MAX_DURATION) }}
          </p>
          <p class="m_capture--message">
            {{
              !stream
                ? $t("capture_waiting_microphone")
                : $t(is_recording ? "capture_stop" : "capture_start")
            }}
          </p>
        </template>
      </div>
      <small>{{ $t("capture_max_duration") }}</small>
    </div>

    <p v-if="error" class="m_modal--field form-error">{{ error }}</p>

    <template #submit_button>
      {{ is_creating && upload_label ? upload_label : $t("add") }}
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from "./BaseModal.vue";

// ms
const MAX_DURATION = 60 * 1000;

// The first the browser records, and the extension adc-core reads as
// audio. MP4 (Safari, recent Chrome) and Ogg (Firefox) first: the WebM
// MediaRecorder writes has no duration, players show no length and can't
// seek in it (older Chrome only)
const FORMATS = [
  { mime: "audio/mp4", ext: "m4a" },
  { mime: "audio/ogg;codecs=opus", ext: "ogg" },
  { mime: "audio/webm;codecs=opus", ext: "weba" },
  { mime: "audio/webm", ext: "weba" },
];

function pickFormat() {
  return (
    FORMATS.find(({ mime }) => MediaRecorder.isTypeSupported(mime)) || {
      mime: "",
      ext: "weba",
    }
  );
}

export default {
  components: { BaseModal },
  props: {
    is_creating: { type: Boolean, default: false },
    // 0 to 1 while the sound is sent, null otherwise
    upload_progress: { type: Number, default: null },
    error: { type: String, default: "" },
  },
  emits: ["close", "submit"],
  data() {
    return {
      MAX_DURATION,
      stream: null,
      device_error: "",
      is_recording: false,
      // ms
      elapsed: 0,
      // 0 to 1, the microphone's loudness
      level: 0,
      file: null,
      file_url: "",
    };
  },
  computed: {
    // "Envoi… 42 %", then, once all sent, the server saving it
    upload_label() {
      if (this.upload_progress === null) return "";
      if (this.upload_progress >= 1) return this.$t("capture_saving");
      return `${this.$t("sending")} ${Math.round(this.upload_progress * 100)} %`;
    },
    // the last 10 seconds
    is_ending() {
      return this.is_recording && MAX_DURATION - this.elapsed <= 10 * 1000;
    },
  },
  mounted() {
    this.openMicrophone();
  },
  beforeUnmount() {
    this.closeMicrophone();
    this.clearFile();
  },
  methods: {
    async openMicrophone() {
      // only on https:// or localhost: not on http://192.168…
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        this.device_error = this.$t(
          window.isSecureContext
            ? "capture_unsupported"
            : "capture_needs_https"
        );
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // closed while the browser asked for permission
        if (this._unmounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        this.stream = stream;
        this.watchLevel();
      } catch (err) {
        this.device_error = this.$t(
          err.name === "NotAllowedError"
            ? "capture_microphone_denied"
            : err.name === "NotFoundError"
              ? "capture_no_microphone"
              : "capture_unsupported"
        );
      }
    },
    closeMicrophone() {
      this._unmounted = true;
      if (this.recorder?.state === "recording") {
        this.recorder.onstop = null;
        this.recorder.stop();
      }
      this.stopTimer();
      cancelAnimationFrame(this.level_frame);
      this.audio_context?.close();
      this.stream?.getTracks().forEach((track) => track.stop());
    },

    // the loudness, every frame: proof the microphone hears something
    watchLevel() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.audio_context = new AudioContext();
      const analyser = this.audio_context.createAnalyser();
      analyser.fftSize = 512;
      this.audio_context.createMediaStreamSource(this.stream).connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      const draw = () => {
        analyser.getFloatTimeDomainData(samples);
        const rms = Math.sqrt(
          samples.reduce((sum, s) => sum + s * s, 0) / samples.length
        );
        // quiet voices still move it
        this.level = Math.min(1, rms * 4);
        this.level_frame = requestAnimationFrame(draw);
      };
      draw();
    },

    start() {
      if (!this.stream || this.is_recording) return;
      const format = pickFormat();
      const chunks = [];
      this.recorder = new MediaRecorder(
        this.stream,
        format.mime ? { mimeType: format.mime } : {}
      );
      this.recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      this.recorder.onstop = () => {
        // the type without its codecs
        const type = (this.recorder.mimeType || format.mime).split(";")[0];
        const blob = new Blob(chunks, { type });
        this.clearFile();
        this.file = new File([blob], `son.${format.ext}`, { type });
        this.file_url = URL.createObjectURL(this.file);
      };
      // chunks every second: nothing lost if the browser stops early
      this.recorder.start(1000);
      this.is_recording = true;
      this.elapsed = 0;
      const started = Date.now();
      this.timer = setInterval(() => {
        this.elapsed = Math.min(Date.now() - started, MAX_DURATION);
        if (this.elapsed >= MAX_DURATION) this.stop();
      }, 100);
    },
    stop() {
      if (!this.is_recording) return;
      this.stopTimer();
      this.is_recording = false;
      this.recorder.stop();
    },
    stopTimer() {
      clearInterval(this.timer);
    },
    retake() {
      this.clearFile();
      this.elapsed = 0;
    },
    clearFile() {
      if (this.file_url) URL.revokeObjectURL(this.file_url);
      this.file = null;
      this.file_url = "";
    },

    submit() {
      if (this.file && !this.is_creating) this.$emit("submit", this.file);
    },

    // 0:07
    formatDuration(ms) {
      const seconds = Math.floor(ms / 1000);
      return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.m_capture {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: var(--spacing-small);
  padding-block: var(--spacing-medium);
  color: white;
  text-align: center;

  audio {
    width: 100%;
  }
}

// a red dot that starts, a red square that stops
.m_capture--record {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  padding: 0;
  border: 3px solid white;
  border-radius: 50%;

  > span {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background-color: var(--c-rouge);
    transition:
      width 0.2s ease-out,
      height 0.2s ease-out,
      border-radius 0.2s ease-out;
  }

  &.is--recording > span {
    width: 26px;
    height: 26px;
    border-radius: 4px;
  }

  &:disabled {
    opacity: 0.4;
  }
}

.m_capture--level {
  width: 100%;
  max-width: 12rem;
  height: 4px;
  overflow: hidden;
  border-radius: 2px;
  background-color: var(--c-noir_light);

  > span {
    display: block;
    height: 100%;
    background-color: var(--c-vert_vif);
    transform-origin: left;
  }
}

.m_capture--time {
  margin: 0;
  font-variant-numeric: tabular-nums;

  &.is--ending {
    color: var(--c-rouge);
  }
}

.m_capture--message {
  margin: 0;
  color: var(--c-gris_clair);
  font-size: var(--font-size-small);
}

.m_capture--upload {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: var(--spacing-verysmall);
  width: 100%;
}

// as the import window's (UploadFilesModal.vue): a green line
.m_capture--uploadBar {
  width: 100%;
  height: 4px;
  overflow: hidden;
  border-radius: 2px;
  background-color: var(--c-noir_light);

  > span {
    display: block;
    height: 100%;
    background-color: var(--c-vert_vif);
    transform-origin: left;
    transition: transform 0.2s ease-out;
  }
}
</style>
