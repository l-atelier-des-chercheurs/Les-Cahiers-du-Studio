<template>
  <!-- v2's AddMedias.vue: a round + button in the bottom right corner,
  that unfolds the kinds of media above it. Files dragged over the page
  bring a veil with a large zone in its middle: dropped there, they are
  added; dropped anywhere else, nothing happens. -->
  <div
    class="m_addMedias"
    :class="{ 'is--open': is_open }"
    @keydown.esc="is_open = false"
  >
    <Transition name="m_drop">
      <div
        v-if="is_dragover"
        class="m_addMedias--dropOverlay"
        :class="{ 'is--over': is_over_zone }"
      >
        <div class="m_addMedias--dropZone" @drop.prevent="onDrop">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M0,10.5h10.5V0h2.9v10.5H24v2.9H13.5V24h-2.9V13.5H0V10.5z"
            />
          </svg>
          <strong>
            {{ $t(is_over_zone ? "drop_release" : "drop_files_here") }}
          </strong>
        </div>
      </div>
    </Transition>

    <ul :id="options_id" class="m_addMedias--options">
      <li
        v-for="(option, index) in options"
        :key="option.key"
        :style="{ '--delay': (options.length - index) * 0.035 + 's' }"
      >
        <label
          v-if="option.accept !== undefined"
          class="m_addMedias--option"
          :class="{ 'is--disabled': disabled }"
          :tabindex="is_open ? 0 : -1"
          :aria-disabled="disabled"
          @click="disabled && $event.preventDefault()"
          @keydown.enter.space.prevent="
            !disabled && $refs[`input_${option.key}`][0].click()
          "
        >
          <span class="m_addMedias--label">{{ $t(option.label) }}</span>
          <svg viewBox="0 0 40 40" aria-hidden="true" v-html="option.icon" />
          <!-- never disabled: the connection may drop while the picker is
          open (a phone preparing videos, the page in the background), and
          a disabled input would lose the files chosen -->
          <input
            :ref="`input_${option.key}`"
            type="file"
            multiple
            :accept="option.accept"
            tabindex="-1"
            @change="onInputChange"
          />
        </label>
        <button
          v-else
          type="button"
          class="m_addMedias--option"
          :disabled="disabled || is_creating"
          :tabindex="is_open ? 0 : -1"
          @click="option.action"
        >
          <span class="m_addMedias--label">{{ $t(option.label) }}</span>
          <svg viewBox="0 0 40 40" aria-hidden="true" v-html="option.icon" />
        </button>
      </li>
    </ul>

    <p v-if="error" class="m_addMedias--error" role="alert">{{ error }}</p>

    <button
      type="button"
      class="m_addMedias--toggle"
      :aria-expanded="is_open"
      :aria-controls="options_id"
      :aria-label="$t('add_medias')"
      :disabled="disabled"
      @click="is_open = !is_open"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M0,10.5h10.5V0h2.9v10.5H24v2.9H13.5V24h-2.9V13.5H0V10.5z" />
      </svg>
    </button>

    <TextModal
      v-if="show_text_modal"
      v-model="text_draft"
      :is_creating="is_creating"
      :upload_progress="upload_progress"
      :error="text_error"
      @close="show_text_modal = false"
      @submit="createText"
    />

    <MarkerModal
      v-if="marker_date"
      :date="marker_date"
      :is_creating="is_creating"
      :error="marker_error"
      @close="marker_date = ''"
      @submit="createMarker"
    />

    <CaptureModal
      v-if="show_capture_modal"
      :is_creating="is_creating"
      :upload_progress="upload_progress"
      :error="capture_error"
      @close="show_capture_modal = false"
      @submit="createCapture"
    />

    <EmbedModal
      v-if="show_embed_modal"
      :is_creating="is_creating"
      :upload_progress="upload_progress"
      :error="embed_error"
      @close="show_embed_modal = false"
      @submit="createEmbed"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { creditsMeta } from "@/contributor";
