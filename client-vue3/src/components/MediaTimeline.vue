<template>
  <!-- v2's TimelineView.vue: days side by side from left to right, each
  with its date written vertically on a rule, then its medias in columns
  from top to bottom, on staff lines. Repères split a day into parts.
  Empty days are a grey wave, one half circle a day. Kept up to date by
  the cahier's room. -->
  <div
    ref="scroller"
    class="m_tl"
    :class="{ 'is--resizing': !!resizing }"
    :style="sizes"
    @wheel="onWheel"
  >
    <p v-if="!columns.length" class="m_tl--empty">{{ $t("no_medias") }}</p>

    <template v-for="column in columns" :key="column.key">
      <div
        v-if="column.kind === 'empty'"
        class="m_tl--emptyDays"
        :title="$t('days_count', column.count + 1)"
      >
        <span
          v-for="index in Math.min(column.count, MAX_WAVES)"
          :key="index"
          class="m_tl--wave"
          aria-hidden="true"
        />
        <span v-if="column.count > MAX_WAVES" class="m_tl--emptyLabel">
          {{ laterLabel(column.count) }}
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
              <span
                class="m_tl--dayLabel--count"
                :class="{
                  'has--unseen':
                    folded_days[column.key] && dayHasUnseen(column),
                }"
              >
                {{ column.count }}
              </span>
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
            :class="{ 'has--marker': !!segment.marker }"
          >
            <!-- v2's repère: a black label, tilted, at mid-height, over the
            start of its part of the day: who added it (a dot in their
            colour), the time, its label -->
            <div v-if="segment.marker" class="m_tl--marker">
              <div
                class="m_tl--markerLabel"
                :class="{ 'is--unseen': isUnseen(segment.marker.$path) }"
                :data-path="segment.marker.$path"
                role="button"
                tabindex="0"
                @click="$emit('open', segment.marker.$path)"
                @keydown.enter.space.prevent="
                  $emit('open', segment.marker.$path)
                "
              >
                <span class="m_tl--markerTime">
                  <span
                    v-if="markerColor(segment.marker)"
                    class="m_tl--markerDot"
                    :style="{ '--author-color': markerColor(segment.marker) }"
                    aria-hidden="true"
                  />
                  <time :datetime="dateOf(segment.marker)">
                    {{ formatTime(dateOf(segment.marker)) }}
                  </time>
                </span>
                <span v-if="segment.marker.caption" class="m_tl--markerCaption">
                  {{ segment.marker.caption }}
                </span>
              </div>
            </div>

            <!-- the medias glide to their new place when the grid changes
            (Vue measures them before and after, CSS moves them) -->
            <TransitionGroup
              v-if="segment.medias.length"
              tag="ul"
              name="m_tl-tile"
              class="m_tl--medias"
              :style="gridOf(segment.medias)"
            >
              <li
                v-for="media in segment.medias"
                :key="media.$path"
                class="m_tl--item"
                :class="{
                  'is--resizing': resizing?.path === media.$path,
                  'is--failed': failed_sizes[media.$path],
                }"
                :style="spanOf(media)"
              >
                <MediaTile :media="media" @open="$emit('open', $event)" />
                <!-- v2's handles: right, bottom, corner -->
                <template v-if="can_edit">
                  <span
                    v-for="edge in ['right', 'bottom', 'corner']"
                    :key="edge"
                    class="m_tl--handle"
                    :class="`is--${edge}`"
                    aria-hidden="true"
                    @pointerdown.stop.prevent="startResize($event, media, edge)"
                  />
                </template>
              </li>
            </TransitionGroup>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import {
  authorColor,
  dateOf,
  dayKey,
  formatDay,
  formatTime,
  sortByDate,
  timeOf,
} from "@/medias";
import { mapActions, mapState } from "pinia";
import { readJSON, writeJSON } from "@/adc/storage";
import { useContentStore } from "@/stores/content";
import { useNotificationsStore } from "@/stores/notifications";
import { useUnseenStore } from "@/stores/unseen";
import MediaTile from "./MediaTile.vue";

// empty days in a row: one half circle each, up to this many, then the
// count is written next to them
const MAX_WAVES = 7;
// The medias sit on a grid of squares, one per staff line step (40px, as in
// v2): a square and the space after it, in rem. A media takes w × h
// squares (its "w" and "h", 4 × 4 by default), resized with its handles.
const UNIT = 2.25;
const GAP = 0.25;
const STEP = UNIT + GAP;
const DEFAULT_SIZE = 4;
const MIN_SIZE = 2;
const MAX_W = 16;

