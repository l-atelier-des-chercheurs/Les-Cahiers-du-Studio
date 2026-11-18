<template>
  <!-- v2's TimelineView.vue: days side by side from left to right, each
  with its date written vertically on a rule, then its medias in columns
  from top to bottom, on staff lines. Repères split a day into parts.
  Empty days are a grey wave, one half circle a day. Kept up to date by
  the cahier's room. -->
  <div ref="scroller" class="m_tl" :style="sizes" @wheel="onWheel">
    <p v-if="!columns.length" class="m_tl--empty">{{ $t("no_medias") }}</p>

    <template v-for="column in columns" :key="column.key">
      <div
        v-if="column.kind === 'empty'"
        class="m_tl--emptyDays"
        :title="column.title"
      >
        <span
          v-for="index in Math.min(column.count, MAX_WAVES)"
          :key="index"
          class="m_tl--wave"
          aria-hidden="true"
        />
        <span v-if="column.count > MAX_WAVES" class="m_tl--emptyLabel">
          {{ $t("empty_days", { count: column.count }) }}
        </span>
        <span v-else class="visually-hidden">{{ column.title }}</span>
      </div>

      <section v-else class="m_tl--day" :aria-label="column.label">
        <h2 class="m_tl--dayLabel">
          <button
            type="button"
            class="m_tl--dayToggle"
            :class="{ 'is--folded': folded_days[column.key] }"
            :aria-expanded="!folded_days[column.key]"
            @click="toggleDay(column.key)"
          >
            <span class="m_tl--dayLabel--text">
              {{ column.label }}
              <span class="m_tl--dayLabel--count">{{ column.count }}</span>
            </span>
            <span class="m_tl--dayLabel--tab">
              {{ $t(folded_days[column.key] ? "unfold" : "fold") }}
            </span>
          </button>
        </h2>

        <div v-if="!folded_days[column.key]" class="m_tl--segments">
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

            <ul
              v-if="segment.medias.length"
              class="m_tl--medias"
              :style="gridOf(segment.medias.length)"
            >
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
import { readJSON, writeJSON } from "@/adc/storage";
import MediaTile from "./MediaTile.vue";

// empty days in a row: one half circle each, up to this many, then the
// count is written next to them
const MAX_WAVES = 7;
// tiles and the space between them, in rem. The staff lines behind the
// medias fall on the tiles' edges: 5 lines per tile
const TILE_W = 10;
const TILE_H = 12.25;
const GAP = 0.25;
const LINES_PER_TILE = 5;