import { useContentStore } from "@/stores/content";
import { useSessionStore } from "@/stores/session";
import CaptureModal from "./CaptureModal.vue";
import EmbedModal from "./EmbedModal.vue";
import MarkerModal from "./MarkerModal.vue";
import TextModal from "./TextModal.vue";

// Icons drawn on a 40×40 grid, stroked in currentColor (v2's, redrawn)
const ICONS = {
  text: `<rect x="13" y="11.5" width="14" height="17" />
    <line x1="15.5" y1="15" x2="24.5" y2="15" />
    <line x1="15.5" y1="18.5" x2="24.5" y2="18.5" />
    <line x1="15.5" y1="22" x2="24.5" y2="22" />
    <line x1="15.5" y1="25.5" x2="22" y2="25.5" />`,
  // the repère's label on the timeline (MediaTimeline.vue): tilted -15°,
  // its time then its caption
  marker: `<g transform="rotate(-15 20 20)">
      <rect x="10.5" y="14" width="19" height="12" />
      <line x1="14" y1="18" x2="22" y2="18" />
      <line x1="14" y1="22" x2="19" y2="22" />
    </g>`,
  embed: `<polyline points="27.5 21.5 27.5 28.5 11.5 28.5 11.5 12.5 18.5 12.5" />
    <polyline points="22 11.5 28.5 11.5 28.5 18" />
    <line x1="28.5" y1="11.5" x2="19" y2="21" />`,
  image: `<rect x="11.5" y="12.85" width="17" height="14.3" />
    <line x1="13.85" y1="14.99" x2="26.48" y2="25.12" />
    <line x1="13.85" y1="25.12" x2="26.48" y2="14.99" />`,
  // a microphone: only sounds are captured for now
  capture: `<rect x="16.5" y="10" width="7" height="13" rx="3.5" />
    <path d="M13 20a7 7 0 0 0 14 0" />
    <line x1="20" y1="27" x2="20" y2="30.5" />
    <line x1="16" y1="30.5" x2="24" y2="30.5" />`,
  file: `<polyline points="21.5 11.5 13 11.5 13 28.5 27 28.5 27 17" />
    <polyline points="21.5 11.5 21.5 17 27 17 21.5 11.5" />`,
};

let instances = 0;

