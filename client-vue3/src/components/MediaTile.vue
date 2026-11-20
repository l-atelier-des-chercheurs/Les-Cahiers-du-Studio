<template>
  <!-- one media, in the grid and on the timeline. As v2's MediaBlock.vue:
  the media fills the tile, with a dot in the colour of its author and its
  caption over the top left corner -->
  <div
    class="m_tile"
    :class="[
      `is--${type}`,
      { 'is--unseen': is_unseen, 'is--playing': is_playing },
    ]"
    v-seen-on-hover="media.$path"
    :data-path="media.$path"
    :aria-label="summary"
    role="button"
    tabindex="0"
    @click="onClick"
    @keydown.enter.space.prevent="$emit('open', media.$path)"
  >
    <!-- the whole text, formatted (HTML or Markdown), scrolling in the tile
    when longer; as plain text the instant the renderer loads -->
    <template v-if="type === 'text'">
      <!-- sanitised HTML (markdown.js) -->
      <div v-if="text_html" class="m_tile--text markdown" v-html="text_html" />
      <p v-else-if="text" class="m_tile--text is--plain">{{ plain_text }}</p>
      <p v-else class="m_tile--placeholder">{{ $t("empty_text") }}</p>
    </template>

    <svg
      v-else-if="type === 'marker'"
      class="m_tile--marker"
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="8.9" />
      <circle class="_fill" cx="20" cy="20" r="4.7" />
    </svg>

    <!-- played in place: the video instead of its thumb -->
    <video
      v-else-if="is_playing && type === 'video'"
      ref="player"
      :src="media_url"
      :poster="thumb"
      playsinline
      @timeupdate="onTimeUpdate"
      @ended="stopPlaying"
      @error="stopPlaying"
    />

    <!-- a sound: drawn bars, not its waveform thumb -->
    <svg
      v-else-if="type === 'audio'"
      class="m_tile--sound"
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <line
        v-for="[x, h] in SOUND_BARS"
        :key="x"
        :x1="x"
        :y1="20 - h"
        :x2="x"
        :y2="20 + h"
      />
    </svg>

    <img
      v-else-if="thumb"
      :src="thumb"
      :srcset="srcset || undefined"
      :sizes="sizes || undefined"
      alt=""
      loading="lazy"
      decoding="async"
    />

    <span v-else class="m_tile--placeholder text-cap">{{ extension }}</span>

    <!-- a sound played in place: its waveform stays shown -->
    <audio
      v-if="is_playing && type === 'audio'"
      ref="player"
      :src="media_url"
      @timeupdate="onTimeUpdate"
      @ended="stopPlaying"
      @error="stopPlaying"
    />

    <!-- plays in the tile, or stops: the icon, then, while playing, the
    time left, one button. The rest of the tile still
    opens the media -->
    <button
      v-if="can_play"
      type="button"
      class="m_tile--playButton"
      :aria-label="$t(is_playing ? 'stop' : 'play')"
      :title="$t(is_playing ? 'stop' : 'play')"
      @click.stop="togglePlay"
      @keydown.enter.space.stop
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect v-if="is_playing" x="7" y="7" width="10" height="10" />
        <polygon v-else points="8 5 19 12 8 19" />
      </svg>
      <span v-if="time_shown" class="m_tile--duration">{{ time_shown }}</span>
    </button>

    <!-- a PDF: said in the bottom left corner, where the others have
    their play button -->
    <span v-if="type === 'pdf'" class="m_tile--badge text-cap">PDF</span>
    <!-- a website: a globe, as in the + menu (AddMedias.vue) -->
    <span v-else-if="type === 'url'" class="m_tile--badge is--icon">
      <svg viewBox="10 10 20 20" aria-hidden="true">
        <circle cx="20" cy="20" r="8.5" />
        <ellipse cx="20" cy="20" rx="3.6" ry="8.5" />
        <line x1="11.5" y1="20" x2="28.5" y2="20" />
      </svg>
    </span>

    <div v-if="is_playing" class="m_tile--progress" aria-hidden="true">
      <span :style="{ transform: `scaleX(${progress})` }" />
    </div>

    <div v-if="author_color || legend" class="m_tile--top">
      <span
        v-if="author_color"
        class="m_tile--author"
        :style="{ '--author-color': author_color }"
        aria-hidden="true"
      />
      <!-- one line; hovered, the whole of it over that line, within the
      tile. Only the line is hovered: moving down, over the whole caption,
      hides it again -->
      <span v-if="legend" class="m_tile--captionLine">
        <span class="m_tile--caption">{{ legend }}</span>
        <span
          class="m_tile--caption is--full"
          :style="caption_lines && { '-webkit-line-clamp': caption_lines }"
          aria-hidden="true"
          >{{ legend }}</span
        >
      </span>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { mediaURL, thumbSrcset, thumbURL } from "@/adc/api";
