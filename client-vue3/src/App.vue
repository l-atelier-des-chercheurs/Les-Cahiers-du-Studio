<template>
  <div class="app">
    <header class="topbar">
      <h1 class="topbar__name">
        {{ app_infos.instance_meta?.name || app_infos.product_name }}
      </h1>
      <span
        class="topbar__status"
        :class="{ 'is--online': is_connected }"
        :title="is_connected ? $t('online') : $t('offline')"
      />
      <div class="topbar__session">
        <template v-if="is_logged_in">
          <span class="topbar__author">
            {{ $t("logged_in_as", { name: author_slug }) }}
          </span>
          <button type="button" class="button" @click="logout">
            {{ $t("logout") }}
          </button>
        </template>
        <button
          v-else
          type="button"
          class="button"
          @click="show_login_modal = true"
        >
          {{ $t("login") }}
        </button>
      </div>
    </header>

    <main class="app__main">
      <HomeView />
    </main>

    <LoginModal v-if="show_login_modal" @close="show_login_modal = false" />
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useSessionStore } from "@/stores/session";
import { useContentStore } from "@/stores/content";
import HomeView from "@/views/HomeView.vue";
import LoginModal from "@/components/LoginModal.vue";

export default {
  components: { HomeView, LoginModal },
  data() {
    return {
      // set by adc-core's index.pug
      app_infos: window.app_infos,
      show_login_modal: false,
    };
  },
  computed: {
    ...mapState(useSessionStore, ["is_logged_in", "author_slug"]),
    ...mapState(useContentStore, ["is_connected"]),
  },
  methods: {
    ...mapActions(useSessionStore, ["logout"]),
  },
};
</script>

<style lang="scss" scoped>
.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  padding: 0.75rem clamp(1rem, 4vw, 2rem);
  border-bottom: 1px solid var(--c-border);
  background: var(--c-surface);
}

.topbar__name {
  margin: 0;
  font-size: 1.05rem;
}

.topbar__status {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--c-error);

  &.is--online {
    background: var(--c-ok);
  }
}

.topbar__session {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.topbar__author {
  font-size: 0.9rem;
  color: var(--c-muted);
}

.app__main {
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.5rem clamp(1rem, 4vw, 2rem);
}
</style>
