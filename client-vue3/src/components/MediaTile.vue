<template>
  <!-- one media, as a square preview and a legend under it: in the grid
  and on the timeline -->
  <div
    class="m_tile"
    :class="[`is--${type}`, { 'is--highlighted': highlighted }]"
    :data-path="media.$path"
  >
    <div class="m_tile--preview">
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
    </div>

    <div class="m_tile--legend">
      <time :datetime="date">{{ time }}</time>
      <span class="m_tile--type">{{ $t(`type_${type}`) }}</span>
      <span v-if="legend" class="m_tile--caption">{{ legend }}</span>
    </div>
  </div>
</template>

<script>
import { thumbURL } from "@/adc/api";
import { dateOf, formatTime } from "@/medias";

// one of the cahiers' thumb resolutions (settings_base.json): about 2× the
// tiles' width, for sharp thumbs on dense screens
const THUMB_RESOLUTION = 440;

export default {
  props: {
    media: { type: Object, required: true },
    // a media just added: outlined
    highlighted: { type: Boolean, default: false },
  },
  computed: {
    type() {
      return this.media.$type || "other";
    },
    date() {
      return dateOf(this.media);
    },
    time() {
      return formatTime(this.date);
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
    extension() {
      const name = this.media.$media_filename || "";
      return name.includes(".") ? name.split(".").pop() : "?";
    },
  },
};
</script>

<style lang="scss" scoped>
.m_tile {
  display: flex;
  flex-flow: column nowrap;
  min-width: 0;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  overflow: hidden;
  transition: box-shadow 0.4s;

  &.is--highlighted {
    box-shadow: 0 0 0 3px var(--c-vert_vif);
  }
}

.m_tile--preview {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: var(--tile-ratio, 1);
  background-color: var(--c-gris_tresclair);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // waveforms and pages: whole, on white
  .is--audio & img,
  .is--pdf & img {
    object-fit: contain;
  }
  .is--audio & {
    padding: var(--spacing-small);
  }
  .is--marker &,
  .is--text & {
    background-color: white;
  }
}

.m_tile--text {
  align-self: flex-start;
  height: 100%;
  margin: 0;
  padding: var(--spacing-small);
  font-size: var(--font-size-small);
  line-height: 1.35;
  white-space: pre-line;
  overflow-wrap: anywhere;
  overflow: hidden;
  // fades out at the bottom of the square
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

.m_tile--legend {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 var(--spacing-verysmall);
  padding: var(--spacing-verysmall) var(--spacing-small);
  font-size: var(--font-size-small);
  line-height: 1.3;

  time {
    font-variant-numeric: tabular-nums;
  }
}

.m_tile--type {
  margin-left: auto;
  color: var(--c-gris);
  font-size: var(--font-size-verysmall);
}

.m_tile--caption {
  flex: 1 0 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--c-gris_fonce);
}
</style>
