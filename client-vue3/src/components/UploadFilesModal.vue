<template>
  <!-- v2's UploadFile.vue: the chosen files are sent one by one, each with
  its progress. Once sent, each shows what adc-core extracted from it, and
  its date on the timeline can be changed right away. -->
  <BaseModal wide :disabled="is_busy" @close="requestClose" @submit="close">
    <template #header>
      {{ $t("import_medias") }}
      <span class="m_upload--count">{{ count_done }} / {{ items.length }}</span>
    </template>

    <!-- the name, given without an account: saved with every file, and
    remembered by this browser (contributor.js) -->
    <div class="m_modal--field">
      <label for="upload_name">{{ $t("your_name") }}</label>
      <input
        id="upload_name"
        v-model="name"
        type="text"
        autocomplete="name"
        @change="applyName"
      />
      <small>{{ $t("your_name_instructions") }}</small>
    </div>

    <ul class="m_upload--list">
      <li
        v-for="item in items"
        :key="item.id"
        class="m_upload--item"
        :class="`is--${item.status}`"
        :style="{ '--progress': item.progress }"
      >
        <div class="m_upload--row">
          <div class="m_upload--preview">
            <img
              v-if="previewOf(item)"
              :src="previewOf(item)"
              alt=""
              loading="lazy"
            />
            <span v-else class="font-verysmall text-cap">
              {{ extensionOf(item.file) }}
            </span>
          </div>

          <div class="m_upload--name">
            <div :title="item.file.name">{{ item.file.name }}</div>
            <div class="font-verysmall">
              {{ formatBytes(item.file.size) }}
              ·
              <template v-if="item.status === 'sending'">
                {{ $t("sending") }} {{ Math.round(item.progress * 100) }} %
              </template>
              <template v-else>{{ $t(`upload_${item.status}`) }}</template>
            </div>
          </div>

          <button
            v-if="item.status === 'failed'"
            type="button"
            class="textLink font-small"
            @click="retry(item)"
          >
            {{ $t("retry") }}
          </button>

          <button
            v-if="item.status !== 'failed'"
            type="button"
            class="m_upload--choice m_upload--captionButton"
            :class="{ 'is--active': showsCaption(item) }"
            :aria-expanded="showsCaption(item)"
            :aria-controls="`upload_caption_${item.id}`"
            @click="toggleCaption(item)"
          >
            {{ $t(item.caption.trim() ? "caption" : "add_caption") }}
          </button>
        </div>

        <p v-if="item.error" class="form-error m_upload--error">
          {{ item.error }}
        </p>

        <!-- unfolded by « Ajouter une légende », open once written -->
        <div v-if="showsCaption(item)" class="m_upload--caption">
          <textarea
            :id="`upload_caption_${item.id}`"
            v-model="item.caption"
            rows="2"
            :aria-label="$t('caption')"
            :placeholder="$t('caption_placeholder')"
            @change="applyCaption(item)"
          />
        </div>

        <template v-if="item.status === 'done'">
          <div class="m_upload--date">
            <div class="font-small">{{ $t("date_on_timeline") }}</div>
            <div class="m_upload--choices">
              <button
                v-for="option in dateOptions(item)"
                :key="option.key"
                type="button"
                class="m_upload--choice"
                :class="{
                  'is--active':
                    !item.show_custom && isCurrentDate(item, option.date),
                }"
                :disabled="item.is_saving"
                @click="pickDate(item, option.date)"
              >
                {{ $t(option.label) }}
                <span class="font-verysmall">
                  {{ formatDate(option.date) }}
                </span>
              </button>
              <button
                type="button"
                class="m_upload--choice"
                :class="{ 'is--active': item.show_custom || isCustom(item) }"
                :aria-expanded="item.show_custom"
                :disabled="item.is_saving"
                @click="item.show_custom = !item.show_custom"
              >
                {{ $t("custom_date") }}
                <span v-if="isCustom(item)" class="font-verysmall">
                  {{ formatDate(currentDate(item)) }}
                </span>
              </button>
            </div>
            <input
              v-if="item.show_custom"
              type="datetime-local"
              class="m_upload--custom"
              :aria-label="$t('custom_date')"
              :value="toInputValue(currentDate(item))"
              :disabled="item.is_saving"
              @change="onCustomDate(item, $event)"
            />
            <p v-if="item.date_error" class="form-error">
              {{ item.date_error }}
            </p>
          </div>
        </template>
      </li>
    </ul>

    <!-- closing while files are sent (the cross, Escape, a click beside the
    window): asked first, and brought into view, under a long list too -->
    <div
      v-if="confirm_close"
      ref="confirm"
      class="m_modal--field m_upload--confirm"
      role="alertdialog"
      aria-labelledby="upload_confirm_text"
    >
      <p id="upload_confirm_text">{{ $t("uploads_in_progress") }}</p>
      <button
        ref="continue_button"
        type="button"
        class="m_upload--choice is--active"
        @click="confirm_close = false"
      >
        {{ $t("continue_import") }}
      </button>
      <button type="button" class="m_upload--choice is--danger" @click="close">
        {{ $t("stop_import") }}
      </button>
    </div>

    <template #submit_button>{{ $t("finish") }}</template>
  </BaseModal>
