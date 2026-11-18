<template>
  <!-- In the top bars: connected live, saving, saved or not, offline
  (instead of v2's red bar). Saves are counted by the content store
  (stores/content.js, _track). Announced politely to screen readers. -->
  <div class="m_live" :class="`is--${state}`" role="status" aria-live="polite">
    <span
      v-if="state === 'saving'"
      class="m_live--spinner"
      aria-hidden="true"
    />
    <span v-else-if="state === 'saved'" class="m_live--icon" aria-hidden="true">
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
    <span class="m_live--label">{{ $t(`live_${state}`) }}</span>
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

export default {
  data() {
    return {
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
  beforeUnmount() {
    clearTimeout(this.spin_timeout);
    clearTimeout(this.result_timeout);
  },
  methods: {
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
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  color: var(--c-gris_clair);
  font-size: var(--font-size-small);
  line-height: 1.4;
  white-space: nowrap;

  &.is--saved {
    color: var(--c-vert_vif);
  }
  &.is--failed {
    color: #ff7e8a;
  }
  // v2's red bar, as a pill
  &.is--offline {
    background-color: var(--c-rouge);
    color: white;
  }
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
