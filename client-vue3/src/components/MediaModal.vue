<template>
  <!-- v2's EditMedia.vue: the media large on the left, its fields on the
  right, "save and close" under them. The arrows (and the keyboard's) go
  to the previous or next media on the timeline. Read only for those who
  can't edit the cahier. -->
  <BaseModal
    :slide_key="media.$path"
    :slide_direction="direction"
    :mobile_preview_height="
      type === 'audio' ? `calc(2 * ${AUDIO_PLAYER_HEIGHT})` : ''
    "
    :disabled="!is_dirty || is_saving"
    @close="request('close')"
    @submit="save('close')"
  >
    <template #header>
      <span
        v-if="author_color"
        class="m_media--authorDot"
        :style="{ '--author-color': author_color }"
        aria-hidden="true"
      />
      {{ $t(`type_${type}`) }}
    </template>

    <!-- a repère has nothing to show: a compact window, with its fields -->
    <template v-if="!is_marker" #preview>
      <div class="m_media--preview" :class="`is--${type}`">
        <!-- image: a large thumb, whole -->
        <div v-if="type === 'image'" class="m_media--image">
          <img :src="large_thumb || media_url" alt="" />
        </div>

        <video
          v-else-if="type === 'video'"
          :key="media.$path"
          :src="media_url"
          :poster="large_thumb"
          controls
          preload="metadata"
        />

        <!-- a sound: its player only (its waveform thumb tells nothing) -->
        <div
          v-else-if="type === 'audio'"
          class="m_media--audio"
          :style="{ '--audio-height': AUDIO_PLAYER_HEIGHT }"
        >
          <audio
            :key="media.$path"
            :src="media_url"
            controls
            preload="metadata"
          />
        </div>

        <!-- text: edited as in v2 (Quill, saved as HTML), or read -->
        <TextEditor
          v-else-if="type === 'text' && can_edit"
          v-model="form.content"
          :aria-label="$t('text')"
          :placeholder="$t('text_placeholder')"
        />
        <!-- sanitised HTML (markdown.js) -->
        <div
          v-else-if="type === 'text'"
          class="m_media--rendered markdown"
          v-html="rendered_text"
        />

        <div v-else-if="type === 'marker'" class="m_media--marker">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="8.9" />
            <circle class="_fill" cx="20" cy="20" r="4.7" />
          </svg>
          <p v-if="form.caption">{{ form.caption }}</p>
        </div>

        <div v-else-if="type === 'url'" class="m_media--url">
          <img v-if="large_thumb" :src="large_thumb" alt="" />
          <a
            v-if="safe_url"
            :href="safe_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t("open_link") }} ↗
          </a>
        </div>

        <!-- pdf: its first page, the viewer only once asked for -->
        <iframe
          v-else-if="type === 'pdf' && is_pdf_loaded"
          :src="media_url"
          :title="media.$media_filename"
        />
        <div v-else-if="type === 'pdf'" class="m_media--pdf">
          <img v-if="large_thumb" :src="large_thumb" alt="" />
          <button type="button" class="button" @click="is_pdf_loaded = true">
            {{ $t("load_pdf") }}
          </button>
        </div>

        <div v-else class="m_media--other">
          <span class="text-cap">{{ extension }}</span>
          <span>{{ media.$media_filename }}</span>
        </div>
      </div>
    </template>

    <!-- link: its address -->
    <div v-if="type === 'url'" class="m_modal--field">
      <label for="media_url">{{ $t("url") }}</label>
      <input
        v-if="can_edit"
        id="media_url"
        v-model.trim="form.content"
        type="url"
      />
      <p v-else class="m_media--value">{{ form.content }}</p>
    </div>

    <div v-if="can_edit || form.caption" class="m_modal--field">
      <label for="media_caption">
        {{ $t(type === "marker" ? "label" : "caption") }}
      </label>
      <textarea
        v-if="can_edit"
        id="media_caption"
        ref="caption"
        v-model="form.caption"
        class="m_media--caption"
        rows="2"
      />
      <p v-else class="m_media--value">{{ form.caption }}</p>
    </div>

    <!-- the name given without an account ($credits) -->
    <div v-if="can_edit || form.credits" class="m_modal--field">
      <label for="media_credits">{{ $t("credits") }}</label>
      <input
        v-if="can_edit"
        id="media_credits"
        v-model="form.credits"
        type="text"
      />
      <p v-else class="m_media--value">{{ form.credits }}</p>
    </div>

    <div class="m_modal--field">
      <label for="media_date">{{ $t("date_on_timeline") }}</label>
      <template v-if="can_edit">
        <input
          id="media_date"
          type="datetime-local"
          class="m_media--date"
          :value="toInputValue(form.date)"
          @change="onDateInput"
        />
        <div class="m_media--choices">
          <button
            v-for="option in date_options"
            :key="option.key"
            type="button"
            class="m_media--choice"
            :class="{ 'is--active': isSameDate(form.date, option.date) }"
            @click="form.date = option.date"
          >
            {{ $t(option.label) }}
            <span class="font-verysmall">{{ formatDate(option.date) }}</span>
          </button>
        </div>
      </template>
      <p v-else class="m_media--value">{{ formatDate(form.date) }}</p>
    </div>

    <div
      v-if="!is_marker && (can_edit || form.keywords.length)"
      class="m_modal--field"
    >
      <label for="media_keyword">{{ $t("keywords") }}</label>
      <ul v-if="form.keywords.length" class="m_media--chips">
        <li v-for="keyword in form.keywords" :key="keyword">
          {{ keyword }}
          <button
            v-if="can_edit"
            type="button"
            :aria-label="$t('remove_item', { item: keyword })"
            @click="removeKeyword(keyword)"
          >
            ×
          </button>
        </li>
      </ul>
      <template v-if="can_edit">
        <input
          id="media_keyword"
          v-model="new_keyword"
          type="text"
          list="media_keywords_list"
          :placeholder="$t('add_keyword')"
          @keydown="onKeywordKey"
          @change="addKeyword"
        />
        <datalist id="media_keywords_list">
          <option v-for="keyword in keyword_suggestions" :key="keyword">
            {{ keyword }}
          </option>
        </datalist>
      </template>
    </div>

    <div class="m_modal--field">
      <label for="media_author">{{ $t("authors") }}</label>
      <ul v-if="form.authors.length" class="m_media--chips">
        <li v-for="path in form.authors" :key="path">
          <span
            class="m_media--authorDot"
            :style="{ '--author-color': authorColor(path) }"
            aria-hidden="true"
          />
          {{ authorName(path) }}
          <button
            v-if="can_edit"
            type="button"
            :aria-label="$t('remove_item', { item: authorName(path) })"
            @click="form.authors = form.authors.filter((a) => a !== path)"
          >
            ×
          </button>
        </li>
      </ul>
      <p v-else-if="!can_edit" class="m_media--value">—</p>
      <select
        v-if="can_edit && other_authors.length"
        id="media_author"
        value=""
        @change="addAuthor"
      >
        <option value="" disabled>{{ $t("add_author") }}</option>
        <option
          v-for="author in other_authors"
          :key="author.$path"
          :value="author.$path"
        >
          {{ author.name || author.$path.split("/").pop() }}
        </option>
      </select>
    </div>

    <!-- v2's round buttons (EditMedia.vue), in a row of equal columns -->
    <div class="m_modal--field m_media--actions">
      <a
        v-if="media_url"
        class="button button-round m_media--action"
        :href="media_url"
        :download="media.$media_filename"
      >
        <svg viewBox="0 0 49 49" aria-hidden="true">
          <circle cx="24.5" cy="24.5" r="24" />
          <polyline points="33.12 20.63 24.5 28.82 15.88 20.63" />
          <line x1="24.5" y1="28.82" x2="24.5" y2="12.53" />
          <line x1="13.26" y1="34.05" x2="35.74" y2="34.05" />
        </svg>
        <span class="text-cap font-verysmall">{{ $t("download") }}</span>
      </a>
      <!-- not played by every browser: converted, in place of the original -->
      <button
        v-if="can_edit && can_convert"
        type="button"
        class="button-round m_media--action"
        :class="{ 'is--busy': is_converting }"
        :disabled="is_converting || !!converting_path || is_dirty"
        :title="$t(is_dirty ? 'convert_save_first' : 'convert_instructions')"
        @click="convert"
      >
        <svg viewBox="0 0 49 49" aria-hidden="true">
          <circle cx="24.5" cy="24.5" r="24" />
          <polyline points="29.5 14.5 34.5 19.5 29.5 24.5" />
          <line x1="14.5" y1="19.5" x2="34.5" y2="19.5" />
          <polyline points="19.5 24.5 14.5 29.5 19.5 34.5" />
          <line x1="34.5" y1="29.5" x2="14.5" y2="29.5" />
        </svg>
        <span class="text-cap font-verysmall">
          {{
            is_converting
              ? $t("converting", { progress: convert_progress })
              : $t("convert")
          }}
        </span>
      </button>
      <button
        v-if="can_edit && has_thumbs"
        type="button"
        class="button-round m_media--action"
        :class="{ 'is--busy': is_regenerating }"
        :disabled="is_regenerating"
        @click="regenerate"
      >
        <svg viewBox="0 0 49 49" aria-hidden="true">
          <circle cx="24.5" cy="24.5" r="24" />
          <path d="M33.5,24.5a9,9,0,1,1-2.64-6.36" />
          <polyline points="31.6 12.4 31.6 18.5 25.5 18.5" />
        </svg>
        <span class="text-cap font-verysmall">{{ $t("refresh_thumb") }}</span>
      </button>
      <button
        v-if="can_edit"
        type="button"
        class="button-round m_media--action"
        :class="{ 'is--active': confirm_remove }"
        :aria-expanded="confirm_remove"
        @click="confirm_remove = !confirm_remove"
      >
        <svg viewBox="0 0 49 49" aria-hidden="true">
          <circle cx="24.5" cy="24.5" r="24" />
          <path
            d="M16.79,35.19l-.72-16.86H33l-.72,16.86a1.42,1.42,0,0,1-1.46,1.31H18.25A1.42,1.42,0,0,1,16.79,35.19Z"
          />
          <path
            d="M20.83,15.41v-2a.89.89,0,0,1,.92-.86h5.52a.89.89,0,0,1,.92.86v2Z"
          />
          <line x1="20.75" y1="34.18" x2="20.75" y2="21.01" />
          <line x1="24.66" y1="34.18" x2="24.66" y2="21.01" />
          <line x1="28.58" y1="34.18" x2="28.58" y2="21.01" />
          <line x1="14" y1="15.41" x2="35" y2="15.41" />
        </svg>
        <span class="text-cap font-verysmall">{{ $t("remove") }}</span>
      </button>
    </div>

    <!-- the app's notification is hidden under the window (a modal dialog
    is drawn above everything): the same warning, here -->
    <p
      v-if="is_converting"
      class="m_modal--field m_media--converting"
      role="status"
    >
      {{ $t("converting_keep_open") }}
    </p>

    <div v-if="confirm_remove" class="m_modal--field m_media--confirm">
      <p>{{ $t("sure_to_remove_media") }}</p>
      <button
        type="button"
        class="m_media--choice"
        @click="confirm_remove = false"
      >
        {{ $t("cancel") }}
      </button>
      <button
        type="button"
        class="m_media--choice is--danger is--active"
        :disabled="is_saving"
        @click="remove"
      >
        {{ $t("remove") }}
      </button>
    </div>

    <!-- what adc-core read from the file, folded -->
    <details
      v-if="!is_marker && meta_rows.length"
      class="m_modal--field m_media--meta"
    >
      <summary>{{ $t("metadata") }}</summary>
      <dl>
        <template v-for="row in meta_rows" :key="row.key">
          <dt>{{ $t(row.key) }}</dt>
          <dd>{{ row.value }}</dd>
        </template>
      </dl>
    </details>

    <p v-if="error" class="m_modal--field form-error">{{ error }}</p>

    <!-- ← and →, together, floating under the window -->
    <template v-if="has_prev || has_next" #nav>
      <nav class="m_media--nav" :aria-label="$t('navigation')">
        <button
          type="button"
          :disabled="!has_prev"
          :aria-label="$t('previous_media')"
          @click="request('prev')"
        >
          ←
        </button>
        <button
          type="button"
          :disabled="!has_next"
          :aria-label="$t('next_media')"
          @click="request('next')"
        >
          →
        </button>
      </nav>
    </template>

    <template v-if="can_edit" #submit_button>
      {{ $t("save_and_close") }}
    </template>
  </BaseModal>

  <!-- closing or changing media with unsaved changes: a window on top -->
  <BaseModal
    v-if="pending_action"
    :disabled="is_saving"
    @close="pending_action = ''"
    @submit="save(pending_action)"
  >
    <template #header>{{ $t("unsaved_changes_title") }}</template>
    <p class="m_modal--field">{{ $t("unsaved_changes") }}</p>
    <p v-if="error" class="m_modal--field form-error">{{ error }}</p>
    <div class="m_modal--field">
      <button type="button" class="textLink" @click="discard">
        {{ $t("dont_save") }}
      </button>
    </div>
    <template #submit_button>{{ $t("save") }}</template>
  </BaseModal>