</template>

<script>
import { ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { mapActions, mapState } from "pinia";
import { thumbURL } from "@/adc/api";
import { i18n } from "@/i18n";
import { useContentStore } from "@/stores/content";
import { useSessionStore } from "@/stores/session";
import { useUnseenStore } from "@/stores/unseen";
import { contributor_name, creditsMeta } from "@/contributor";
import BaseModal from "./BaseModal.vue";

// previews read from the disk: shrunk to this width, one image at a time.
// Shown as they are, a few photos from a recent phone (48 Mpx, ~190 MB
// each once decoded, whatever their weight on disk) made the browser
// crash and reload the page: the window never showed up.
const PREVIEW_WIDTH = 220;
// beyond this, not even read
const MAX_PREVIEW_SIZE = 40 * 1024 * 1024;
// two dates closer than this are the same one (seconds are not shown)
const SAME_DATE_MS = 60 * 1000;

let next_id = 0;

// a small JPEG of an image file, or null if the browser can't read it
// (HEIC outside Safari…). An <img> rather than createImageBitmap: it
// follows the photo's EXIF orientation everywhere.
async function shrinkImage(file, width) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  try {
    img.src = url;
    await img.decode();
    const scale = Math.min(1, width / img.naturalWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    );
    // frees the canvas' memory right away (Safari keeps it otherwise)
    canvas.width = canvas.height = 0;
    return blob;
  } catch {
    return null;
  } finally {
    img.src = "";
    URL.revokeObjectURL(url);
  }
}