export default {
  components: { CaptureModal, EmbedModal, MarkerModal, TextModal },
  props: {
    // the cahier, e.g. "cahiers/mon-cahier"
    path_to_folder: { type: String, required: true },
  },
  // files: File[] chosen or dropped, for the import modal
  // created: path to the meta of a media created here (text, marker, embed),
  // and its type
  emits: ["files", "created"],
  data() {
    return {
      options_id: `add_medias_options_${++instances}`,
      is_open: false,
      is_dragover: false,
      // the files are over the drop zone: let go, they are added
      is_over_zone: false,
      is_creating: false,
      error: "",
      show_embed_modal: false,
      show_text_modal: false,
      show_capture_modal: false,
      capture_error: "",
      // 0 to 1 while a text, link or sound is sent, null otherwise
      upload_progress: null,
      // what was written, kept if the window is closed before adding it
      text_draft: "",
      text_error: "",
      // a repère asked for, at this date, waiting for its label
      marker_date: "",
      marker_error: "",
      embed_error: "",
    };
  },
  computed: {
    ...mapState(useSessionStore, ["token_path"]),
    ...mapState(useContentStore, ["is_connected"]),
    disabled() {
      return !this.is_connected;
    },
    // top to bottom. With `accept`: a file picker. The media's type is found
    // from the file, whichever picker it came from.
    // - photo/video: on phones, the gallery and the camera (photo or video);
    //   one picker, as `image/*` and `video/*` apart only hid each other
    // - file: anything else, audio and PDFs included (`audio/*` offered no
    //   recording on phones, only the Files app)
    // No `capture`: on phones it would open the camera only, without the
    // choice of an existing file.
    options() {
      return [
        { key: "text", label: "text", action: this.openTextModal },
        { key: "marker", label: "marker", action: this.openMarkerModal },
        { key: "embed", label: "embed", action: this.openEmbedModal },
        { key: "capture", label: "capture", action: this.openCaptureModal },
        {
          key: "image",
          label: "photo_video",
          accept: "image/*,video/*",
        },
        { key: "file", label: "file", accept: "" },
      ].map((option) => ({ ...option, icon: ICONS[option.key] }));
    },
  },
  watch: {
    disabled(disabled) {
      if (disabled) this.is_open = false;
    },
  },
  mounted() {
    document.addEventListener("pointerdown", this.onDocumentPointerDown);
    document.addEventListener("dragover", this.onDocumentDragOver);
    document.addEventListener("drop", this.onDocumentDrop);
  },
  beforeUnmount() {
    document.removeEventListener("pointerdown", this.onDocumentPointerDown);
    document.removeEventListener("dragover", this.onDocumentDragOver);
    document.removeEventListener("drop", this.onDocumentDrop);
    clearTimeout(this.dragover_timeout);
    clearTimeout(this.error_timeout);
  },
  methods: {
    ...mapActions(useContentStore, ["createFile", "uploadFile"]),

    // meta of every new media: visible right away (adc-core makes it
    // private otherwise), placed on the timeline now, by its author, with
    // the name given without an account (contributor.js)
    newMediaMeta() {
      return {
        $status: "public",
        $authors: this.token_path ? [this.token_path] : [],
        date_timeline: new Date().toISOString(),
        ...creditsMeta(),
      };
    },
    // makeMedia gets a callback for the upload's progress (0 to 1)
    async create(makeMedia) {
      if (this.is_creating) return;
      this.is_creating = true;
      this.upload_progress = null;
      this.showError("");
      try {
        const { meta_filename, uploaded_meta } = await makeMedia(
          (ratio) => (this.upload_progress = ratio)
        );
        this.is_open = false;
        this.$emit(
          "created",
          `${this.path_to_folder}/${meta_filename}`,
          uploaded_meta?.$type
        );
        return true;
      } catch (err) {
        this.showError(
          this.$t("error_with_code", { code: err.code || err.message })
        );
        return false;
      } finally {
        this.is_creating = false;
        this.upload_progress = null;
      }
    },

    /* TEXT, MARKER, EMBED */

    openTextModal() {
      this.text_error = "";
      this.show_text_modal = true;
      this.is_open = false;
    },
    // a .md file holding HTML, as in v2 (TODO.md: a .html file); formatted
    // later in the media's window
    async createText(html) {
      this.text_error = "";
      const created = await this.create((onProgress) =>
        this.uploadFile(
          this.path_to_folder,
          new File([html], "texte.md", { type: "text/markdown" }),
          this.newMediaMeta(),
          onProgress
        )
      );
      if (created) {
        this.show_text_modal = false;
        this.text_draft = "";
      } else {
        this.text_error = this.error;
        this.showError("");
      }
    },
    // the time of the click: what the repère marks
    openMarkerModal() {
      this.marker_error = "";
      this.marker_date = new Date().toISOString();
      this.is_open = false;
    },
    // only a .meta.txt; the label is optional
    async createMarker(label) {
      this.marker_error = "";
      const created = await this.create(() =>
        this.createFile(this.path_to_folder, {
          ...this.newMediaMeta(),
          date_timeline: this.marker_date,
          ...(label && { caption: label }),
          $type: "marker",
          requested_slug: "repere",
        })
      );
      if (created) this.marker_date = "";
      else {
        this.marker_error = this.error;
        this.showError("");
      }
    },
    openEmbedModal() {
      this.embed_error = "";
      this.show_embed_modal = true;
      this.is_open = false;
    },
    // as in dodoc: a .txt holding the URL, whose thumb adc-core makes from
    // the page's og:image
    async createEmbed(url) {
      this.embed_error = "";
      const created = await this.create((onProgress) =>
        this.uploadFile(
          this.path_to_folder,
          new File([url], "lien.txt", { type: "text/plain" }),
          { ...this.newMediaMeta(), $type: "url" },
          onProgress
        )
      );
      if (created) this.show_embed_modal = false;
      else {
        this.embed_error = this.error;
        this.showError("");
      }
    },

    // a sound captured in the browser (CaptureModal.vue)
    openCaptureModal() {
      this.capture_error = "";
      this.show_capture_modal = true;
      this.is_open = false;
    },
    async createCapture(file) {
      this.capture_error = "";
      const created = await this.create((onProgress) =>
        this.uploadFile(
          this.path_to_folder,
          file,
          { ...this.newMediaMeta(), $type: "audio" },
          onProgress
        )
      );
      if (created) this.show_capture_modal = false;
      else {
        this.capture_error = this.error;
        this.showError("");
      }
    },

    /* FILES */

    onInputChange(event) {
      this.emitFiles(event.target.files);
      // the same file can be chosen again
      event.target.value = "";
    },
    onDrop(event) {
      this.endDrag();
      if (!this.disabled) this.emitFiles(event.dataTransfer?.files);
    },
    endDrag() {
      clearTimeout(this.dragover_timeout);
      this.is_dragover = false;
      this.is_over_zone = false;
    },
    emitFiles(file_list) {
      const files = Array.from(file_list || []);
      if (!files.length) return;
      this.is_open = false;
      this.$emit("files", files);
    },

    /* DOCUMENT EVENTS */

    // dragover fires continuously while dragging: the veil stays until it
    // stops for a moment (dragged out of the window, Escape)
    onDocumentDragOver(event) {
      if (this.disabled || !event.dataTransfer?.types.includes("Files")) return;
      // files dropped outside the zone would be opened by the browser
      event.preventDefault();
      this.is_over_zone = !!event.target.closest?.(".m_addMedias--dropZone");
      // the cursor says it too: a + over the zone, "not allowed" elsewhere
      event.dataTransfer.dropEffect = this.is_over_zone ? "copy" : "none";
      this.is_dragover = true;
      clearTimeout(this.dragover_timeout);
      this.dragover_timeout = setTimeout(this.endDrag, 300);
    },
    // outside the zone: nothing happens
    onDocumentDrop(event) {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      this.endDrag();
    },
    onDocumentPointerDown(event) {
      if (this.is_open && !this.$el.contains(event.target))
        this.is_open = false;
    },

    showError(message) {
      this.error = message;
      clearTimeout(this.error_timeout);
      if (message)
        this.error_timeout = setTimeout(() => (this.error = ""), 6000);
    },
  },
};
</script>