</template>

<script>
import { mapActions } from "pinia";
import * as api from "@/adc/api";
import { i18n } from "@/i18n";
import { renderText } from "@/markdown";
import { authorColor, formatDuration } from "@/medias";
import { stopAll } from "@/playback";
import { useContentStore } from "@/stores/content";
import { useUnseenStore } from "@/stores/unseen";
import BaseModal from "./BaseModal.vue";
import TextEditor from "./TextEditor.vue";

// dates closer than this are the same (seconds are not shown)
const SAME_DATE_MS = 60 * 1000;

// a sound's player, as tall as Chrome draws it; on phones, its preview is
// twice as tall
const AUDIO_PLAYER_HEIGHT = "54px";

// What every browser plays: the container, then the codecs ($infos, read
// by adc-core; files probed before it kept codecs are judged by their
// extension only)
const WEB_VIDEO = {
  exts: ["mp4", "m4v", "webm"],
  video_codecs: ["h264", "vp8", "vp9", "av1"],
  audio_codecs: ["aac", "mp3", "opus", "vorbis"],
};
const WEB_AUDIO = {
  exts: ["mp3", "m4a", "aac", "ogg", "oga", "opus", "wav", "weba", "flac"],
  audio_codecs: ["aac", "mp3", "opus", "vorbis", "flac"],
};
// what adc-core's optimizer converts (Exporter.js, _optimizeMedia)
const CONVERTIBLE_VIDEO_EXTS = [
  "flv",
  "mov",
  "avi",
  "webm",
  "mp4",
  "mkv",
  "wmv",
  "qt",
];
const CONVERTIBLE_AUDIO_EXTS = [
  "amr",
  "wma",
  "aif",
  "flac",
  "ac3",
  "opus",
  "m4r",
  "m4a",
  "alac",
  "wav",
  "ogg",
  "mp3",
  "aac",
];

