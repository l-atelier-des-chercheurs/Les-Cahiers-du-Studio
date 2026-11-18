<template>
  <!-- one media, in the grid and on the timeline. As v2's MediaBlock.vue:
  the media fills the tile, with a dot in the colour of its author and its
  caption over the top left corner -->
  <div
    class="m_tile"
    :class="[`is--${type}`, { 'is--unseen': is_unseen }]"
    :data-path="media.$path"
    :title="summary"
    role="button"
    tabindex="0"
    @click="onClick"
    @keydown.enter.space.prevent="$emit('open', media.$path)"
  >
    <!-- the whole text, formatted (Markdown), scrolling in the tile when
    longer; as plain text the instant the Markdown renderer loads -->
    <template v-if="type === 'text'">
      <!-- sanitised HTML (markdown.js) -->
      <div v-if="text_html" class="m_tile--text markdown" v-html="text_html" />
      <p v-else-if="text" class="m_tile--text is--plain">{{ text }}</p>
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

    <svg
      v-if="type === 'video'"
      class="m_tile--play"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <polygon points="8 5 19 12 8 19" />
    </svg>

    <div v-if="author_color || legend" class="m_tile--top">
      <span
        v-if="author_color"
        class="m_tile--author"
        :style="{ '--author-color': author_color }"
        aria-hidden="true"
      />
      <span v-if="legend" class="m_tile--caption">{{ legend }}</span>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { thumbSrcset, thumbURL } from "@/adc/api";
import { mapState } from "pinia";
import { authorColor, dateOf, formatTime } from "@/medias";
import { useUnseenStore } from "@/stores/unseen";

// one of the cahiers' thumb resolutions (settings_base.json): about 2× the
// tiles' width, for sharp thumbs on dense screens
const THUMB_RESOLUTION = 440;

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

// The Markdown renderer (marked, DOMPurify) loads on the first text shown,
// apart from the page's main script, once for every tile
const renderMarkdown = ref(null);
let markdown_loading;
function loadMarkdown() {
  markdown_loading ||= import("@/markdown").then(
    (module) => (renderMarkdown.value = module.renderMarkdown)
  );
}

export default {
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
      const contained = ["audio", "pdf"].includes(this.type);
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
      return this.text && renderMarkdown.value
        ? renderMarkdown.value(this.text)
        : "";
    },
    // the caption, or for links the site's name
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
  },
  data() {
    return {
      // the tile's size on screen, in CSS pixels
      tile_width: 0,
      tile_height: 0,
    };
  },
  created() {
    if (this.type === "text") loadMarkdown();
  },
  mounted() {
    observeSize(this.$el, ({ contentRect }) => {
      this.tile_width = Math.round(contentRect.width);
      this.tile_height = Math.round(contentRect.height);
    });
  },
  beforeUnmount() {
    unobserveSize(this.$el);
  },
  methods: {
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

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // waveforms and pages: whole
  &.is--audio > img,
  &.is--pdf > img {
    object-fit: contain;
  }
  &.is--audio {
    padding: var(--spacing-small);
  }
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
  padding: calc(var(--spacing-small) + 0.9rem) var(--spacing-small)
    var(--spacing-small);
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

.m_tile--play {
  position: absolute;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  border-radius: 50%;
  background-color: rgb(0 0 0 / 55%);
  fill: white;
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
}
</style>