<style lang="scss" scoped>
.m_addMedias {
  position: fixed;
  right: max(4vw, env(safe-area-inset-right, 0px));
  bottom: max(6vh, env(safe-area-inset-bottom, 0px));
  z-index: 100;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-end;
  gap: var(--spacing-small);
  // only the buttons catch clicks: the page stays usable around them
  pointer-events: none;
}

.m_addMedias--options {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: var(--spacing-small);
  // centered above the 64px toggle
  width: 64px;
  margin: 0;
  padding: 0;
  list-style: none;

  > li {
    opacity: 0;
    transform: translateY(5px) scale(0.8);
    transition:
      opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1),
      transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    transition-delay: var(--delay);

    .is--open & {
      opacity: 1;
      transform: none;
      pointer-events: auto;
    }
  }
}

.m_addMedias--option,
.m_addMedias--toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
  background-color: var(--c-noir);
  color: white;
  box-shadow: -0.1em 0.2em 1em rgb(0 0 0 / 35%);
  cursor: pointer;

  &:active {
    background-color: var(--c-vert_vif);
    color: var(--c-noir);
  }
}

.m_addMedias--option {
  width: 48px;
  height: 48px;
  margin: 0;
  transition: background-color 0.25s ease-out;

  svg {
    width: 40px;
    height: 40px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;

    :deep(._fill) {
      fill: currentColor;
      stroke: none;
    }
  }

  input[type="file"] {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  &:disabled,
  &.is--disabled {
    background-color: var(--c-gris);
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--c-gris);
    outline-offset: 2px;
  }
}