function isWebPlayable({ type, ext, video_codec, audio_codec }) {
  const audioOk = (codecs) =>
    !audio_codec || codecs.includes(audio_codec) || audio_codec.startsWith("pcm_");
  if (type === "video")
    return (
      WEB_VIDEO.exts.includes(ext) &&
      (!video_codec || WEB_VIDEO.video_codecs.includes(video_codec)) &&
      audioOk(WEB_VIDEO.audio_codecs)
    );
  return WEB_AUDIO.exts.includes(ext) && audioOk(WEB_AUDIO.audio_codecs);
}

export default {
  components: { BaseModal, TextEditor },
  props: {
    media: { type: Object, required: true },
    // contributors and admins of the cahier
    can_edit: { type: Boolean, default: false },
    has_prev: { type: Boolean, default: false },
    has_next: { type: Boolean, default: false },
    // every keyword of the cahier, suggested
    all_keywords: { type: Array, default: () => [] },
  },
  // replaced: the path of the media that took this one's place (converted)
  emits: ["close", "prev", "next", "replaced"],
  data() {
    return {
      AUDIO_PLAYER_HEIGHT,
      form: this.formFrom(this.media),
      new_keyword: "",
      // a pdf shows its thumb until its viewer is loaded
      is_pdf_loaded: false,
      is_saving: false,
      is_regenerating: false,
      // the media being converted for the web, and how far (0 to 100)
      converting_path: "",
      convert_progress: 0,
      error: "",
      confirm_remove: false,
      // close, prev or next, waiting for unsaved changes
      pending_action: "",
      // the last move, for the slide: prev or next
      direction: "next",
      // the instance's authors, to add some
      authors: [],
    };
  },
  computed: {
    type() {
      return this.media.$type || "other";
    },
    // a repère: only its label, date, who added it, and removing it
    is_marker() {
      return this.type === "marker";
    },
    media_url() {
      return api.mediaURL(this.media);
    },
    large_thumb() {
      return api.thumbURL(this.media, 1600);
    },
    // the types adc-core makes thumbs of
    has_thumbs() {
      return ["image", "video", "audio", "pdf", "url"].includes(this.type);
    },
    rendered_text() {
      return renderText(this.form.content);
    },
    // only http(s) links are opened
    safe_url() {
      try {
        const url = new URL(String(this.form.content).trim());
        return ["http:", "https:"].includes(url.protocol) ? url.href : "";
      } catch {
        return "";
      }
    },
    extension() {
      const name = this.media.$media_filename || "";
      return name.includes(".") ? name.split(".").pop() : "?";
    },
    // what it is converted to: "video" (MP4), "audio" (M4A), or "" when it
    // can't be. adc-core types only .mp4 / .webm as videos and a few
    // extensions as sounds: a .mov, .mkv, .amr… is "other", known here by
    // its extension
    convert_kind() {
      const ext = this.extension.toLowerCase();
      if (this.type === "video" || this.type === "audio") return this.type;
      if (this.type !== "other") return "";
      if (CONVERTIBLE_VIDEO_EXTS.includes(ext)) return "video";
      if (CONVERTIBLE_AUDIO_EXTS.includes(ext)) return "audio";
      return "";
    },
    // a video or sound some browsers can't play, that adc-core can convert
    can_convert() {
      const kind = this.convert_kind;
      if (!kind) return false;
      const ext = this.extension.toLowerCase();
      const convertible =
        CONVERTIBLE_VIDEO_EXTS.includes(ext) ||
        (kind === "audio" && CONVERTIBLE_AUDIO_EXTS.includes(ext));
      const { video_codec, audio_codec } = this.media.$infos || {};
      return (
        convertible &&
        !isWebPlayable({ type: kind, ext, video_codec, audio_codec })
      );
    },
    is_converting() {
      return !!this.converting_path && this.converting_path === this.media.$path;
    },
    author_color() {
      return authorColor(this.form.authors[0]);
    },
    // unsaved changes
    is_dirty() {
      return (
        JSON.stringify(this.form) !== JSON.stringify(this.formFrom(this.media))
      );
    },
    date_options() {
      // a repère has no file: when it was made, or now
      if (this.is_marker)
        return [
          {
            key: "created",
            label: "created_date",
            date: this.media.$date_created,
          },
          { key: "now", label: "now", date: new Date().toISOString() },
        ].filter((option) => option.date);
      const options = [
        {
          key: "file",
          label: ["image", "video", "audio"].includes(this.type)
            ? "captured_on"
            : "date_of_file",
          date: this.media.$date_created,
        },
        {
          key: "import",
          label: "date_of_import",
          date: this.media.$date_uploaded,
        },
        { key: "now", label: "now", date: new Date().toISOString() },
      ];
      return options.filter((option) => option.date);
    },
    // what adc-core read from the file
    meta_rows() {
      const media = this.media;
      const infos = media.$infos || {};
      const location = media.$location;
      return [
        { key: "type", value: this.$t(`type_${this.type}`) },
        { key: "file_name", value: media.$media_filename },
        {
          key: "dimensions",
          value:
            infos.width &&
            infos.height &&
            `${infos.width} × ${infos.height} px`,
        },
        {
          key: "duration",
          value: infos.duration && formatDuration(infos.duration),
        },
        { key: "weight", value: infos.size && this.formatBytes(infos.size) },
        {
          key: "location",
          value:
            location?.latitude &&
            `${(+location.latitude).toFixed(5)}, ${(+location.longitude).toFixed(5)}`,
        },
        {
          key: ["image", "video", "audio"].includes(this.type)
            ? "captured_on"
            : "date_of_file",
          value: this.formatDate(media.$date_created),
        },
        { key: "imported_on", value: this.formatDate(media.$date_uploaded) },
        { key: "last_modified", value: this.formatDate(media.$date_modified) },
      ].filter((row) => row.value);
    },
    keyword_suggestions() {
      return this.all_keywords.filter((k) => !this.form.keywords.includes(k));
    },
    other_authors() {
      return this.authors.filter((a) => !this.form.authors.includes(a.$path));
    },
  },
  watch: {
    // the previous or next media
    "media.$path"() {
      this.form = this.formFrom(this.media);
      this.new_keyword = "";
      this.is_pdf_loaded = false;
      this.error = "";
      this.confirm_remove = false;
      this.pending_action = "";
      this.markSeen(this.media.$path);
    },
    // typed, or another media's
    "form.caption"() {
      this.$nextTick(this.fitCaption);
    },
  },
  created() {
    this.markSeen(this.media.$path);
    if (this.can_edit) this.loadAuthors();
  },
  mounted() {
    // a video or sound playing in its tile stops
    stopAll();
    window.addEventListener("keydown", this.onKeydown);
    this.fitCaption();
  },
  beforeUnmount() {
    this.is_unmounted = true;
    window.removeEventListener("keydown", this.onKeydown);
  },
  methods: {
    ...mapActions(useContentStore, [
      "updateFile",
      "removeFile",
      "regenerateThumbs",
      "convertFile",
    ]),
    ...mapActions(useUnseenStore, ["markSeen"]),
    authorColor,

    // what the fields edit, from the media
    formFrom(media) {
      return {
        caption: media.caption || "",
        date: media.date_timeline || media.$date_created || "",
        keywords: Array.isArray(media.keywords)
          ? media.keywords.map(String)
          : [],
        authors: Array.isArray(media.$authors) ? [...media.$authors] : [],
        content: typeof media.$content === "string" ? media.$content : "",
        credits: media.$credits || "",
      };
    },
    // only what changed
    changes() {
      const before = this.formFrom(this.media);
      const changes = {};
      const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      if (this.form.caption !== before.caption)
        changes.caption = this.form.caption;
      if (this.form.date && this.form.date !== before.date)
        changes.date_timeline = this.form.date;
      if (!same(this.form.keywords, before.keywords))
        changes.keywords = this.form.keywords;
      if (this.form.credits.trim() !== before.credits)
        changes.$credits = this.form.credits.trim();
      if (!same(this.form.authors, before.authors))
        changes.$authors = this.form.authors;
      if (
        ["text", "url"].includes(this.type) &&
        this.form.content !== before.content
      )
        changes.$content = this.form.content;
      return changes;
    },
    async save(then) {
      if (this.is_saving) return;
      const changes = this.changes();
      if (Object.keys(changes).length) {
        this.is_saving = true;
        this.error = "";
        try {
          await this.updateFile(this.media.$path, changes);
        } catch (err) {
          this.error = this.$t("error_with_code", {
            code: err.code || err.message,
          });
          return;
        } finally {
          this.is_saving = false;
        }
      }
      this.pending_action = "";
      this.go(then);
    },
    // close, prev or next: first ask about unsaved changes
    request(action) {
      if (this.can_edit && this.is_dirty) this.pending_action = action;
      else this.go(action);
    },
    // close, prev or next; prev and next set the slide's direction
    go(action) {
      if (action === "prev" || action === "next") this.direction = action;
      this.$emit(action);
    },
    discard() {
      const action = this.pending_action;
      this.form = this.formFrom(this.media);
      this.pending_action = "";
      this.go(action);
    },
    async remove() {
      this.is_saving = true;
      this.error = "";
      try {
        await this.removeFile(this.media.$path);
        this.$emit("close");
      } catch (err) {
        this.error = this.$t("error_with_code", {
          code: err.code || err.message,
        });
      } finally {
        this.is_saving = false;
      }
    },

    // the new thumbs show once the server's fileUpdated event is in
    async regenerate() {
      this.is_regenerating = true;
      this.error = "";
      try {
        await this.regenerateThumbs(this.media.$path);
      } catch (err) {
        this.error = this.$t("error_with_code", {
          code: err.code || err.message,
        });
      } finally {
        this.is_regenerating = false;
      }
    },

    // MP4 (H.264, AAC) or M4A (AAC), by adc-core: the new media takes this
    // one's place (same caption, date, authors…), this one is removed. Goes
    // on if the window is closed or another media shown meanwhile
    async convert() {
      if (this.converting_path || this.is_dirty) return;
      const media = this.media;
      const path_to_folder = media.$path.split("/").slice(0, -1).join("/");
      const name = media.$media_filename;
      this.converting_path = media.$path;
      this.convert_progress = 0;
      this.error = "";
      try {
        const new_meta = await this.convertFile(
          media.$path,
          {
            recipe: "optimize_media",
            base_media_path: `${path_to_folder}/${name}`,
            suggested_file_name: name.replace(/\.[^.]+$/, ""),
            // a sound in a video container: kept a sound (M4A)
            ...(this.convert_kind === "audio" && { video_bitrate: "no_video" }),
          },
          (progress) => (this.convert_progress = progress)
        );
        // still shown: the window moves to the new media
        if (!this.is_unmounted && this.media.$path === media.$path)
          this.$emit("replaced", new_meta.$path);
        await this.removeFile(media.$path);
      } catch (err) {
        if (this.converting_path === this.media.$path)
          this.error = this.$t("error_with_code", {
            code: err.code || err.message,
          });
      } finally {
        this.converting_path = "";
      }
    },

    /* KEYWORDS AND AUTHORS */

    addKeyword() {
      const keyword = this.new_keyword.replace(/,/g, "").trim();
      this.new_keyword = "";
      if (keyword && !this.form.keywords.includes(keyword))
        this.form.keywords.push(keyword);
    },
    removeKeyword(keyword) {
      this.form.keywords = this.form.keywords.filter((k) => k !== keyword);
    },
    // Enter or a comma adds the keyword, Backspace in the empty field
    // removes the last one
    onKeywordKey(event) {
      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault();
        this.addKeyword();
      } else if (
        event.key === "Backspace" &&
        !this.new_keyword &&
        this.form.keywords.length
      )
        this.form.keywords.pop();
    },
    async loadAuthors() {
      try {
        this.authors = await api.getFolders("authors");
      } catch {
        // the field only lists the media's authors
      }
    },
    authorName(path) {
      const author = this.authors.find((a) => a.$path === path);
      return author?.name || path.split("/").pop();
    },
    addAuthor(event) {
      const path = event.target.value;
      if (path && !this.form.authors.includes(path))
        this.form.authors.push(path);
      event.target.value = "";
    },

    /* DATE */

    isSameDate(a, b) {
      return !!a && !!b && Math.abs(new Date(a) - new Date(b)) < SAME_DATE_MS;
    },
    onDateInput(event) {
      const date = new Date(event.target.value);
      if (event.target.value && !isNaN(date))
        this.form.date = date.toISOString();
    },
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleString(i18n.global.locale.value, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    },
    formatBytes(bytes) {
      const units = ["bytes", "kb", "mb", "gb"];
      const i = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
      );
      return `${(bytes / 1024 ** i).toLocaleString(i18n.global.locale.value, {
        maximumFractionDigits: i ? 1 : 0,
      })} ${this.$t(units[i])}`;
    },
    // the caption field: 2 lines at least, as many as the caption beyond,
    // up to 8 (max-height in the styles), then it scrolls
    fitCaption() {
      const el = this.$refs.caption;
      if (!el) return;
      el.style.height = "auto";
      // not laid out (hidden): its 2 rows
      if (!el.scrollHeight) return;
      const borders = el.offsetHeight - el.clientHeight;
      el.style.height = `${el.scrollHeight + borders}px`;
    },
    // datetime-local wants the local time, without zone
    toInputValue(date) {
      const d = new Date(date);
      if (!date || isNaN(d)) return "";
      return new Date(d - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    },

    // ← and →, out of the fields
    onKeydown(event) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey) return;
      const target = event.target;
      if (
        target.closest?.("input, textarea, select, [contenteditable]") ||
        this.pending_action ||
        this.confirm_remove
      )
        return;
      if (event.key === "ArrowLeft" && this.has_prev) this.request("prev");
      else if (event.key === "ArrowRight" && this.has_next)
        this.request("next");
      else return;
      event.preventDefault();
    },
  },
};
</script>