import { mapState } from "pinia";
import { authorColor, dateOf, formatDuration, formatTime } from "@/medias";
import { play, release } from "@/playback";
import { useUnseenStore } from "@/stores/unseen";
import { vSeenOnHover } from "@/seenOnHover";

// one of the cahiers' thumb resolutions (settings_base.json): about 2× the
// tiles' width, for sharp thumbs on dense screens
const THUMB_RESOLUTION = 440;

// a sound's tile: bars at x, of half height h, on a 40×40 grid (the + menu
// drew its audio option so)
const SOUND_BARS = [
  [5.83, 1.7],
  [8.41, 3.5],
  [10.99, 2.2],
  [13.56, 4.9],
  [16.14, 2.5],
  [18.71, 3.1],
  [21.29, 1.9],
  [23.86, 2.7],
  [26.44, 6],
  [29.01, 2.7],
  [31.59, 3.7],
  [34.17, 1.4],
];

// Every tile's size, measured by one shared observer: the image's sizes
// follow it, for the browser to pick a sharp enough thumb (srcset)
const tile_sizes = new WeakMap();
let resize_observer;
function observeSize(el, callback) {
  resize_observer ||= new ResizeObserver((entries) => {
    for (const entry of entries) tile_sizes.get(entry.target)?.(entry);
  });
  tile_sizes.set(el, callback);
  resize_observer.observe(el);
}
function unobserveSize(el) {
  tile_sizes.delete(el);
  resize_observer?.unobserve(el);
}

// The text renderer (marked, DOMPurify) loads on the first text shown,
// apart from the page's main script, once for every tile
const renderText = ref(null);
let renderer_loading;
function loadRenderer() {
  renderer_loading ||= import("@/markdown").then(
    (module) => (renderText.value = module.renderText)
  );
}

