<template>
  <!-- the app's short messages (stores/notifications.js), stacked over the
  bottom left corner. Errors are announced at once to screen readers. -->
  <TransitionGroup tag="ul" name="m_notif" class="m_notifications">
    <li
      v-for="notification in list"
      :key="notification.id"
      class="m_notif"
      :class="`is--${notification.type}`"
      :role="notification.type === 'error' ? 'alert' : 'status'"
    >
      <span>{{ notification.message }}</span>
      <button
        type="button"
        :aria-label="$t('close')"
        @click="dismiss(notification.id)"
      >
        ×
      </button>
    </li>
  </TransitionGroup>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useNotificationsStore } from "@/stores/notifications";

export default {
  computed: {
    ...mapState(useNotificationsStore, ["list"]),
  },
  methods: {
    ...mapActions(useNotificationsStore, ["dismiss"]),
  },
};
</script>

<style lang="scss" scoped>
.m_notifications {
  position: fixed;
  left: max(var(--spacing-medium), env(safe-area-inset-left, 0px));
  bottom: max(var(--spacing-medium), env(safe-area-inset-bottom, 0px));
  z-index: 10000;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  gap: var(--spacing-verysmall);
  max-width: min(26rem, calc(100vw - 2 * var(--spacing-medium)));
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
}

.m_notif {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-small);
  padding: var(--spacing-verysmall) var(--spacing-verysmall)
    var(--spacing-verysmall) var(--spacing-small);
  border-radius: var(--radius-button);
  background-color: var(--c-noir);
  color: white;
  box-shadow: 0 4px 16px rgb(0 0 0 / 20%);
  font-size: var(--font-size-small);
  line-height: 1.35;
  pointer-events: auto;

  &.is--error {
    background-color: var(--c-rouge);
  }

  > span {
    padding-block: 0.15rem;
  }
  button {
    flex: 0 0 auto;
    padding: 0 0.4rem;
    color: inherit;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }
}

// rise in, fade out
.m_notif-enter-active,
.m_notif-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s cubic-bezier(0.19, 1, 0.22, 1);
}
.m_notif-enter-from,
.m_notif-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
@media (prefers-reduced-motion: reduce) {
  .m_notif-enter-from,
  .m_notif-leave-to {
    transform: none;
  }
}
</style>