<style lang="scss" scoped>
.m_media--preview {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  > video,
  > iframe {
    width: 100%;
    height: 100%;
    border: none;
    background-color: black;
  }
  > iframe {
    background-color: white;
  }
}

// the whole image
.m_media--image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.m_media--audio,
.m_media--url,
.m_media--marker,
.m_media--other {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-medium);
  width: 100%;
  height: 100%;
  padding: var(--spacing-medium);
  color: white;

  img {
    max-width: 100%;
    min-height: 0;
    object-fit: contain;
  }
}

.m_media--audio {
  background-color: white;

  audio {
    width: 100%;
    height: var(--audio-height);
  }
}

// the first page, the button over its centre
.m_media--pdf {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  // solid, readable over any page
  .button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: var(--spacing-small) var(--spacing-medium);
    border-radius: 2em;
    background-color: var(--c-noir);
    color: var(--c-blanc);
    font-weight: 600;
    box-shadow: 0 0.25rem 1.5rem rgb(0 0 0 / 35%);
    transition:
      background-color 0.2s ease-out,
      transform 0.2s ease-out;

    &:hover,
    &:focus-visible {
      background-color: var(--c-noir_light);
      transform: translate(-50%, -50%) scale(1.05);
    }
  }
}

.m_media--url a {
  color: white;
  text-underline-offset: 0.15em;
}