export default {
  directives: { seenOnHover: vSeenOnHover },
  props: {
    media: { type: Object, required: true },
  },
  // open: the media's window, with its path
  emits: ["open"],
  computed: {
    ...mapState(useUnseenStore, ["isUnseen"]),
    // added from this browser and not seen yet: outlined
    is_unseen() {
      return this.isUnseen(this.media.$path);
    },
    type() {
      return this.media.$type || "other";
    },
    // the first author: who contributed it
    author() {
      const authors = this.media.$authors;
      return Array.isArray(authors) ? authors[0] : undefined;
    },
    author_color() {
      return authorColor(this.author);
    },
    // the default thumb, until the tile is measured
    thumb() {
      return thumbURL(this.media, THUMB_RESOLUTION);
    },
    // width / height of the image, read by adc-core
    aspect() {
      const { width, height } = this.media.$infos || {};
      return width > 0 && height > 0 ? width / height : 1;
    },
    srcset() {
      return this.tile_width ? thumbSrcset(this.media, this.aspect) : "";
    },
    // the width the image is drawn at: wider than the tile when cropped to
    // fill it (cover), narrower when shown whole (waveforms, pages)
    sizes() {
      if (!this.tile_width) return "";
      const fitted = this.tile_height * this.aspect;
      const contained = this.type === "pdf";
      const width = contained
        ? Math.min(this.tile_width, fitted)
        : Math.max(this.tile_width, fitted);
      return `${Math.ceil(width)}px`;
    },
    // a text media's content, whole
    text() {
      const content = this.media.$content;
      return typeof content === "string" ? content.trim() : "";
    },
    text_html() {
      return this.text && renderText.value ? renderText.value(this.text) : "";
    },
    // until then: without the editor's tags (shown as text, not HTML)
    plain_text() {
      return this.text.startsWith("<")
        ? this.text
            .replace(/<\/(p|h\d|li|blockquote)>|<br\s*\/?>/gi, "\n")
            .replace(/<[^>]*>/g, "")
            .trim()
        : this.text;
    },
    // the caption, or for links the site's name
    // the whole caption's lines, within the tile (5px around, 2px of
    // padding above and under; 0.7rem at 1.2, as in the styles)
    caption_lines() {
      if (!this.tile_height) return 0;
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      const line_height = 0.7 * rem * 1.2;
      return Math.max(1, Math.floor((this.tile_height - 14) / line_height));
    },
    legend() {
      const { caption, $content } = this.media;
      if (caption) return caption;
      if (this.type === "url" && typeof $content === "string") {
        try {
          return new URL($content.trim()).hostname.replace(/^www\./, "");
        } catch {
          return $content;
        }
      }
      return "";
    },
    // on hover: what the tile no longer writes out
    // its name for screen readers (no tooltip: the caption shows on the tile)
    summary() {
      return [
        formatTime(dateOf(this.media)),
        this.$t(`type_${this.type}`),
        this.author?.split("/").pop(),
        this.media.$credits,
        this.legend,
      ]
        .filter(Boolean)
        .join(" · ");
    },
    extension() {
      const name = this.media.$media_filename || "";
      return name.includes(".") ? name.split(".").pop() : "?";
    },
    media_url() {
      return mediaURL(this.media);
    },
    // a video's or sound's length in seconds: the player's once playing,
    // adc-core's until then
    duration() {
      const seconds = this.player_duration || +this.media.$infos?.duration;
      return seconds > 0 ? seconds : 0;
    },
    // "1:07"; while playing, the time left
    // while playing only: the time left
    time_shown() {
      if (!this.duration || !this.is_playing) return "";
      return formatDuration(Math.max(0, this.duration - this.current_time));
    },
    // videos and sounds play in the tile
    can_play() {
      return ["video", "audio"].includes(this.type) && !!this.media_url;
    },
  },
  data() {
    return {
      // the tile's size on screen, in CSS pixels
      tile_width: 0,
      tile_height: 0,
      SOUND_BARS,
      is_playing: false,
      // 0 to 1, while playing
      progress: 0,
      // seconds, while playing
      current_time: 0,
      player_duration: 0,
    };
  },
  created() {
    if (this.type === "text") loadRenderer();
  },
  mounted() {
    observeSize(this.$el, ({ contentRect }) => {
      this.tile_width = Math.round(contentRect.width);
      this.tile_height = Math.round(contentRect.height);
    });
  },
  beforeUnmount() {
    unobserveSize(this.$el);
    // leaving the timeline or the grid: silence
    this.stopPlaying();
  },
  methods: {
    togglePlay() {
      if (this.is_playing) this.stopPlaying();
      else this.startPlaying();
    },
    // the player appears, then plays: from the start each time (a stop,
    // not a pause). Whatever played elsewhere stops (playback.js)
    async startPlaying() {
      play(this.stopPlaying);
      this.progress = 0;
      this.is_playing = true;
      await this.$nextTick();
      try {
        await this.$refs.player?.play();
      } catch {
        this.stopPlaying();
      }
    },
    stopPlaying() {
      this.$refs.player?.pause();
      this.is_playing = false;
      this.progress = 0;
      this.current_time = 0;
      release(this.stopPlaying);
    },
    onTimeUpdate(event) {
      const { currentTime, duration } = event.target;
      this.current_time = currentTime;
      if (duration > 0 && Number.isFinite(duration)) {
        this.player_duration = duration;
        this.progress = currentTime / duration;
      }
    },
    // a link in a text opens itself, not the media's window
    onClick(event) {
      if (event.target.closest?.("a")) return;
      this.$emit("open", this.media.$path);
    },
  },
};
</script>