export default {
  components: { MediaTile },
  // open: a media's window, with its path
  emits: ["open"],
  props: {
    // the cahier, e.g. "cahiers/mon-cahier": its folded days are kept
    path_to_folder: { type: String, required: true },
    // the cahier's $files
    files: { type: Array, required: true },
    // the cahier's bounds, optional ("2026-11-17"): the timeline covers
    // them, and every media even outside them
    start: { type: String, default: "" },
    end: { type: String, default: "" },
    // a media just added: scrolled to once it shows up
    scroll_to: { type: String, default: "" },
    // contributors: medias can be resized
    can_edit: { type: Boolean, default: false },
  },
  data() {
    return {
      MAX_WAVES,
      // days shown as their label only: { "2026-11-18": true }, kept in
      // this browser for each cahier
      folded_days: this.readFoldedDays(),
      // how many squares fit in a column, from the timeline's height
      rows: 1,
      // the media being resized: { path, w, h }
      resizing: null,
      // sizes sent, until the server answers: { path: { w, h, id } }
      pending_sizes: {},
      // medias whose new size the server refused: shaken, outlined in red
      // for a moment ({ path: true })
      failed_sizes: {},
      // the height of a day's parts, in rem
      segment_height: 0,
    };
  },
  computed: {
    ...mapState(useUnseenStore, ["isUnseen"]),
    sizes() {
      return {
        "--unit": `${UNIT}rem`,
        "--gap": `${GAP}rem`,
        "--staff-step": `${STEP}rem`,
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
    scroll_to: "scrollToMedia",
    // another cahier, in the same timeline
    path_to_folder() {
      this.folded_days = this.readFoldedDays();
    },
    files() {
      this.scrollToMedia();
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
    ...mapActions(useContentStore, ["updateFile"]),
    ...mapActions(useNotificationsStore, ["notify"]),
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
    // A part's medias fill a column from top to bottom, then the next one,
    // filling the gaps (dense). The rows are counted here, not left to the
    // grid (auto-fill): its width would be reckoned before its height,
    // leaving a wide empty space. Centered in the day's height, but on the
    // staff lines: the space above is a whole number of lines
    gridOf(medias) {
      const needed = medias.reduce((sum, media) => sum + this.spanH(media), 0);
      const rows = Math.max(1, Math.min(this.rows, needed));
      const block = rows * STEP - GAP;
      const centered = Math.max(0, (this.segment_height - block) / 2);
      return {
        gridTemplateRows: `repeat(${rows}, var(--unit))`,
        paddingTop: `${Math.floor(centered / STEP) * STEP}rem`,
      };
    },
    // w × h squares: while resized, then as sent, then as saved
    sizeOf(media) {
      if (this.resizing?.path === media.$path) return this.resizing;
      const pending = this.pending_sizes[media.$path];
      if (pending) return pending;
      const valid = (n) =>
        Number.isInteger(n) && n >= MIN_SIZE ? n : DEFAULT_SIZE;
      return { w: valid(media.w), h: valid(media.h) };
    },
    // never taller than the timeline
    spanH(media) {
      return Math.min(this.sizeOf(media).h, this.rows);
    },
    spanOf(media) {
      return {
        gridColumn: `span ${this.sizeOf(media).w}`,
        gridRow: `span ${this.spanH(media)}`,
      };
    },
    // dragging a handle: the size follows by whole squares, and is saved
    // when let go
    startResize(event, media, edge) {
      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      const step = STEP * rem;
      const start = {
        x: event.clientX,
        y: event.clientY,
        ...this.sizeOf(media),
      };
      start.h = Math.min(start.h, this.rows);
      this.resizing = { path: media.$path, w: start.w, h: start.h };
      const clamp = (n, max) => Math.max(MIN_SIZE, Math.min(max, n));

      const move = (e) => {
        if (edge !== "bottom")
          this.resizing.w = clamp(
            start.w + Math.round((e.clientX - start.x) / step),
            MAX_W
          );
        if (edge !== "right")
          this.resizing.h = clamp(
            start.h + Math.round((e.clientY - start.y) / step),
            Math.max(MIN_SIZE, this.rows)
          );
      };
      const end = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", end);
        handle.removeEventListener("pointercancel", end);
        const { w, h } = this.resizing;
        this.resizing = null;
        if (w === start.w && h === start.h) return;
        this.saveSize(media.$path, w, h);
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", end);
      handle.addEventListener("pointercancel", end);
    },
    // Optimistic: the new size shows at once, until the server answers.
    // Then the tile follows the store, which holds what the server answered
    // (updateFile): the saved size, or, if refused, the size it had. Only
    // the latest resize of a media clears its pending size.
    async saveSize(path, w, h) {
      const id = (this.pending_sizes[path]?.id || 0) + 1;
      this.pending_sizes[path] = { w, h, id };
      try {
        await this.updateFile(path, { w, h });
      } catch (err) {
        this.sizeFailed(path, err);
      } finally {
        if (this.pending_sizes[path]?.id === id)
          delete this.pending_sizes[path];
      }
    },
    // a notification, and the tile shakes back to its size
    sizeFailed(path, err) {
      this.notify(
        this.$t("size_not_saved", { code: err.code || err.message }),
        { type: "error" }
      );
      this.failed_sizes[path] = true;
      setTimeout(() => delete this.failed_sizes[path], 1200);
    },
    // the height of a day's parts, the same for every day
    measureRows() {
      const segment = this.$el.querySelector?.(".m_tl--segment");
      if (!segment) return;
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      const rows = Math.floor(
        (segment.clientHeight + GAP * rem) / (STEP * rem)
      );
      this.rows = Math.max(1, rows);
      this.segment_height = segment.clientHeight / rem;
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
    // after more than MAX_WAVES empty days, as in v2: "2 semaines plus
    // tard…", "3 mois plus tard…", "2 ans plus tard…". From the last day
    // with medias to the next one: one more than the empty days
    laterLabel(empty_days) {
      const days = empty_days + 1;
      if (days / 7 < 4.5)
        return this.$t("weeks_later", Math.max(1, Math.round(days / 7)));
      if (days < 365)
        return this.$t("months_later", Math.max(1, Math.round(days / 30.44)));
      return this.$t("years_later", Math.max(1, Math.round(days / 365.25)));
    },
    // the colour of who added a repère: their account, or the name they
    // gave without one
    markerColor(marker) {
      return authorColor(marker.$authors?.[0] || marker.$credits);
    },
    // a folded day holding medias not seen yet: its count is outlined
    dayHasUnseen(column) {
      return column.segments.some(
        (segment) =>
          this.isUnseen(segment.marker?.$path) ||
          segment.medias.some((media) => this.isUnseen(media.$path))
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
      // over a text longer than its tile: only the text scrolls, never the
      // timeline, even at its top or bottom
      const text = event.target.closest?.(".m_tile--text");
      if (text && text.scrollHeight > text.clientHeight + 1) return;
      // deltaMode 1: in lines
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      this.$refs.scroller.scrollLeft += delta;
      event.preventDefault();
    },
    async scrollToMedia() {
      if (!this.scroll_to) return;
      // its day may be folded
      const day = dayKey(
        dateOf(this.files.find((f) => f.$path === this.scroll_to) || {})
      );
      if (this.folded_days[day]) this.toggleDay(day);
      await this.$nextTick();
      this.$el
        .querySelector(`[data-path="${CSS.escape(this.scroll_to)}"]`)
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
    flex: 0 0 calc(64px + 14vw + var(--spacing-small));
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
    margin-right: 2rem;

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

// on the right of the pill, discreet: "Déplier" on folded days, "Replier"
// on hover only (not shown on touch screens: found by tapping the date)
.m_tl--dayLabel--tab {
  position: absolute;
  top: 50%;
  left: 100%;
  padding: 6px 3px;
  color: var(--c-gris);
  font-size: var(--font-size-verysmall);
  white-space: nowrap;
  writing-mode: vertical-rl;
  transform: translateY(-50%) rotate(180deg);
  opacity: 0;
  transition:
    opacity 0.15s,
    color 0.15s;

  .m_tl--dayToggle:hover &,
  .m_tl--dayToggle:focus-visible &,
  .is--folded & {
    opacity: 1;
  }
  .m_tl--dayToggle:hover & {
    color: var(--c-noir);
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

  // a folded day holding medias not seen yet
  &.has--unseen {
    box-shadow:
      0 0 0 2px var(--c-bg),
      0 0 0 4px var(--c-vert_vif);
  }
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

  // room for the repère's label, even without medias after it
  &.has--marker {
    min-width: 11rem;
  }
}

// a repère, as in v2 (TimelineView.vue): a label tilted at mid-height, over
// the medias that follow it. Its own width is taken back (negative margin),
// but the part keeps room for it (.m_tl--segment.has--marker)
.m_tl--marker {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  width: 25ch;
  height: 100%;
  margin-right: -25ch;
  pointer-events: none;
}

.m_tl--markerLabel {
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  max-width: 100%;
  padding: 4px 8px;
  background-color: var(--c-noir);
  color: white;
  box-shadow: -0.1em 0.2em 1em rgb(0 0 0 / 20%);
  line-height: 1.4;
  cursor: pointer;
  pointer-events: auto;
  transform: rotate(-15deg) translateX(-20px);
  transform-origin: left center;
  transition:
    transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1),
    box-shadow 0.4s;

  &:hover {
    transform: rotate(-15deg) translateX(-20px) scale(1.05);
  }
  &:focus-visible {
    outline: 2px solid var(--c-gris);
    outline-offset: 2px;
  }

  // not seen yet: as the tiles (MediaTile.vue)
  &.is--unseen {
    box-shadow: 0 0 0 3px var(--c-vert_vif);
  }
}

.m_tl--markerTime {
  display: flex;
  align-items: center;
  gap: 0.6em;
  font-size: 1.1em;
  font-variant-numeric: tabular-nums;
}

.m_tl--markerDot {
  width: 0.55em;
  height: 0.55em;
  border-radius: 50%;
  background-color: var(--author-color);
}

.m_tl--markerCaption {
  max-width: 22ch;
  font-size: var(--font-size-small);
  font-style: italic;
  overflow-wrap: anywhere;
}

// filled from top to bottom, then left to right, on squares
.m_tl--medias {
  // rows: gridOf(); each media's span: spanOf()
  display: grid;
  grid-auto-flow: column dense;
  grid-auto-columns: var(--unit);
  align-content: start;
  gap: var(--gap);
  height: 100%;
  margin: 0;
  padding: 0 var(--gap);
  list-style: none;

  // while resizing, the squares show: vertical lines too
  .is--resizing & {
    background-image: repeating-linear-gradient(
      to right,
      var(--staff-color) 0 1px,
      transparent 1px var(--staff-step)
    );
    background-origin: content-box;
    background-clip: content-box;
  }
}

.m_tl--item {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;

  // its new size was refused: a red outline, and a short shake back
  &.is--failed > :first-child {
    box-shadow: 0 0 0 3px var(--c-rouge);
    animation: m_tl-shake 0.4s ease-in-out;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  // the tile fills its squares
  > :first-child {
    flex: 1 1 auto;
    --tile-ratio: auto;
  }
}

// slight movements: medias moving aside, new ones fading in
.m_tl-tile-move {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.m_tl-tile-enter-active {
  transition:
    opacity 0.3s,
    transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.m_tl-tile-enter-from {
  opacity: 0;
  transform: scale(0.96);
}
@media (prefers-reduced-motion: reduce) {
  .m_tl-tile-move,
  .m_tl-tile-enter-active {
    transition: none;
  }
}

@keyframes m_tl-shake {
  20%,
  60% {
    transform: translateX(-4px);
  }
  40%,
  80% {
    transform: translateX(4px);
  }
}

// v2's handles (MediaBlock.vue), on hover: small white pills inside the
// tile, along the right edge, the bottom edge and in the corner, each in a
// wider invisible area, easier to grab
.m_tl--handle {
  --pill-long: 15px;
  --pill-short: 5px;

  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  // hidden handles let the pointer through: no resizing on touch screens
  opacity: 0;
  pointer-events: none;
  touch-action: none;
  transition: opacity 0.15s;

  &::after {
    content: "";
    width: var(--pill-short);
    height: var(--pill-short);
    border-radius: var(--pill-short);
    background-color: white;
    box-shadow: 0 0 4px rgb(0 0 0 / 83%);
    transition: background-color 0.15s;
  }
  &:hover::after {
    background-color: #aaa;
  }

  .m_tl--item:hover &,
  .m_tl--item.is--resizing & {
    opacity: 1;
    pointer-events: auto;
  }

  &.is--right {
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    cursor: ew-resize;

    &::after {
      height: var(--pill-long);
    }
  }
  &.is--bottom {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    cursor: ns-resize;

    &::after {
      width: var(--pill-long);
    }
  }
  &.is--corner {
    right: 0;
    bottom: 0;
    cursor: nwse-resize;
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
