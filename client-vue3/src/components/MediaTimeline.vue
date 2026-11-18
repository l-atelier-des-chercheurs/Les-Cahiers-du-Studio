<template>
  <!-- v2's TimelineView.vue: days side by side from left to right, each
  day's medias in columns, from top to bottom. Repères split a day into
  parts, with their time and caption as a vertical label. Runs of empty
  days shrink to one gap. Kept up to date by the cahier's room. -->
  <div ref="scroller" class="m_tl" @wheel="onWheel">
    <p v-if="!columns.length" class="m_tl--empty">{{ $t("no_medias") }}</p>

    <template v-for="column in columns" :key="column.key">
      <div v-if="column.kind === 'gap'" class="m_tl--gap">
        <span>{{ $t("empty_days", { count: column.count }) }}</span>
      </div>

      <section
        v-else
        class="m_tl--day"
        :class="{ 'is--empty': !column.count }"
        :aria-label="column.label"
      >
        <h2 class="m_tl--dayLabel">
          <span>{{ column.label }}</span>
          <span v-if="column.count" class="font-verysmall">
            {{ column.count }}
          </span>
        </h2>

        <div class="m_tl--segments">
          <div
            v-for="(segment, index) in column.segments"
            :key="segment.marker?.$path || index"
            class="m_tl--segment"
          >
            <div
              v-if="segment.marker"
              class="m_tl--marker"
              :class="{
                'is--highlighted': segment.marker.$path === highlighted,
              }"
              :style="
                segment.marker.color && {
                  '--marker-color': segment.marker.color,
                }
              "
              :data-path="segment.marker.$path"
            >
              <time :datetime="dateOf(segment.marker)">
                {{ formatTime(dateOf(segment.marker)) }}
              </time>
              <span v-if="segment.marker.caption">
                {{ segment.marker.caption }}
              </span>
            </div>

            <ul v-if="segment.medias.length" class="m_tl--medias">
              <li v-for="media in segment.medias" :key="media.$path">
                <MediaTile
                  :media="media"
                  :highlighted="media.$path === highlighted"
                />
              </li>
            </ul>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import {
  dateOf,
  dayKey,
  formatDay,
  formatTime,
  sortByDate,
  timeOf,
} from "@/medias";
import MediaTile from "./MediaTile.vue";

// from this many empty days in a row, they become one gap
const MIN_EMPTY_DAYS_FOR_GAP = 3;

