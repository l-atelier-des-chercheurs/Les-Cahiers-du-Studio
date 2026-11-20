<template>
  <!-- every media of a cahier, in timeline order, grouped by day.
  Kept up to date by the cahier's room (stores/content.js). -->
  <div class="m_grid" :style="{ '--tile-size': `${tile_size}rem` }">
    <!-- the size of the tiles: a small square, the slider, a large one.
    Kept per browser -->
    <div v-if="days.length" class="m_grid--zoom">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="7" y="7" width="6" height="6" />
      </svg>
      <input
        v-model.number="tile_size"
        type="range"
        :min="min_size"
        :max="max_size"
        step="0.5"
        :aria-label="$t('tiles_size')"
        :title="$t('tiles_size')"
      />
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="3" y="3" width="14" height="14" />
      </svg>
    </div>

    <div class="m_grid--scroll">
      <p v-if="!days.length" class="m_grid--empty">{{ $t("no_medias") }}</p>

      <section v-for="day in days" :key="day.key" class="m_grid--day">
        <h2 class="m_grid--dayTitle">
          {{ day.label }}
          <span class="font-verysmall">{{ day.medias.length }}</span>
        </h2>

        <ul class="m_grid--list">
          <li v-for="media in day.medias" :key="media.$path">
            <MediaTile :media="media" @open="$emit('open', $event)" />
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script>
import { closeTile } from "@/flash";
import { dateOf, dayKey, formatDay, sortByDate } from "@/medias";
import MediaTile from "./MediaTile.vue";

// the smallest width of a tile, in rem: 11 by default
const MIN_SIZE = 6;
const MAX_SIZE = 26;
const DEFAULT_SIZE = 11;
const STORAGE_KEY = "cahiers.grid_tile_size";

function storedSize() {
  try {
    const size = Number(localStorage.getItem(STORAGE_KEY));
    if (size >= MIN_SIZE && size <= MAX_SIZE) return size;
  } catch {
    // no storage (private window, blocked site data)
  }
  return DEFAULT_SIZE;
}

export default {
  components: { MediaTile },
  // open: a media's window, with its path
  emits: ["open"],
  props: {
    // the cahier's $files
    files: { type: Array, required: true },
    // a media just added: scrolled to once it shows up
    scroll_to: { type: String, default: "" },
    // the media scrolled to comes back to its size (its window just closed)
    flash: { type: Boolean, default: false },
  },
  data() {
    return {
      tile_size: storedSize(),
      min_size: MIN_SIZE,
      max_size: MAX_SIZE,
    };
  },
  computed: {
    // [{ key, label, medias }], oldest first, as on the timeline
    days() {
      const days = [];
      for (const media of sortByDate(this.files)) {
        const key = dayKey(dateOf(media));
        let day = days.at(-1);
        if (!day || day.key !== key) {
          day = { key, label: formatDay(dateOf(media)), medias: [] };
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
    scroll_to: "scrollToMedia",
    files: "scrollToMedia",
    tile_size(size) {
      try {
        localStorage.setItem(STORAGE_KEY, String(size));
      } catch {
        // kept for this visit only
      }
    },
  },
  methods: {
    async scrollToMedia() {
      if (!this.scroll_to) return;
      await this.$nextTick();
      const el = this.$el.querySelector(
        `[data-path="${CSS.escape(this.scroll_to)}"]`
      );
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (this.flash) closeTile(el, { browsed: true });
    },
  },
};
</script>

<style lang="scss" scoped>
.m_grid {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
}

// above the days, outside what scrolls, centered on the page: the days'
// titles stick under it
.m_grid--zoom {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-verysmall);
  padding: var(--spacing-verysmall) var(--spacing-medium);

  svg {
    flex: 0 0 auto;
    width: 1rem;
    height: 1rem;
    fill: none;
    stroke: var(--c-gris_fonce);
    stroke-width: 1.5;
  }
  input {
    width: min(10rem, 40vw);
    margin: 0;
  }
}

.m_grid--scroll {
  flex: 1 1 auto;
  min-height: 0;
  padding: 0 var(--spacing-medium);
  // room for the + button, over the last tiles
  padding-bottom: calc(64px + 12vh);
  overflow-y: auto;
}

.m_grid--empty {
  margin: var(--spacing-medium) 0;
  color: var(--c-gris_fonce);
}

.m_grid--day {
  margin-top: var(--spacing-small);
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
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(var(--tile-size), 100%), 1fr)
  );
  gap: var(--spacing-small);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
