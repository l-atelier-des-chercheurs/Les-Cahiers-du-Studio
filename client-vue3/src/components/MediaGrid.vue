<template>
  <!-- every media of a cahier, in timeline order, grouped by day.
  Kept up to date by the cahier's room (stores/content.js). -->
  <div class="m_grid">
    <p v-if="!days.length" class="m_grid--empty">{{ $t("no_medias") }}</p>

    <section v-for="day in days" :key="day.key" class="m_grid--day">
      <h2 class="m_grid--dayTitle">
        {{ day.label }}
        <span class="font-verysmall">{{ day.medias.length }}</span>
      </h2>

      <ul class="m_grid--list">
        <li
          v-for="media in day.medias"
          :key="media.$path"
          class="m_tile"
          :class="[
            `is--${media.$type || 'other'}`,
            { 'is--highlighted': media.$path === highlighted },
          ]"
          :data-path="media.$path"
        >
          <div class="m_tile--preview">
            <template v-if="media.$type === 'text'">
              <p v-if="excerpt(media)" class="m_tile--text">
                {{ excerpt(media) }}
              </p>
              <p v-else class="m_tile--placeholder">{{ $t("empty_text") }}</p>
            </template>

            <svg
              v-else-if="media.$type === 'marker'"
              class="m_tile--marker"
              viewBox="0 0 40 40"
              aria-hidden="true"
            >
              <circle cx="20" cy="20" r="8.9" />
              <circle class="_fill" cx="20" cy="20" r="4.7" />
            </svg>

            <img
              v-else-if="thumb(media)"
              :src="thumb(media)"
              alt=""
              loading="lazy"
              decoding="async"
            />

            <span v-else class="m_tile--placeholder text-cap">
              {{ extension(media) }}
            </span>

            <svg
              v-if="media.$type === 'video'"
              class="m_tile--play"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <polygon points="8 5 19 12 8 19" />
            </svg>
          </div>

          <div class="m_tile--legend">
            <time :datetime="dateOf(media)">{{
              formatTime(dateOf(media))
            }}</time>
            <span class="m_tile--type">{{
              $t(`type_${media.$type || "other"}`)
            }}</span>
            <span v-if="legend(media)" class="m_tile--caption">
              {{ legend(media) }}
            </span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import { thumbURL } from "@/adc/api";
import { i18n } from "@/i18n";

// one of the cahiers' thumb resolutions (settings_base.json): 2× the
// tiles' width, for sharp thumbs on dense screens
const THUMB_RESOLUTION = 440;

export default {
  props: {
    // the cahier's $files
    files: { type: Array, required: true },
    // a media just added: scrolled to and outlined once it shows up
    highlighted: { type: String, default: "" },
  },
  computed: {
    // [{ key, label, medias }], oldest first, as on the timeline
    days() {
      const sorted = [...this.files].sort(
        (a, b) => new Date(this.dateOf(a)) - new Date(this.dateOf(b))
      );
      const days = [];
      for (const media of sorted) {
        const date = new Date(this.dateOf(media));
        const key = isNaN(date) ? "" : date.toDateString();
        let day = days.at(-1);
        if (!day || day.key !== key) {
          day = { key, label: this.formatDay(date), medias: [] };
          days.push(day);
        }
        day.medias.push(media);
      }
      return days;
    },
  },
  watch: {
    // the media comes with the room's fileCreated event, after its creation
    // was answered: wait for its tile
    highlighted: "scrollToHighlighted",
    files: "scrollToHighlighted",
  },
  methods: {
    dateOf(media) {
      return media.date_timeline || media.$date_created;
    },
    thumb(media) {
      return thumbURL(media, THUMB_RESOLUTION);
    },
    // a few lines of a text, without its Markdown signs
    excerpt(media) {
      if (typeof media.$content !== "string") return "";
      return media.$content
        .replace(/[#>*_`~[\]]/g, "")
        .replace(/\(https?:[^)]*\)/g, "")
        .trim()
        .slice(0, 400);
    },
    // the caption, or for links the site's name
    legend(media) {
      if (media.caption) return media.caption;
      if (media.$type === "url" && typeof media.$content === "string") {
        try {
          return new URL(media.$content.trim()).hostname.replace(/^www\./, "");
        } catch {
          return media.$content;
        }
      }
      return "";
    },
    extension(media) {
      const name = media.$media_filename || "";
      return name.includes(".") ? name.split(".").pop() : "?";
    },
    formatDay(date) {
      if (isNaN(date)) return this.$t("no_date");
      return date.toLocaleDateString(i18n.global.locale.value, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },
    formatTime(value) {
      const date = new Date(value);
      if (isNaN(date)) return "";
      return date.toLocaleTimeString(i18n.global.locale.value, {
        timeStyle: "short",
      });
    },
    async scrollToHighlighted() {
      if (!this.highlighted) return;
      await this.$nextTick();
      const tile = this.$el.querySelector(
        `[data-path="${CSS.escape(this.highlighted)}"]`
      );
      tile?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  },
};
</script>

<style lang="scss" scoped>
.m_grid {
  padding: var(--spacing-medium);
  // room for the + button, over the last tiles
  padding-bottom: calc(64px + 12vh);
}

.m_grid--empty {
  margin: 0;
  color: var(--c-gris_fonce);
}

.m_grid--day + .m_grid--day {
  margin-top: var(--spacing-medium);
}

.m_grid--dayTitle {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: baseline;
  gap: var(--spacing-small);
  margin: 0 calc(-1 * var(--spacing-medium)) var(--spacing-small);
  padding: var(--spacing-verysmall) var(--spacing-medium);
  background-color: var(--c-bg);
  font-style: italic;

  &::first-letter {
    text-transform: uppercase;
  }
  span {
    color: var(--c-gris);
    font-style: normal;
  }
}

.m_grid--list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(11rem, 40vw), 1fr));
  gap: var(--spacing-small);
  margin: 0;
  padding: 0;
  list-style: none;
}

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
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
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
  margin: 0;
  padding: var(--spacing-small);
  font-size: var(--font-size-small);
  line-height: 1.35;
  white-space: pre-line;
  overflow-wrap: anywhere;
  // fades out at the bottom of the square
  height: 100%;
  overflow: hidden;
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