<style lang="scss" scoped>
.m_tile {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  aspect-ratio: var(--tile-ratio, 1);
  border-radius: 4px;
  background-color: white;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:focus-visible {
    outline: 2px solid var(--c-noir);
    outline-offset: 2px;
  }

  &:hover {
    z-index: 1;
    box-shadow:
      0 2px 10px rgb(0 0 0 / 19%),
      0 6px 26px rgb(0 0 0 / 3%);
  }

  // not seen yet: a green outline, until the media is opened
  &.is--unseen {
    box-shadow: 0 0 0 3px var(--c-vert_vif);
  }

  > img,
  > video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // pages: whole
  &.is--pdf > img {
    object-fit: contain;
  }
  &.is--audio,
  &.is--pdf,
  &.is--other {
    background-color: var(--c-gris_tresclair);
  }
}

// the whole text: scrolls in the tile when longer than it
.m_tile--text {
  align-self: stretch;
  width: 100%;
  margin: 0;
  // below the caption
  padding: calc(var(--spacing-small)) var(--spacing-small) var(--spacing-small);
  font-size: var(--font-size-small);
  line-height: 1.35;
  overflow-wrap: anywhere;
  overflow-y: auto;

  &.is--plain {
    white-space: pre-line;
  }
}

.m_tile--placeholder {
  margin: 0;
  color: var(--c-gris);
  font-size: var(--font-size-small);
}

.m_tile--marker {
  width: 50%;
  height: 50%;
  fill: none;
  stroke: var(--c-noir);

  ._fill {
    fill: var(--c-noir);
    stroke: none;
  }
}

.m_tile--sound {
  width: 60%;
  height: 60%;
  stroke: var(--c-noir);
  stroke-width: 1.2;
  stroke-linecap: round;

  .is--playing & {
    stroke: var(--c-vert_vif);
  }
}

// bottom left: plays in the tile, or stops; the duration on the right of
// the icon, on the same background. Rounded as the tile
.m_tile--playButton {
  position: absolute;
  bottom: 6px;
  left: 6px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  min-width: 1.6rem;
  padding: 0;
  border-radius: 4px;
  background-color: rgb(0 0 0 / 50%);
  color: white;
  transition: background-color 0.2s ease-out;

  svg {
    width: 1.6rem;
    height: 1.6rem;
    padding: 0.28rem;
    fill: white;
  }

  &:hover {
    background-color: rgb(0 0 0 / 70%);
  }
  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 1px;
  }
}

// the kind of file, as the play button: small capitals on a dark tab
.m_tile--badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  background-color: rgb(0 0 0 / 50%);
  color: white;
  font-size: var(--font-size-verysmall);
  letter-spacing: 0.08em;
  line-height: 1.2;
  pointer-events: none;

  // an icon: as large as the play button
  &.is--icon {
    padding: 0.28rem;

    svg {
      display: block;
      width: 1.04rem;
      height: 1.04rem;
      fill: none;
      stroke: white;
      stroke-width: 1.4px;
    }
  }
}

// small, in the play button, on the right of its icon
.m_tile--duration {
  padding-right: 0.5rem;
  font-size: var(--font-size-verysmall);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

// along the bottom edge, while playing
.m_tile--progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgb(0 0 0 / 15%);
  pointer-events: none;

  > span {
    display: block;
    height: 100%;
    background-color: var(--c-vert_vif);
    transform-origin: left;
  }
}

// over the top left corner: the author's dot, then the caption
.m_tile--top {
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
  pointer-events: none;
}

.m_tile--author {
  --w: 6px;
  flex: 0 0 auto;
  width: var(--w);
  height: var(--w);
  border-radius: 50%;
  background-color: var(--author-color);
  // visible on light and dark images
  // box-shadow:
  //   0 0 0 0px white,
  //   0 1px 3px rgb(0 0 0 / 35%);
}

.m_tile--captionLine {
  position: relative;
  min-width: 0;
  display: flex;
}

.m_tile--caption {
  min-width: 0;
  padding: 2px 4px;
  border-radius: 2px;
  background-color: white;
  box-shadow: -0.1em 0.2em 1em rgb(0 0 0 / 35%);
  font-size: var(--font-size-verysmall);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  // the line: hovered with the mouse
  &:not(.is--full) {
    pointer-events: auto;
  }

  // the whole caption, over the line, as wide as it may be; as many lines
  // as the tile has room for (caption_lines), the last one cut
  &.is--full {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    display: none;
    -webkit-box-orient: vertical;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  &:hover + .is--full {
    display: -webkit-box;
  }
}
</style>