// on the left of each option, on hover; always shown on touch screens
.m_addMedias--label {
  position: absolute;
  top: 50%;
  right: calc(100% + 15px);
  padding: 3px 6px;
  border-radius: 3px;
  background-color: var(--c-noir);
  color: white;
  box-shadow: 2px 4px 13px rgb(0 0 0 / 20%);
  font-size: var(--font-size-small);
  line-height: 1.25;
  white-space: nowrap;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.08s;
  pointer-events: none;

  .m_addMedias--option:hover &,
  .m_addMedias--option:focus-visible & {
    opacity: 1;
  }

  @media (hover: none) {
    opacity: 1;
  }
}

.m_addMedias--toggle {
  width: 64px;
  height: 64px;
  pointer-events: auto;
  transition:
    width 0.8s cubic-bezier(0.19, 1, 0.22, 1),
    height 0.8s cubic-bezier(0.19, 1, 0.22, 1),
    border-radius 0.8s cubic-bezier(0.19, 1, 0.22, 1),
    background-color 0.25s ease-out;

  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
    transition: transform 0.8s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .is--open & svg {
    transform: rotate(225deg);
  }

  &:disabled {
    background-color: var(--c-gris);
  }
  &:focus-visible {
    outline: 2px solid var(--c-gris);
    outline-offset: 2px;
  }
}

/* DROPPING FILES */

// the whole window: dropped here, outside the zone, nothing happens
.m_addMedias--dropOverlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-medium);
  padding: var(--spacing-medium);
  background-color: rgb(0 0 0 / 50%);
  backdrop-filter: blur(3px);
  pointer-events: auto;
}

// in the middle, large: dropped here, the files are added. Dashed and
// breathing while waiting; green, solid and a little bigger once over it
.m_addMedias--dropZone {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-medium);
  width: min(36rem, 100%);
  height: min(24rem, 60vh);
  padding: var(--spacing-medium);
  border: 3px dashed white;
  border-radius: 12px;
  background-color: rgb(255 255 255 / 8%);
  color: white;
  font-size: 1.25rem;
  text-align: center;
  animation: m_drop--breathe 1.6s ease-in-out infinite;
  transition:
    background-color 0.2s ease-out,
    border-color 0.2s ease-out,
    color 0.2s ease-out,
    transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);

  svg {
    width: 3rem;
    height: 3rem;
    fill: currentColor;
    transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .is--over & {
    border-style: solid;
    border-color: var(--c-noir);
    background-color: var(--c-vert_vif);
    color: var(--c-noir);
    transform: scale(1.03);
    animation: none;

    svg {
      transform: scale(1.25) rotate(90deg);
    }
  }
}

.m_addMedias--dropElsewhere {
  margin: 0;
  color: white;
  font-size: var(--font-size-small);
  opacity: 0.8;
  transition: opacity 0.2s;

  .is--over & {
    opacity: 0.4;
  }
}

@keyframes m_drop--breathe {
  50% {
    border-color: rgb(255 255 255 / 55%);
  }
}

.m_drop-enter-active,
.m_drop-leave-active {
  transition: opacity 0.2s;
}
.m_drop-enter-from,
.m_drop-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .m_addMedias--dropZone {
    animation: none;
  }
}

.m_addMedias--error {
  max-width: 16rem;
  margin: 0;
  padding: 3px 6px;
  border-radius: 3px;
  background-color: var(--c-rouge);
  color: white;
  font-size: var(--font-size-small);
  pointer-events: auto;
}
</style>
