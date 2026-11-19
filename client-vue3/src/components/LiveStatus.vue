<template>
  <!-- In the top bars: connected live, saving, saved or not, offline
  (instead of v2's red bar). Saves are counted by the content store
  (stores/content.js, _track). Announced politely to screen readers.
  On narrow screens, only the dot (or icon); a click on it unfolds what it
  means, at any width. -->
  <div
    class="m_live"
    :class="`is--${state}`"
    @keydown.esc="is_open = false"
  >
    <button
      type="button"
      class="m_live--button"
      :aria-expanded="is_open"
      :aria-controls="info_id"
      @click="is_open = !is_open"
    >
      <span
        v-if="state === 'saving'"
        class="m_live--spinner"
        aria-hidden="true"
      />
      <span
        v-else-if="state === 'saved'"
        class="m_live--icon"
        aria-hidden="true"
      >
        ✓
      </span>
      <span
        v-else-if="state === 'failed'"
        class="m_live--icon"
        aria-hidden="true"
      >
        ✕
      </span>
      <span v-else class="m_live--dot" aria-hidden="true" />
      <span class="m_live--label" role="status" aria-live="polite">
        {{ $t(`live_${state}`) }}
      </span>
    </button>
    <div v-if="is_open" :id="info_id" class="m_live--info">
      <p class="m_live--infoTitle">{{ $t(`live_${state}`) }}</p>
      <p v-for="(line, index) in info_lines" :key="index">{{ line }}</p>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useContentStore } from "@/stores/content";

// The spinner stays at least MIN_SAVING_MS, even for a quick save, so the
// indicator doesn't flicker; then "saved" or "not saved" stays its own
// time, before going back to "live"
const MIN_SAVING_MS = 800;
const SAVED_MS = 2000;
const FAILED_MS = 5000;

let instances = 0;

export default {
  props: {
    // what updating live means here (the timeline, the list of cahiers)
    explanation: { type: String, default: "" },
    // the visitor can publish in what is shown
    can_publish: { type: Boolean, default: false },
  },
  data() {
    return {
      is_open: false,
      info_id: `m_live--info-${++instances}`,
      // the spinner is shown (since spin_started)
      spinning: false,
      spin_started: 0,
      // the outcome shown after it
      shown_save: null,
    };
  },
  computed: {
    ...mapState(useContentStore, [
      "is_connected",
      "has_connected",
      "saving",
      "last_save",
    ]),
    // connecting, offline, saving, saved, failed or live
    state() {
      if (!this.is_connected)
        return this.has_connected ? "offline" : "connecting";
      if (this.spinning) return "saving";
      if (this.shown_save) return this.shown_save.ok ? "saved" : "failed";
      return "live";
    },
    // once connected (saving or saved included), what live means here
    info_lines() {
      if (this.state === "connecting" || this.state === "offline")
        return [this.$t(`live_explanation_${this.state}`)];
      const lines = [];
      if (this.state === "failed")
        lines.push(this.$t("live_explanation_failed"));
      if (this.explanation) lines.push(this.explanation);
      if (this.can_publish) lines.push(this.$t("live_can_publish"));
      return lines;
    },
  },
  watch: {
    saving(count) {
      if (count > 0 && !this.spinning) {
        this.spinning = true;
        this.spin_started = Date.now();
        this.shown_save = null;
        clearTimeout(this.spin_timeout);
        clearTimeout(this.result_timeout);
      } else if (count === 0 && this.spinning) {
        const left = MIN_SAVING_MS - (Date.now() - this.spin_started);
        clearTimeout(this.spin_timeout);
        this.spin_timeout = setTimeout(this.stopSpinning, Math.max(0, left));
      }
    },
  },
  mounted() {
    document.addEventListener("pointerdown", this.onDocumentPointerDown);
  },
  beforeUnmount() {
    document.removeEventListener("pointerdown", this.onDocumentPointerDown);
    clearTimeout(this.spin_timeout);
    clearTimeout(this.result_timeout);
  },
  methods: {
    // a click elsewhere folds the explanation
    onDocumentPointerDown(event) {
      if (this.is_open && !this.$el.contains(event.target))
        this.is_open = false;
    },
    // then the outcome of the last save, if it ended meanwhile
    stopSpinning() {
      if (this.saving > 0) return;
      this.spinning = false;
      const save = this.last_save;
      if (!save || save.at < this.spin_started) return;
      this.shown_save = save;
      this.result_timeout = setTimeout(
        () => (this.shown_save = null),
        save.ok ? SAVED_MS : FAILED_MS
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.m_live {
  position: relative;
}

.m_live--button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  color: var(--c-gris_clair);
  font-size: var(--font-size-small);
  line-height: 1.4;
  white-space: nowrap;

  // a bigger target around the dot alone
  @media screen and (max-width: 40rem) {
    min-width: 30px;
    min-height: 30px;
    justify-content: center;
  }

  .is--saved & {
    color: var(--c-vert_vif);
  }
  .is--failed & {
    color: #ff7e8a;
  }
  // v2's red bar, as a pill
  .is--offline & {
    background-color: var(--c-rouge);
    color: white;
  }
}

// on narrow screens, the label is only read out
.m_live--label {
  @media screen and (max-width: 40rem) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

// under the pill, its right edge aligned with it
.m_live--info {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: 100;
  width: max-content;
  max-width: min(18rem, calc(100vw - 2rem));
  padding: var(--spacing-small);
  border-radius: var(--radius-button, 4px);
  background-color: white;
  color: var(--c-noir);
  font-size: var(--font-size-small);
  line-height: 1.4;
  text-align: left;
  white-space: normal;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);

  p {
    margin: 0;
  }
  p + p {
    margin-top: 0.4rem;
  }
}

.m_live--infoTitle {
  font-weight: 600;
}

.m_live--dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: var(--c-gris);

  .is--live & {
    background-color: var(--c-vert_vif);
    animation: m_live-pulse 2.4s ease-in-out infinite;
  }
  .is--offline & {
    background-color: white;
  }
}

.m_live--icon {
  width: 0.75rem;
  text-align: center;
}

.m_live--spinner {
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: m_live-spin 0.7s linear infinite;
}

@keyframes m_live-pulse {
  50% {
    opacity: 0.35;
  }
}
@keyframes m_live-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .m_live--dot {
    animation: none !important;
  }
  .m_live--spinner {
    animation-duration: 2s;
  }
}
</style>
