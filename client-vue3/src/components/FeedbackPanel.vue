<template>
  <!-- "Vos retours": the app is a prototype, and says so; anyone can send
  feedback (a bug, an idea…), read by the instance's admins (stores/
  feedback.js, FeedbackListModal.vue); what's new to try (ChangelogList.vue).
  Opened from the top bars (FeedbackButtons.vue), and on a first visit on
  its "about" tab (App.vue). -->
  <BaseModal
    :disabled="tab === 'feedback' && !is_sent && !form.message.trim()"
    :busy="is_sending"
    @close="$emit('close')"
    @submit="onSubmit"
  >
    <template #header>{{ $t("feedback_title") }}</template>

    <p class="m_modal--field m_feedback--intro">{{ $t("feedback_intro") }}</p>

    <div class="m_modal--field m_feedback--tabs" role="tablist">
      <button
        v-for="t in TABS"
        :id="`feedback_tab_${t}`"
        :key="t"
        type="button"
        role="tab"
        class="m_feedback--tab"
        :class="{ 'is--active': tab === t }"
        :aria-selected="tab === t"
        :aria-controls="`feedback_panel_${t}`"
        @click="tab = t"
      >
        {{ $t(`feedback_tab_${t}`) }}
        <span
          v-if="t === 'news' && has_news"
          class="m_feedback--dot"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- FEEDBACK -->
    <div
      v-if="tab === 'feedback'"
      id="feedback_panel_feedback"
      role="tabpanel"
      aria-labelledby="feedback_tab_feedback"
    >
      <template v-if="is_sent">
        <div class="m_modal--field m_feedback--sent" role="status">
          <strong>{{ $t("feedback_sent_title") }}</strong>
          <p>{{ $t("feedback_sent") }}</p>
          <button type="button" class="m_feedback--again" @click="restart">
            {{ $t("feedback_another") }}
          </button>
        </div>
      </template>

      <template v-else>
        <div class="m_modal--field">
          <span class="m_feedback--label">{{ $t("feedback_type") }}</span>
          <div class="m_feedback--types">
            <button
              v-for="type in TYPES"
              :key="type"
              type="button"
              class="m_feedback--type"
              :class="{ 'is--active': form.type === type }"
              :aria-pressed="form.type === type"
              @click="form.type = type"
            >
              {{ $t(`feedback_type_${type}`) }}
            </button>
          </div>
        </div>

        <div class="m_modal--field">
          <label for="feedback_message">{{ $t("feedback_message") }}</label>
          <textarea
            id="feedback_message"
            v-model="form.message"
            rows="6"
            maxlength="10000"
            :placeholder="$t(`feedback_placeholder_${form.type}`)"
            required
          />
        </div>

        <div class="m_modal--field">
          <label for="feedback_email">
            {{ $t("feedback_email") }}
            <span class="m_feedback--optional">{{ $t("optional") }}</span>
          </label>
          <input
            id="feedback_email"
            v-model="form.email"
            type="email"
            maxlength="320"
            autocomplete="email"
          />
          <small class="m_feedback--emailHelp">
            {{ $t("feedback_email_help") }}
          </small>
        </div>

        <div class="m_modal--field">
          <label for="feedback_name">
            {{ $t("feedback_name") }}
            <span class="m_feedback--optional">{{ $t("optional") }}</span>
          </label>
          <input
            id="feedback_name"
            v-model="form.name"
            type="text"
            maxlength="200"
            autocomplete="name"
          />
        </div>

        <div class="m_modal--field m_feedback--context">
          <small>{{ $t("feedback_context") }}</small>
          <small>{{ context_summary }}</small>
        </div>

        <p v-if="error" class="m_modal--field form-error">{{ error }}</p>
      </template>
    </div>

    <!-- WHAT'S NEW -->
    <div
      v-else-if="tab === 'news'"
      id="feedback_panel_news"
      role="tabpanel"
      aria-labelledby="feedback_tab_news"
    >
      <ChangelogList :since="news_since" :current="current" />
    </div>

    <!-- ABOUT -->
    <div
      v-else
      id="feedback_panel_about"
      role="tabpanel"
      aria-labelledby="feedback_tab_about"
      class="m_modal--field m_feedback--about"
    >
      <p>{{ $t("notice_in_preparation") }}</p>
      <i18n-t keypath="notice_contact" tag="p" scope="global">
        <template #contact_us>
          <a :href="`mailto:${CONTACT_EMAIL}`">{{ $t("contact_us") }}</a>
        </template>
        <template #email>
          <span class="m_feedback--email">{{ CONTACT_EMAIL }}</span>
        </template>
      </i18n-t>
      <p v-if="current">
        <small>{{ $t("feedback_version", { version: current }) }}</small>
      </p>
    </div>

    <template #submit_button>
      {{ $t(tab === "feedback" && !is_sent ? "feedback_send" : "close") }}
    </template>
  </BaseModal>
</template>

<script>
import { mapActions, mapState } from "pinia";
import * as api from "@/adc/api";
import { readJSON, writeJSON } from "@/adc/storage";
import { useAppVersionStore } from "@/stores/appVersion";
import { useFeedbackStore } from "@/stores/feedback";
import { useSessionStore } from "@/stores/session";
import BaseModal from "./BaseModal.vue";
import ChangelogList from "./ChangelogList.vue";

const TABS = ["feedback", "news", "about"];
const TYPES = ["bug", "idea", "improvement", "other"];
// what is being written, if the window closes: until the tab closes
const DRAFT_KEY = "cahiers.feedback_draft";
const CONTACT_EMAIL = "archivesvivantes@federation-apcp.org";

