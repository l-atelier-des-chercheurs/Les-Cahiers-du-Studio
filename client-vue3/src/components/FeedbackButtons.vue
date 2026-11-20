<template>
  <!-- In the top bars: "Vos retours" opens the prototype's panel
  (FeedbackPanel.vue, in App.vue), with a dot while what's new isn't seen.
  For the instance's admins, the feedback received too, with how many are
  new (FeedbackListModal.vue). -->
  <div class="m_feedbackButtons">
    <button
      type="button"
      class="m_feedbackButtons--open"
      :title="$t(is_updated ? 'feedback_button_news' : 'feedback_button_title')"
      @click="$emit('feedback')"
    >
      {{ $t("feedback_button") }}
      <span
        v-if="is_updated"
        class="m_feedbackButtons--dot"
        aria-hidden="true"
      />
    </button>

    <button
      v-if="is_admin"
      type="button"
      class="m_feedbackButtons--received"
      :title="$t('received_feedback')"
      @click="show_list = true"
    >
      {{ $t("received_feedback") }}
      <span v-if="new_count" class="m_feedbackButtons--count">
        {{ new_count }}
      </span>
    </button>

    <FeedbackListModal v-if="show_list" @close="show_list = false" />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { isInstanceAdmin } from "@/adc/rights";
import { useAppVersionStore } from "@/stores/appVersion";
import { useFeedbackStore } from "@/stores/feedback";
import { useSessionStore } from "@/stores/session";

export default {
  components: {
    FeedbackListModal: defineAsyncComponent(
      () => import("./FeedbackListModal.vue")
    ),
  },
  emits: ["feedback"],
  data() {
    return {
      show_list: false,
    };
  },
  computed: {
    ...mapState(useAppVersionStore, ["is_updated"]),
    ...mapState(useFeedbackStore, ["new_count"]),
    ...mapState(useSessionStore, ["token_path"]),
    is_admin() {
      return isInstanceAdmin(this.token_path);
    },
  },
  watch: {
    // logged in as an admin: how many are new
    is_admin: {
      immediate: true,
      handler(is_admin) {
        if (is_admin) this.load();
      },
    },
  },
  methods: {
    ...mapActions(useFeedbackStore, ["load"]),
  },
};
</script>

<style lang="scss" scoped>
.m_feedbackButtons {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: var(--spacing-verysmall);
}

.m_feedbackButtons--open,
.m_feedbackButtons--received {
  position: relative;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: var(--font-size-small);
  line-height: 1.4;
  white-space: nowrap;
  transition: filter 0.15s;

  &:hover,
  &:focus-visible {
    filter: brightness(0.95);
  }
}

.m_feedbackButtons--open {
  background-color: var(--c-jaune);
  color: var(--c-noir);
}

// admins: discreet, unless there is something new
.m_feedbackButtons--received {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid currentColor;
  color: inherit;
}

// what's new not seen yet
.m_feedbackButtons--dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: var(--c-rouge);
  box-shadow: 0 0 0 2px white;
}

.m_feedbackButtons--count {
  min-width: 1.3em;
  padding: 0 0.3em;
  border-radius: 2em;
  background-color: var(--c-rouge);
  color: white;
  font-size: var(--font-size-verysmall);
  line-height: 1.5;
  text-align: center;
}
</style>