export default {
  components: { MediaTile },
  props: {
    // the cahier's $files
    files: { type: Array, required: true },
    // the cahier's bounds, optional ("2026-11-17"): the timeline covers
    // them, and every media even outside them
    start: { type: String, default: "" },
    end: { type: String, default: "" },
    // a media just added: scrolled to and outlined once it shows up
    highlighted: { type: String, default: "" },
  },
  computed: {
    // medias by day: { "2026-11-18": [media…] }
    medias_by_day() {
      const by_day = {};
      for (const media of sortByDate(this.files)) {
        const key = dayKey(dateOf(media));
        if (!key) continue;
        (by_day[key] ||= []).push(media);
      }
      return by_day;
    },
    // every day from the first to the last, as days and gaps
    columns() {
      const dated = this.files.map(timeOf).filter((t) => !isNaN(t));
      const bounds = [this.start, this.end]
        .map((date) => +this.localDay(date))
        .filter((t) => !isNaN(t));
      const times = [...dated, ...bounds];
      if (!dated.length) return [];

      const columns = [];
      let empty_run = [];
      const flushEmptyRun = () => {
        if (empty_run.length >= MIN_EMPTY_DAYS_FOR_GAP)
          columns.push({
            kind: "gap",
            key: `gap-${empty_run[0].key}`,
            count: empty_run.length,
          });
        else columns.push(...empty_run);
        empty_run = [];
      };

      const day = new Date(Math.min(...times));
      day.setHours(0, 0, 0, 0);
      const last = new Date(Math.max(...times));
      while (day <= last) {
        const key = dayKey(day);
        const medias = this.medias_by_day[key] || [];
        const column = {
          kind: "day",
          key,
          label: formatDay(day),
          count: medias.length,
          segments: this.segmentsOf(medias),
        };
        if (medias.length) {
          flushEmptyRun();
          columns.push(column);
        } else empty_run.push(column);
        day.setDate(day.getDate() + 1);
      }
      flushEmptyRun();
      return columns;
    },
  },
  watch: {
    // the media comes with the room's fileCreated event, after its creation
    // was answered: wait for its tile
    highlighted: "scrollToHighlighted",
    files: "scrollToHighlighted",
  },
  async mounted() {
    // the latest medias first, as in v2
    await this.$nextTick();
    const scroller = this.$refs.scroller;
    scroller.scrollLeft = scroller.scrollWidth;
  },
  methods: {
    dateOf,
    formatTime,
    // a date field ("2026-11-17") at local midnight
    localDay(date) {
      if (!date) return NaN;
      const [y, m, d] = date.slice(0, 10).split("-").map(Number);
      return new Date(y, m - 1, d);
    },
    // a day's medias, split at each repère: [{ marker?, medias }]
    segmentsOf(medias) {
      const segments = [{ medias: [] }];
      for (const media of medias) {
        if (media.$type === "marker")
          segments.push({ marker: media, medias: [] });
        else segments.at(-1).medias.push(media);
      }
      if (!segments[0].medias.length) segments.shift();
      return segments;
    },
    // the mouse wheel scrolls along the timeline
    onWheel(event) {
      if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY))
        return;
      // deltaMode 1: in lines
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      this.$refs.scroller.scrollLeft += delta;
      event.preventDefault();
    },
    async scrollToHighlighted() {
      if (!this.highlighted) return;
      await this.$nextTick();
      this.$el
        .querySelector(`[data-path="${CSS.escape(this.highlighted)}"]`)
        ?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.m_tl {
  --tile-w: 10rem;
  --tile-h: 13rem;
  --gap: var(--spacing-verysmall);

  display: flex;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;

  // room for the + button, after the last day
  &::after {
    content: "";
    flex: 0 0 calc(64px + 8vw);
  }
}

.m_tl--empty {
  margin: var(--spacing-medium);
  color: var(--c-gris_fonce);
}

.m_tl--day {
  flex: 0 0 auto;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  min-width: 14rem;
  border-left: 1px solid var(--c-gris_clair);

  // a day without media: a thin column, its date written vertically
  &.is--empty {
    min-width: 0;
    width: 2rem;

    .m_tl--dayLabel {
      flex: 1 1 auto;
      writing-mode: vertical-rl;
      padding: var(--spacing-small) 0;
      color: var(--c-gris);
    }
    .m_tl--segments {
      display: none;
    }
  }
}

// stays visible while the day scrolls by
.m_tl--dayLabel {
  position: sticky;
  left: 0;
  align-self: flex-start;
  display: flex;
  align-items: baseline;
  gap: var(--spacing-small);
  padding: var(--spacing-small);
  font-style: italic;
  white-space: nowrap;

  > :first-child::first-letter {
    text-transform: uppercase;
  }
  .font-verysmall {
    color: var(--c-gris);
    font-style: normal;
  }
}

.m_tl--segments {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  padding: 0 var(--gap) var(--spacing-small);
}

.m_tl--segment {
  flex: 0 0 auto;
  display: flex;
  height: 100%;
}

// a repère: a vertical label, from bottom to top
.m_tl--marker {
  --marker-color: var(--c-noir);

  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  margin: 0 var(--gap);
  padding: var(--spacing-small) 0.35rem;
  border-radius: 4px;
  background-color: var(--marker-color);
  color: white;
  font-size: var(--font-size-small);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  overflow: hidden;
  transition: box-shadow 0.4s;

  time {
    font-variant-numeric: tabular-nums;
  }
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.is--highlighted {
    box-shadow: 0 0 0 3px var(--c-vert_vif);
  }
}

// filled from top to bottom, then left to right
.m_tl--medias {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(auto-fill, var(--tile-h));
  grid-auto-columns: var(--tile-w);
  gap: var(--gap);
  height: 100%;
  margin: 0;
  padding: 0 var(--gap);
  list-style: none;

  > li {
    display: flex;
    min-height: 0;

    > * {
      flex: 1 1 auto;
      // the preview takes the height left by the legend
      --tile-ratio: auto;
    }
  }
}

// several empty days, as one column
.m_tl--gap {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  border-left: 1px dashed var(--c-gris_clair);
  color: var(--c-gris);
  font-size: var(--font-size-small);
  font-style: italic;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
</style>