export default {
  components: { BaseModal },
  props: {
    // the cahier, e.g. "cahiers/mon-cahier"
    path_to_folder: { type: String, required: true },
    files: { type: Array, required: true },
  },
  emits: ["close"],
  // Leaving the cahier while files are sent (the browser's back button, a
  // phone's back gesture) would stop them: asked first. is_sending follows
  // is_busy (watch)
  setup() {
    const is_sending = ref(false);
    onBeforeRouteLeave(
      () => !is_sending.value || window.confirm(i18n.global.t("uploads_leave"))
    );
    return { is_sending };
  },
  data() {
    return {
      items: this.files.map((file) => ({
        id: next_id++,
        file,
        // pending, sending, done, failed
        status: "pending",
        progress: 0,
        error: "",
        // what adc-core sends back
        meta: undefined,
        preview_url: undefined,
        is_saving: false,
        // typed here, sent with the file, or saved once it is sent
        caption: "",
        // the caption field, unfolded
        show_caption: false,
        sent_caption: "",
        // the date field, behind « Date personnalisée »
        show_custom: false,
        date_error: "",
      })),
      is_running: false,
      confirm_close: false,
    };
  },
  computed: {
    // the shared, remembered name (contributor.js)
    name: {
      get() {
        return contributor_name.value;
      },
      set(value) {
        contributor_name.value = value;
      },
    },
    ...mapState(useSessionStore, ["token_path"]),
    ...mapState(useContentStore, ["getFolder"]),
    is_busy() {
      return this.items.some((item) =>
        ["pending", "sending"].includes(item.status)
      );
    },
    count_done() {
      return this.items.filter((item) => item.status === "done").length;
    },
  },
  watch: {
    // closing or reloading the tab while files are sent: the browser asks
    is_busy: {
      immediate: true,
      handler(busy) {
        this.is_sending = busy;
        if (busy) window.addEventListener("beforeunload", this.onBeforeUnload);
        else window.removeEventListener("beforeunload", this.onBeforeUnload);
      },
    },
  },
  created() {
    this.abort_controller = new AbortController();
    this.run();
    this.makePreviews();
  },
  beforeUnmount() {
    window.removeEventListener("beforeunload", this.onBeforeUnload);
    this.abort_controller.abort();
    for (const item of this.items)
      if (item.preview_url) URL.revokeObjectURL(item.preview_url);
  },
  methods: {
    ...mapActions(useContentStore, ["uploadFile", "updateFile"]),
    ...mapActions(useUnseenStore, { addUnseen: "add" }),

    /* UPLOAD, ONE FILE AFTER THE OTHER */

    async run() {
      if (this.is_running) return;
      this.is_running = true;
      let item;
      while ((item = this.items.find((i) => i.status === "pending")))
        await this.send(item);
      this.is_running = false;
      this.confirm_close = false;
    },
    async send(item) {
      item.status = "sending";
      item.progress = 0;
      item.error = "";
      try {
        const { uploaded_meta } = await this.uploadFile(
          this.path_to_folder,
          item.file,
          {
            // visible right away: adc-core makes it private otherwise
            $status: "public",
            $authors: this.token_path ? [this.token_path] : [],
            // the capture date, read by adc-core from the file (EXIF,
            // creation_time…), is only known once sent: until then, its
            // modification date, which adc-core falls back on
            date_timeline: new Date(item.file.lastModified).toISOString(),
            $client_file_last_modified: item.file.lastModified,
            ...creditsMeta(),
            ...(item.caption.trim() && { caption: item.caption.trim() }),
          },
          (ratio) => (item.progress = ratio),
          this.abort_controller.signal
        );
        item.meta = uploaded_meta;
        item.progress = 1;
        item.status = "done";
        item.sent_caption = uploaded_meta.caption || "";
        // typed while the file was on its way
        await this.applyCaption(item);
        // outlined in the cahier until seen
        this.addUnseen(uploaded_meta.$path);
        // by default, the capture date
        if (
          !this.isSameDate(
            uploaded_meta.date_timeline,
            uploaded_meta.$date_created
          )
        )
          await this.setDate(item, uploaded_meta.$date_created);
      } catch (err) {
        if (err.code === "upload_aborted") return;
        item.status = "failed";
        item.progress = 0;
        item.error = this.errorMessage(err);
      }
    },
    showsCaption(item) {
      return item.show_caption || !!item.caption.trim();
    },
    toggleCaption(item) {
      const open = !this.showsCaption(item);
      item.show_caption = open;
      if (open)
        this.$nextTick(() =>
          document.getElementById(`upload_caption_${item.id}`)?.focus()
        );
    },
    // the caption of a file already sent; the others take it when sent
    async applyCaption(item) {
      const caption = item.caption.trim();
      if (item.status !== "done" || caption === item.sent_caption) return;
      try {
        await this.updateFile(item.meta.$path, { caption });
        item.sent_caption = caption;
      } catch (err) {
        item.error = this.errorMessage(err);
      }
    },
    // a name given once some files are sent: on them too
    async applyName() {
      const $credits = this.name.trim();
      for (const item of this.items)
        if (item.status === "done" && (item.meta.$credits || "") !== $credits)
          try {
            await this.updateFile(item.meta.$path, { $credits });
            item.meta = { ...item.meta, $credits };
          } catch (err) {
            item.error = this.errorMessage(err);
          }
    },
    retry(item) {
      item.status = "pending";
      this.run();
    },
    errorMessage(err) {
      if (err.code === "file_size_limit_exceeded")
        return this.$t("file_too_big", {
          max: err.err_infos?.upload_max_file_size_in_mo,
        });
      if (err.code === "network_error") return this.$t("network_error");
      return this.$t("error_with_code", { code: err.code || err.message });
    },

    /* DATE ON THE TIMELINE */

    // the meta as kept up to date by the cahier's room, or as sent back
    liveMeta(item) {
      return (
        this.getFolder(this.path_to_folder)?.$files?.find(
          (f) => f.$path === item.meta.$path
        ) || item.meta
      );
    },
    currentDate(item) {
      return this.liveMeta(item).date_timeline;
    },
    // the dates this file offers: without duplicates
    dateOptions(item) {
      const options = [
        {
          key: "file",
          label: this.fileDateLabel(item),
          date: item.meta.$date_created,
        },
        // adc-core found a date inside the file (EXIF, video…): the date
        // the file was last modified is another one
        {
          key: "modified",
          label: "date_of_modification",
          date: new Date(item.file.lastModified).toISOString(),
        },
        {
          key: "import",
          label: "date_of_import",
          date: item.meta.$date_uploaded,
        },
      ];
      return options.filter(
        (option, index) =>
          option.date &&
          !options
            .slice(0, index)
            .some((o) => o.date && this.isSameDate(o.date, option.date))
      );
    },
    // a photo, a video, a sound: its $date_created is when it was taken
    // (EXIF, creation_time), or its modification date if it holds none
    fileDateLabel(item) {
      return ["image", "video", "audio"].includes(item.meta.$type)
        ? "captured_on"
        : "date_of_file";
    },
    isSameDate(a, b) {
      return !!a && !!b && Math.abs(new Date(a) - new Date(b)) < SAME_DATE_MS;
    },
    isCurrentDate(item, date) {
      return this.isSameDate(this.currentDate(item), date);
    },
    isCustom(item) {
      return !this.dateOptions(item).some((o) =>
        this.isCurrentDate(item, o.date)
      );
    },
    onCustomDate(item, event) {
      if (!event.target.value) return;
      const date = new Date(event.target.value);
      if (!isNaN(date)) this.setDate(item, date.toISOString());
    },
    pickDate(item, date) {
      item.show_custom = false;
      this.setDate(item, date);
    },
    async setDate(item, date) {
      if (!date) return;
      item.is_saving = true;
      item.date_error = "";
      try {
        await this.updateFile(item.meta.$path, { date_timeline: date });
        // until the room's fileUpdated event, if the cahier isn't open
        item.meta = { ...item.meta, date_timeline: date };
      } catch (err) {
        item.date_error = this.errorMessage(err);
      } finally {
        item.is_saving = false;
      }
    },

    /* DISPLAY */

    // one image after the other, until the window closes; the ones already
    // sent show adc-core's thumb instead
    async makePreviews() {
      const signal = this.abort_controller.signal;
      for (const item of this.items) {
        if (signal.aborted) return;
        if (
          item.meta ||
          !item.file.type.startsWith("image/") ||
          item.file.size > MAX_PREVIEW_SIZE
        )
          continue;
        const blob = await shrinkImage(item.file, PREVIEW_WIDTH);
        if (!blob) continue;
        if (signal.aborted) return;
        item.preview_url = URL.createObjectURL(blob);
      }
    },
    previewOf(item) {
      return (item.meta && thumbURL(item.meta, 220)) || item.preview_url;
    },
    extensionOf(file) {
      return file.name.includes(".") ? file.name.split(".").pop() : "?";
    },
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleString(i18n.global.locale.value, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    },
    formatBytes(bytes) {
      if (!bytes) return `0 ${this.$t("bytes")}`;
      const units = ["bytes", "kb", "mb", "gb"];
      const i = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
      );
      const value = bytes / 1024 ** i;
      return `${value.toLocaleString(i18n.global.locale.value, {
        maximumFractionDigits: i ? 1 : 0,
      })} ${this.$t(units[i])}`;
    },
    // datetime-local wants the local time, without zone
    toInputValue(date) {
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d)) return "";
      return new Date(d - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    },

    /* CLOSE */

    onBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = "";
    },

    async requestClose() {
      if (!this.is_busy) return this.close();
      this.confirm_close = true;
      await this.$nextTick();
      this.$refs.confirm?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      this.$refs.continue_button?.focus({ preventScroll: true });
    },
    // with the files sent, for the cahier to scroll to them
    close() {
      this.$emit(
        "close",
        this.items
          .filter((item) => item.status === "done")
          .map((item) => item.meta.$path)
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.m_upload--count {
  float: right;
  font-variant-numeric: tabular-nums;
}

.m_upload--list {
  margin: 0 var(--spacing-small);
  padding: 0;
  list-style: none;
}

.m_upload--item {
  position: relative;
  margin-bottom: var(--spacing-verysmall);
  padding: var(--spacing-small);
  border-radius: 4px;
  background-color: var(--c-noir);
  overflow: hidden;

  // the progress, as a green line under the item
  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 3px;
    background-color: var(--c-vert_vif);
    transform: scaleX(var(--progress, 0));
    transform-origin: left;
    transition: transform 0.2s linear;
  }
  &.is--done::after {
    opacity: 0;
    transition: opacity 1s 0.5s;
  }
  &.is--pending {
    opacity: 0.6;
  }
  &.is--failed {
    outline: 1px solid var(--c-rouge);
  }
}

.m_upload--row {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
}

.m_upload--preview {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 3px;
  background-color: var(--c-noir_light);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.m_upload--name {
  flex: 1 1 auto;
  min-width: 0;

  > :first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  > :last-child {
    color: var(--c-gris_clair);
  }
}

// next to the file's name, at the right
.m_upload--captionButton {
  flex: 0 0 auto;
  align-items: center;
}

.m_upload--caption {
  margin-top: var(--spacing-small);
}

.m_upload--error {
  margin: var(--spacing-verysmall) 0 0;
}

.m_upload--date {
  margin-top: var(--spacing-small);
  padding-top: var(--spacing-small);
  border-top: 1px solid var(--c-noir_light);

  > .font-small {
    margin-bottom: var(--spacing-verysmall);
    color: var(--c-gris_clair);
  }
}

.m_upload--choices {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-verysmall);
}

// a pill: a date to pick, or the import's mode
.m_upload--choice {
  display: inline-flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  margin: 0;
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--c-gris_fonce);
  border-radius: var(--radius-button);
  font-size: var(--font-size-small);
  line-height: 1.25;
  color: white;
  text-align: left;
  cursor: pointer;

  input[type="radio"] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  &:has(input:focus-visible) {
    outline: 2px solid var(--c-gris);
  }

  &:hover {
    border-color: var(--c-gris_clair);
  }
  // dark text: white on this green is too faint
  &.is--active {
    border-color: var(--c-vert_vif);
    background-color: var(--c-vert_vif);
    color: var(--c-noir);
  }
  &.is--danger {
    border-color: var(--c-rouge);
  }

  &:not(.is--active) .font-verysmall {
    opacity: 0.8;
  }
}

.m_upload--custom {
  width: auto;
  margin-top: var(--spacing-verysmall);
  height: auto;
  min-height: 2.4rem;
  border-color: var(--c-gris_fonce);
  background-color: transparent;
  color: white;
  font-size: var(--font-size-small);
  color-scheme: dark;

  // on the dark window: a light border once focused
  &:focus {
    border-color: var(--c-gris_clair);
  }
  &.is--active {
    border-color: var(--c-vert_vif);
  }
}

// yellow, as the conversion's warning (MediaModal.vue): hard to miss
.m_upload--confirm {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-verysmall);
  padding: var(--spacing-small);
  border-radius: 4px;
  background-color: var(--c-jaune);
  color: var(--c-noir);

  p {
    flex: 1 0 100%;
    margin: 0;
    font-weight: 600;
  }

  // readable on the yellow: solid green to go on, solid red to stop
  .m_upload--choice.is--active {
    border-color: var(--c-noir);
  }
  .m_upload--choice.is--danger {
    background-color: var(--c-rouge);
    color: white;
  }
}
</style>