.m_media--marker {
  svg {
    width: 6rem;
    height: 6rem;
    fill: none;
    stroke: white;
  }
  ._fill {
    fill: white;
    stroke: none;
  }
  p {
    margin: 0;
    font-size: var(--font-size-large);
    text-align: center;
  }
}

.m_media--other {
  background-color: var(--c-gris_tresclair);
  color: var(--c-noir);
}

.m_textEditor {
  width: 100%;
}

// the text itself: .markdown (assets/main.scss)
.m_media--rendered {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: var(--spacing-medium);
  background-color: white;
  color: black;
  overflow-y: auto;
}

// ← and → in a pill, under the window (BaseModal's nav slot)
.m_media--nav {
  display: flex;
  padding: 3px;
  border-radius: 999px;
  background-color: rgb(0 0 0 / 60%);
  box-shadow: 0 2px 10px rgb(0 0 0 / 25%);
  backdrop-filter: blur(4px);

  button {
    width: 2.5rem;
    height: 2.25rem;
    padding: 0;
    border-radius: 999px;
    color: white;
    font-size: 1.15rem;
    transition: background-color 0.15s;

    &:hover:not(:disabled) {
      background-color: rgb(255 255 255 / 15%);
    }
    &:disabled {
      opacity: 0.3;
    }
  }
}

