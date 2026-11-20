<template>
  <!-- For the instance's admins: the feedback sent from the "Vos retours"
  panel (stores/feedback.js), newest first. Those newer than the last time
  the list was opened here are marked new. Replied to by email. -->
  <BaseModal wide @close="$emit('close')" @submit="$emit('close')">
    <template #header>
      {{ $t("received_feedback") }}
      <template v-if="list.length"> · {{ list.length }}</template>
    </template>

    <p v-if="is_loading && !list.length" class="m_modal--field">
      {{ $t("loading") }}
    </p>
    <p v-else-if="load_error" class="m_modal--field form-error">
      {{ $t("error_with_code", { code: load_error }) }}
    </p>
    <p v-else-if="!list.length" class="m_modal--field">
      {{ $t("no_feedback") }}
    </p>

    <article
      v-for="feedback in list"
      :key="feedback.id"
      class="m_modal--field m_feedbackList--item"
    >
      <header class="m_feedbackList--head">
        <span
          class="m_feedbackList--type"
          :class="`is--${TYPES.includes(feedback.type) ? feedback.type : 'other'}`"
        >
          {{ typeLabel(feedback.type) }}
        </span>
        <span v-if="isNewHere(feedback)" class="m_feedbackList--new">
          {{ $t("feedback_new") }}
        </span>
        <time :datetime="feedback.date" class="m_feedbackList--date">
          {{ formatDate(feedback.date) }}
        </time>
      </header>

      <p class="m_feedbackList--message">{{ feedback.message }}</p>

      <p class="m_feedbackList--from">
        <span>{{ feedback.name || $t("feedback_anonymous") }}</span>
        <span v-if="feedback.token_path" class="m_feedbackList--account">
          ({{ feedback.token_path.split("/").pop() }})
        </span>
        <template v-if="feedback.email">
          ·
          <a :href="mailto(feedback)">{{ feedback.email }}</a>
        </template>
        <span v-else class="m_feedbackList--noEmail">
          · {{ $t("feedback_no_email") }}
        </span>
      </p>

      <details v-if="feedback.context" class="m_feedbackList--context">
        <summary>{{ $t("feedback_context_details") }}</summary>
        <dl>
          <template v-for="(value, key) in feedback.context" :key="key">
            <dt>{{ key }}</dt>
            <dd>{{ value }}</dd>
          </template>
        </dl>
      </details>
    </article>

    <template #submit_button>{{ $t("close") }}</template>
  </BaseModal>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { i18n } from "@/i18n";
import { useFeedbackStore } from "@/stores/feedback";
import BaseModal from "./BaseModal.vue";

const TYPES = ["bug", "idea", "improvement", "other"];

export default {
  components: { BaseModal },
  emits: ["close"],
  data() {
    return {
      TYPES,
      // as it was on opening: what was new then stays marked while open
      seen_until_on_open: useFeedbackStore().seen_until,
    };
  },
  computed: {
    ...mapState(useFeedbackStore, ["list", "is_loading", "load_error"]),
  },
  async created() {
    await this.load();
    this.markAllSeen();
  },
  methods: {
    ...mapActions(useFeedbackStore, ["load", "markAllSeen"]),
    isNewHere(feedback) {
      return String(feedback.date) > this.seen_until_on_open;
    },
    typeLabel(type) {
      return this.$t(`feedback_type_${TYPES.includes(type) ? type : "other"}`);
    },
    formatDate(date) {
      const d = new Date(date);
      if (isNaN(d)) return date;
      return d.toLocaleString(i18n.global.locale.value, {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    // a reply, quoting the feedback
    mailto(feedback) {
      const subject = this.$t("feedback_reply_subject", {
        type: this.typeLabel(feedback.type).toLowerCase(),
      });
      const quoted = feedback.message
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
      return (
        `mailto:${encodeURIComponent(feedback.email)}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(`\n\n${quoted}`)}`
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.m_feedbackList--item {
  padding: var(--spacing-small);
  border-radius: var(--radius-button);
  background-color: rgb(255 255 255 / 6%);
}

.m_feedbackList--head {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: var(--spacing-verysmall);
  margin-bottom: var(--spacing-verysmall);
  font-size: var(--font-size-small);
}

.m_feedbackList--type {
  padding: 0.1rem 0.5rem;
  border-radius: 2em;
  background-color: rgb(255 255 255 / 15%);

  &.is--bug {
    background-color: var(--c-rouge);
  }
  &.is--idea {
    background-color: var(--c-jaune);
    color: var(--c-noir);
  }
  &.is--improvement {
    background-color: var(--c-vert_vif);
    color: var(--c-noir);
  }
}

.m_feedbackList--new {
  padding: 0.1rem 0.5rem;
  border: 1px solid white;
  border-radius: 2em;
}

.m_feedbackList--date {
  margin-left: auto;
  color: var(--c-gris_clair);
  font-variant-numeric: tabular-nums;
}

.m_feedbackList--message {
  margin: 0 0 var(--spacing-verysmall);
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.m_feedbackList--from {
  margin: 0;
  font-size: var(--font-size-small);
  overflow-wrap: anywhere;

  a {
    color: var(--c-jaune);
  }
}
.m_feedbackList--account,
.m_feedbackList--noEmail {
  color: var(--c-gris_clair);
}

.m_feedbackList--context {
  margin-top: var(--spacing-verysmall);
  font-size: var(--font-size-small);
  color: var(--c-gris_clair);

  summary {
    cursor: pointer;
  }
  dl {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.15rem var(--spacing-small);
    margin: var(--spacing-verysmall) 0 0;
  }
  dt {
    color: white;
  }
  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
}
</style>
