<template>
  <!-- one media, in the grid and on the timeline. As v2's MediaBlock.vue:
  the media fills the tile, with a dot in the colour of its author and its
  caption over the top left corner -->
  <div
    class="m_tile"
    v-seen="media.$path"
    :class="[`is--${type}`, { 'is--unseen': is_unseen }]"
    :data-path="media.$path"
    :title="summary"
  >
    <template v-if="type === 'text'">
      <p v-if="excerpt" class="m_tile--text">{{ excerpt }}</p>
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
import { thumbURL } from "@/adc/api";
import { mapState } from "pinia";
import { authorColor, dateOf, formatTime } from "@/medias";
import { vSeen } from "@/seen";
import { useUnseenStore } from "@/stores/unseen";

// one of the cahiers' thumb resolutions (settings_base.json): about 2× the
// tiles' width, for sharp thumbs on dense screens
const THUMB_RESOLUTION = 440;

export default {
  directives: { seen: vSeen },
  props: {
    media: { type: Object, required: true },
  },
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
    thumb() {
      return thumbURL(this.media, THUMB_RESOLUTION);
    },
    // a few lines of a text, without its Markdown signs
    excerpt() {
      const content = this.media.$content;
      if (typeof content !== "string") return "";
      return content
        .replace(/[#>*_`~[\]]/g, "")
        .replace(/\(https?:[^)]*\)/g, "")
        .trim()
        .slice(0, 400);
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
  transition: box-shadow 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    z-index: 1;
    box-shadow:
      0 2px 10px rgb(0 0 0 / 19%),
      0 6px 26px rgb(0 0 0 / 3%);
  }

  // not seen yet: a green outline, fading out over the 2 seconds it takes
  // to count as seen on screen (seen.js), back at once if it leaves
  &.is--unseen {
    box-shadow: 0 0 0 3px var(--c-vert_vif);
    transition: box-shadow 0.3s;

    &.is--seeing {
      box-shadow: 0 0 0 3px transparent;
      transition: box-shadow 2s linear;
    }
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

.m_tile--text {
  align-self: stretch;
  width: 100%;
  margin: 0;
  // below the caption
  padding: calc(var(--spacing-small) + 0.9rem) var(--spacing-small)
    var(--spacing-small);
  font-size: var(--font-size-small);
  line-height: 1.35;
  white-space: pre-line;
  overflow-wrap: anywhere;
  overflow: hidden;
  // fades out at the bottom of the tile
  mask-image: linear-gradient(to bottom, black 70%, transparent);
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
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--author-color);
  // visible on light and dark images
  box-shadow:
    0 0 0 1.5px white,
    0 1px 3px rgb(0 0 0 / 35%);
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
