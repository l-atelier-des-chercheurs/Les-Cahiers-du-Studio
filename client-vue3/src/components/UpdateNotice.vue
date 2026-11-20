<template>
  <!-- The app was updated since this browser last ran it (stores/
  appVersion.js): said at the bottom of the page, in the middle, until
  closed. Its ⓘ button opens what's new since then (ChangelogModal.vue):
  seen, it isn't said again. The window stays once the notice is gone. -->
  <div>
    <Transition name="m_update" appear mode="out-in">
      <!-- the server was updated while this page was open: reloading
      gets the new version (and then says what's new) -->
      <div
        v-if="needs_reload"
        key="reload"
        class="m_update is--reload"
        role="alert"
      >
        <span>{{ $t("app_update_available") }}</span>
        <button type="button" class="m_update--reload" @click="reload">
          {{ $t("reload_page") }}
        </button>
        <button
          type="button"
          class="m_update--close"
          :aria-label="$t('close')"
          @click="dismissReload"
        >
          ×
        </button>
      </div>
      <div v-else-if="is_updated" key="updated" class="m_update" role="status">
        <span>{{ $t("app_updated") }}</span>
        <button
          type="button"
          class="m_update--info"
          :aria-label="$t('see_whats_new')"
          :title="$t('see_whats_new')"
          @click="openChangelog"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="11" x2="12" y2="16.5" />
            <circle class="_dot" cx="12" cy="7.75" r="1.1" />
          </svg>
        </button>
        <!-- <button
          type="button"
          class="m_update--close"
          :aria-label="$t('close')"
          @click="markSeen"
        >
          ×
        </button> -->
      </div>
    </Transition>

    <ChangelogModal
      v-if="changelog_since !== null"
      :since="changelog_since"
      :current="current"
      @close="changelog_since = null"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useAppVersionStore } from "@/stores/appVersion";

export default {
  components: {
    // the changelog and its Markdown: only once asked for
    ChangelogModal: defineAsyncComponent(() => import("./ChangelogModal.vue")),
  },
  data() {
    return {
      // the window open: what's new since this version
      changelog_since: null,
    };
  },
  computed: {
    ...mapState(useAppVersionStore, [
      "is_updated",
      "needs_reload",
      "previous",
      "current",
    ]),
  },
  created() {
    const store = useAppVersionStore();
    store.check();
    store.watchServer();
  },
  methods: {
    ...mapActions(useAppVersionStore, ["markSeen", "dismissReload"]),
    reload() {
      window.location.reload();
    },
    openChangelog() {
      this.changelog_since = this.previous;
      this.markSeen();
    },
  },
};
</script>

<style lang="scss" scoped>
// floating in the middle, yellow: unlike the app's other notifications
// (AppNotifications.vue), it stays until read
.m_update {
  position: fixed;
  left: 50%;
  bottom: max(var(--spacing-medium), env(safe-area-inset-bottom, 0px));
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: var(--spacing-verysmall);
  max-width: calc(100vw - 2 * var(--spacing-medium));
  padding: var(--spacing-verysmall) var(--spacing-small)
    var(--spacing-verysmall) var(--spacing-medium);
  border-radius: 2em;
  background-color: var(--c-jaune);
  color: var(--c-noir);
  box-shadow:
    0 4px 16px rgb(0 0 0 / 22%),
    0 1px 3px rgb(0 0 0 / 15%);
  font-size: var(--font-size-small);
  line-height: 1.35;
  transform: translateX(-50%);

  > span {
    padding-block: 0.15rem;
  }

  button {
    flex: 0 0 auto;
    padding: 0 0.4rem;
    color: inherit;
    opacity: 0.8;

    &:hover,
    &:focus-visible {
      opacity: 1;
    }
  }
}

// a reload to do: red, larger, pulsing gently so it isn't missed; its
// button white on the red
.m_update.is--reload {
  flex-flow: column nowrap;
  padding-block: var(--spacing-small);
  background-color: var(--c-rouge);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  animation: m_update-pulse 2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}
@keyframes m_update-pulse {
  0%,
  100% {
    box-shadow:
      0 4px 16px rgb(0 0 0 / 22%),
      0 0 0 0 rgb(255 59 76 / 55%);
  }
  50% {
    box-shadow:
      0 4px 16px rgb(0 0 0 / 22%),
      0 0 0 10px rgb(255 59 76 / 0%);
  }
}

.m_update button.m_update--reload {
  padding: 0.35rem 0.9rem;
  border-radius: 2em;
  background-color: white;
  color: var(--c-rouge);
  font-weight: 700;
  opacity: 1;
  transition: transform 0.15s ease-out;

  &:hover,
  &:focus-visible {
    transform: scale(1.05);
  }
}

.m_update--info svg {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6px;
  stroke-linecap: round;

  ._dot {
    fill: currentColor;
    stroke: none;
  }
}

// rises in, fades out, staying centred
.m_update-enter-active,
.m_update-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s cubic-bezier(0.19, 1, 0.22, 1);
}
.m_update-enter-from,
.m_update-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
@media (prefers-reduced-motion: reduce) {
  .m_update-enter-from,
  .m_update-leave-to {
    transform: translateX(-50%);
  }
}
</style>