// "Firefox 133", "Safari 18", "Chrome 131"… from the user agent: for the
// summary shown; the whole user agent is sent
function browserLabel(ua) {
  const found = [
    [/Edg\/(\d+)/, "Edge"],
    [/Firefox\/(\d+)/, "Firefox"],
    [/Chrome\/(\d+)/, "Chrome"],
    [/Version\/(\d+)[\d.]* .*Safari/, "Safari"],
  ].find(([re]) => re.test(ua));
  return found ? `${found[1]} ${ua.match(found[0])[1]}` : "";
}

export default {
  components: { BaseModal, ChangelogList },
  props: {
    // "feedback", "news" or "about"
    initial_tab: { type: String, default: "feedback" },
  },
  emits: ["close"],
  data() {
    const draft = readJSON(DRAFT_KEY, "session") || {};
    return {
      TABS,
      TYPES,
      CONTACT_EMAIL,
      tab: TABS.includes(this.initial_tab) ? this.initial_tab : "feedback",
      form: {
        type: TYPES.includes(draft.type) ? draft.type : "bug",
        message: draft.message || "",
        name: draft.name || "",
        email: draft.email || "",
      },
      is_sending: false,
      is_sent: false,
      error: "",
      // the version last run here, when what's new wasn't seen: read once
      news_since: "",
    };
  },
  computed: {
    ...mapState(useAppVersionStore, ["current", "previous", "is_updated"]),
    ...mapState(useSessionStore, ["token_path", "is_logged_in"]),
    has_news() {
      return this.is_updated;
    },
    context() {
      const ua = navigator.userAgent;
      return {
        version: this.current,
        page: window.location.pathname + window.location.search,
        browser: ua,
        screen: `${window.innerWidth}×${window.innerHeight}`,
        language: navigator.language,
      };
    },
    // what is sent with it, readable
    context_summary() {
      const { version, page, browser, screen } = this.context;
      return [
        version && this.$t("feedback_version", { version }),
        page,
        browserLabel(browser),
        screen,
      ]
        .filter(Boolean)
        .join(" · ");
    },
  },
  watch: {
    form: {
      deep: true,
      handler(form) {
        writeJSON(DRAFT_KEY, form, "session");
      },
    },
    // seen: no longer new
    tab: {
      immediate: true,
      handler(tab) {
        if (tab !== "news") return;
        if (this.is_updated) this.news_since = this.previous;
        this.markSeen();
      },
    },
  },
  created() {
    this.prefill();
  },
  methods: {
    ...mapActions(useAppVersionStore, ["markSeen"]),
    ...mapActions(useFeedbackStore, ["send"]),
    // logged in: their name and email, unless already typed
    async prefill() {
      if (!this.is_logged_in) return;
      const author = await api.getFolder(this.token_path).catch(() => {});
      if (!author) return;
      if (!this.form.name && author.name) this.form.name = author.name;
      if (!this.form.email && author.email) this.form.email = author.email;
    },
    onSubmit() {
      if (this.tab === "feedback" && !this.is_sent) this.submit();
      else this.$emit("close");
    },
    async submit() {
      const message = this.form.message.trim();
      if (!message || this.is_sending) return;
      this.is_sending = true;
      this.error = "";
      try {
        await this.send({
          type: this.form.type,
          message,
          name: this.form.name.trim(),
          email: this.form.email.trim(),
          context: this.context,
        });
        this.is_sent = true;
        // the name and email stay, for a next one
        this.form.message = "";
      } catch (err) {
        const code = err.code || err.message;
        this.error =
          err.status === 429
            ? this.$t("feedback_too_many")
            : code === "invalid_feedback_email"
              ? this.$t("feedback_invalid_email")
              : this.$t("feedback_failed", { code, email: CONTACT_EMAIL });
      } finally {
        this.is_sending = false;
      }
    },
    restart() {
      this.is_sent = false;
      this.error = "";
      this.$nextTick(() =>
        document.getElementById("feedback_message")?.focus()
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.m_feedback--intro {
  line-height: 1.5;
}

// tabs, as a row of pills
.m_feedback--tabs {
  display: flex;
  flex-flow: row wrap;
  gap: var(--spacing-verysmall);
}
.m_feedback--tab,
.m_feedback--type {
  position: relative;
  padding: 0.3rem 0.75rem;
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 2em;
  color: white;
  font-size: var(--font-size-small);
  transition:
    background-color 0.15s,
    border-color 0.15s;

  &:hover,
  &:focus-visible {
    border-color: white;
  }
  &.is--active {
    border-color: var(--c-jaune);
    background-color: var(--c-jaune);
    color: var(--c-noir);
  }
}

// what's new not seen yet
.m_feedback--dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: var(--c-rouge);
}

.m_feedback--label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: var(--font-size-small);
}
.m_feedback--types {
  display: flex;
  flex-flow: row wrap;
  gap: var(--spacing-verysmall);
}

.m_feedback--optional {
  color: var(--c-gris_clair);
}

// the email's use, as it matters: in the light, not greyed out
.m_feedback--emailHelp {
  display: block;
  margin-top: 0.35rem;
  color: var(--c-jaune);
  line-height: 1.4;
}

.m_feedback--context small {
  display: block;
  color: var(--c-gris_clair);
  overflow-wrap: anywhere;
}

.m_feedback--sent {
  p {
    margin: 0.35rem 0 var(--spacing-small);
  }
}
.m_feedback--again {
  padding: var(--spacing-verysmall) var(--spacing-small);
  border: 1px solid rgb(255 255 255 / 40%);
  border-radius: 2em;
  color: white;

  &:hover,
  &:focus-visible {
    border-color: white;
  }
}

.m_feedback--about p {
  margin: 0 0 var(--spacing-small);
  line-height: 1.5;
}
.m_feedback--email {
  overflow-wrap: anywhere;
}
</style>