export default {
  components: { MediaTile },
  props: {
    // the cahier, e.g. "cahiers/mon-cahier": its folded days are kept
    path_to_folder: { type: String, required: true },
    // the cahier's $files
    files: { type: Array, required: true },
    // the cahier's bounds, optional ("2026-11-17"): the timeline covers
    // them, and every media even outside them
    start: { type: String, default: "" },
    end: { type: String, default: "" },
    // a media just added: scrolled to and outlined once it shows up
    highlighted: { type: String, default: "" },
  },
  data() {
    return {
      MAX_WAVES,
      // days shown as their label only: { "2026-11-18": true }, kept in
      // this browser for each cahier
      folded_days: this.readFoldedDays(),
      // how many tiles fit in a column, from the timeline's height
      rows: 1,
    };
  },
  computed: {
    sizes() {
      return {
        "--tile-w": `${TILE_W}rem`,
        "--tile-h": `${TILE_H}rem`,
        "--gap": `${GAP}rem`,
        "--staff-step": `${(TILE_H + GAP) / LINES_PER_TILE}rem`,
      };
    },
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
    // every day from the first to the last: days with medias, and runs of
    // empty days
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
        if (!empty_run.length) return;
        const first = empty_run[0];
        const last = empty_run.at(-1);
        columns.push({
          kind: "empty",
          key: `empty-${first.key}`,
          count: empty_run.length,
          title:
            first === last
              ? `${first.label} : ${this.$t("no_media")}`
              : `${first.label} → ${last.label} : ${this.$t("empty_days", {
                  count: empty_run.length,
                })}`,
        });
        empty_run = [];
      };

      const day = new Date(Math.min(...times));
      day.setHours(0, 0, 0, 0);
      const last = new Date(Math.max(...times));
      while (day <= last) {
        const key = dayKey(day);
        const medias = this.medias_by_day[key] || [];
        const label = formatDay(day);
        if (medias.length) {
          flushEmptyRun();
          columns.push({
            kind: "day",
            key,
            label,
            count: medias.length,
            segments: this.segmentsOf(medias),
          });
        } else empty_run.push({ key, label });
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
    // another cahier, in the same timeline
    path_to_folder() {
      this.folded_days = this.readFoldedDays();
    },
    files() {
      this.scrollToHighlighted();
      // the first day may only just have appeared
      this.$nextTick(this.measureRows);
    },
  },
  async mounted() {
    this.resize_observer = new ResizeObserver(() => this.measureRows());
    this.resize_observer.observe(this.$refs.scroller);
    this.measureRows();
    // the latest medias first, as in v2
    await this.$nextTick();
    const scroller = this.$refs.scroller;
    scroller.scrollLeft = scroller.scrollWidth;
  },
  beforeUnmount() {
    this.resize_observer.disconnect();
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
    // a part's tiles fill a column from top to bottom, then the next one.
    // Rows and columns are counted here, not left to the grid (auto-fill
    // rows, auto-flow column): its width would be reckoned before its
    // height, as if every tile sat on one row, leaving a wide empty space
    gridOf(count) {
      const rows = Math.min(this.rows, count);
      return {
        gridTemplateRows: `repeat(${rows}, var(--tile-h))`,
        gridTemplateColumns: `repeat(${Math.ceil(count / rows)}, var(--tile-w))`,
      };
    },
    // the height of a day's parts, the same for every day
    measureRows() {
      const segment = this.$el.querySelector?.(".m_tl--segment");
      if (!segment) return;
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      const rows = Math.floor(
        (segment.clientHeight + GAP * rem) / ((TILE_H + GAP) * rem)
      );
      this.rows = Math.max(1, rows);
    },
    storageKey() {
      return `cahiers.folded_days.${this.path_to_folder}`;
    },
    // stored as a list: ["2026-11-18"]
    readFoldedDays() {
      const days = readJSON(this.storageKey());
      return Object.fromEntries(
        (Array.isArray(days) ? days : []).map((day) => [day, true])
      );
    },
    toggleDay(key) {
      if (this.folded_days[key]) delete this.folded_days[key];
      else this.folded_days[key] = true;
      const days = Object.keys(this.folded_days);
      writeJSON(this.storageKey(), days.length ? days : undefined);
      // the unfolded day may be the first with medias
      this.$nextTick(this.measureRows);
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
// v2's colours: grey rules on the page's light grey
.m_tl {
  --rule-color: rgb(210 210 210);
  --staff-color: rgb(232 232 232);

  display: flex;
  height: 100%;
  padding: var(--spacing-small) 0 var(--spacing-small) 5vw;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  user-select: none;

  // room for the + button, after the last day
  &::after {
    content: "";
    flex: 0 0 calc(64px + 4vw + var(--spacing-small));
  }
}

.m_tl--empty {
  margin: var(--spacing-medium);
  color: var(--c-gris_fonce);
}

.m_tl--day {
  flex: 0 0 auto;
  display: flex;
  height: 100%;
  margin: 0 20px 0 10px;
}

// the date, written from bottom to top on a grey rule the height of the
// day, with the number of medias in a black dot. A click folds the day to
// this label (a pill on a black rule), or unfolds it.
.m_tl--dayLabel {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  margin-right: 30px;
  font-size: inherit;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    border-left: 1px solid var(--rule-color);
  }

  // folded: a black rule, and room for the « Déplier » tab
  &:has(.is--folded) {
    margin-right: 2.75rem;

    &::before {
      border-left-color: var(--c-noir);
    }
  }
}

.m_tl--dayToggle {
  position: relative;
  display: block;
  padding: 0;
  border-radius: 999px;

  &:focus-visible {
    outline-offset: 2px;
  }
}

.m_tl--dayLabel--text {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75em;
  padding: 12px 6px;
  // light while unfolded, as a pill once folded
  border: 1px solid transparent;
  border-radius: 999px;
  background-color: var(--c-bg);
  white-space: nowrap;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  transition:
    border-color 0.2s,
    background-color 0.2s;

  .is--folded & {
    border-color: var(--c-noir);
  }
  .is--folded:hover & {
    background-color: white;
  }
}

// on the right of the pill: always on folded days, on hover on the others
.m_tl--dayLabel--tab {
  position: absolute;
  top: 50%;
  left: 100%;
  padding: 10px 5px;
  // the right corners, once turned upside down
  border-radius: 8px 0 0 8px;
  background-color: var(--c-noir);
  color: white;
  font-size: var(--font-size-small);
  white-space: nowrap;
  writing-mode: vertical-rl;
  transform: translateY(-50%) rotate(180deg);
  opacity: 0;
  transition: opacity 0.15s;

  .m_tl--dayToggle:hover &,
  .m_tl--dayToggle:focus-visible &,
  .is--folded & {
    opacity: 1;
  }

  @media (hover: none) {
    opacity: 1;
  }
}

.m_tl--dayLabel--count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  background-color: var(--c-noir);
  color: white;
  font-size: 0.7em;
  font-weight: bold;
  // upright, in the label turned upside down
  writing-mode: horizontal-tb;
  transform: rotate(180deg);
}

// the medias of a day, on staff lines
.m_tl--segments {
  flex: 0 0 auto;
  display: flex;
  height: 100%;
  background-image: repeating-linear-gradient(
    to bottom,
    var(--staff-color) 0 1px,
    transparent 1px var(--staff-step)
  );
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
  // rows and columns: gridOf()
  display: grid;
  grid-auto-flow: column;
  align-content: start;
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

// empty days: a grey wave, one half circle a day, up then down
.m_tl--emptyDays {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 4px;
}

.m_tl--wave {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  border: 1px solid transparent;
  border-top-color: var(--rule-color);
  border-left-color: var(--rule-color);
  border-radius: 50%;
  transform: rotate(45deg);

  &:nth-child(2n) {
    transform: rotate(225deg);
  }
}

.m_tl--emptyLabel {
  padding: 0 var(--spacing-small);
  color: var(--c-gris);
  font-size: var(--font-size-small);
  font-style: italic;
  white-space: nowrap;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
