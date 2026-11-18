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
        <li v-for="media in day.medias" :key="media.$path">
          <MediaTile
            :media="media"
            :highlighted="media.$path === highlighted"
          />
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import { dateOf, dayKey, formatDay, sortByDate } from "@/medias";
import MediaTile from "./MediaTile.vue";

export default {
  components: { MediaTile },
  props: {
    // the cahier's $files
    files: { type: Array, required: true },
    // a media just added: scrolled to and outlined once it shows up
    highlighted: { type: String, default: "" },
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
    highlighted: "scrollToHighlighted",
    files: "scrollToHighlighted",
  },
  methods: {
    async scrollToHighlighted() {
      if (!this.highlighted) return;
      await this.$nextTick();
      this.$el
        .querySelector(`[data-path="${CSS.escape(this.highlighted)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  },
};
</script>

<style lang="scss" scoped>
.m_grid {
  height: 100%;
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
  grid-template-columns: repeat(auto-fill, minmax(min(11rem, 40vw), 1fr));
  gap: var(--spacing-small);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