// at the bottom, folded
.m_media--meta {
  font-size: var(--font-size-small);

  summary {
    color: var(--c-gris_clair);
    cursor: pointer;

    &:hover {
      color: white;
    }
  }

  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.15rem var(--spacing-small);
    margin: var(--spacing-verysmall) 0 0;
  }
  dt {
    color: var(--c-gris_clair);
  }
  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
}

.m_media--value {
  margin: 0;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

// grown to the caption by fitCaption(): 8 lines at most
.m_media--caption {
  max-height: calc(8lh + 2 * var(--spacing-small) + 2px);
}

.m_media--date {
  color-scheme: dark;
  background-color: transparent;
  color: white;

  // on the dark column: a light border once focused
  &:focus {
    border-color: var(--c-gris_clair);
  }
}

// v2's row: equal columns, each a round button with its label under it
.m_media--converting {
  padding: var(--spacing-verysmall) var(--spacing-small);
  border-radius: 4px;
  background-color: var(--c-jaune);
  color: var(--c-noir);
  font-size: var(--font-size-small);
}

.m_media--actions {
  display: flex;
  align-items: flex-start;
}

.m_media--action {
  flex: 1 1 0;
  padding: var(--spacing-verysmall);
  border-radius: 0;
  color: white;
  text-decoration: none;

  svg {
    fill: none;
    stroke: white;
    stroke-miterlimit: 10;
    transition: fill 0.15s;
  }
  &:hover svg,
  &.is--active svg {
    fill: var(--c-noir);
  }
  // regenerating: the arrow turns
  &.is--busy {
    cursor: progress;

    svg {
      animation: m_media--spin 1s linear infinite;
    }
  }
}

@keyframes m_media--spin {
  to {
    transform: rotate(360deg);
  }
}

.m_media--choices,
.m_media--confirm {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-verysmall);
}
.m_media--choices {
  margin-top: var(--spacing-verysmall);
}
.m_media--confirm p {
  flex: 1 0 100%;
  margin: 0;
}

// a pill, as in the import window
.m_media--choice {
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
  text-decoration: none;
  cursor: pointer;

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
  &.is--danger.is--active {
    background-color: var(--c-rouge);
    color: white;
  }
  &:not(.is--active) .font-verysmall {
    opacity: 0.8;
  }
}

.m_media--chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-verysmall);
  margin: 0 0 var(--spacing-verysmall);
  padding: 0;
  list-style: none;

  li {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.15rem 0.25rem 0.15rem 0.6rem;
    border-radius: 999px;
    background-color: var(--c-noir);
    font-size: var(--font-size-small);
  }
  button {
    padding: 0 0.35rem;
    border-radius: 50%;
    line-height: 1.2;
    color: var(--c-gris_clair);

    &:hover {
      color: white;
    }
  }
}

.m_media--authorDot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--author-color);
  box-shadow: 0 0 0 1.5px white;
  vertical-align: 1px;
}
</style>
