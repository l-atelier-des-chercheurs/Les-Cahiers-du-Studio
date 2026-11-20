<template>
  <!-- What's new in the app (CHANGELOG.md, changelog.js), newest first:
  since the version this browser last ran, then, if asked, all of it. In a
  window's fields (ChangelogModal.vue, FeedbackPanel.vue). -->
  <div>
    <p v-if="since && !show_all && recent.length" class="m_modal--field">
      <small>{{ $t("whats_new_since", { version: since }) }}</small>
    </p>

    <section
      v-for="entry in shown"
      :key="entry.version"
      class="m_modal--field m_changelog--entry"
    >
      <h4 class="m_changelog--version">
        {{ entry.version }}
        <span v-if="entry.date" class="m_changelog--date">
          · {{ formatDate(entry.date) }}
        </span>
      </h4>
      <!-- sanitised (markdown.js), written by us -->
      <div class="m_changelog--body" v-html="renderMarkdown(entry.body)" />
    </section>

    <p v-if="!shown.length" class="m_modal--field">
      {{ $t("no_changelog") }}
    </p>

    <div
      v-if="!show_all && recent.length && recent.length < entries.length"
      class="m_modal--field"
    >
      <button type="button" class="m_changelog--all" @click="show_all = true">
        {{ $t("full_changelog") }}
      </button>
    </div>
  </div>
</template>

<script>
import { entries, entriesSince } from "@/changelog";
import { i18n } from "@/i18n";
import { renderMarkdown } from "@/markdown";

export default {
  props: {
    // the version last run in this browser: what came after it
    since: { type: String, default: "" },
    // the version running: nothing past it (an entry written ahead)
    current: { type: String, default: "" },
  },
  data() {
    return {
      entries,
      show_all: false,
    };
  },
  computed: {
    recent() {
      return this.since ? entriesSince(this.since, this.current) : [];
    },
    // nothing described since then (or no since): the whole changelog
    shown() {
      return this.show_all || !this.recent.length ? entries : this.recent;
    },
  },
  methods: {
    renderMarkdown,
    // "2026-11-20": the day, in local time
    formatDate(date) {
      const [y, m, d] = date.split("-").map(Number);
      const day = new Date(y, (m || 1) - 1, d || 1);
      if (isNaN(day)) return date;
      return day.toLocaleDateString(i18n.global.locale.value, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.m_changelog--entry + .m_changelog--entry {
  padding-top: var(--spacing-small);
  border-top: 1px solid rgb(255 255 255 / 15%);
}

.m_changelog--version {
  margin: 0 0 var(--spacing-verysmall);
  font-size: inherit;
  font-weight: normal;
  font-variant-numeric: tabular-nums;
}

.m_changelog--date {
  color: var(--c-gris_clair);
}

.m_changelog--body {
  font-size: var(--font-size-small);
  line-height: 1.5;

  :deep(ul) {
    margin: 0;
    padding-left: 1.2em;
  }
  :deep(li + li) {
    margin-top: 0.3em;
  }
  :deep(p) {
    margin: 0 0 0.5em;
  }
  :deep(code) {
    font-size: 0.95em;
  }
}

.m_changelog--all {
  padding: var(--spacing-verysmall) var(--spacing-small);
  border: 1px solid rgb(255 255 255 / 40%);
  border-radius: 2em;
  color: white;

  &:hover,
  &:focus-visible {
    border-color: white;
  }
}
</style>
