<template>
  <main class="m_cahier">
    <header class="m_cahier--header">
      <RouterLink :to="{ name: 'home' }" class="button m_cahier--back">
        ← {{ $t("back") }}
      </RouterLink>
      <h1 class="m_cahier--title">{{ title }}</h1>
    </header>

    <p v-if="error" class="form-error m_cahier--message">{{ error }}</p>
    <p v-else-if="!cahier" class="m_cahier--message">{{ $t("loading") }}</p>
  </main>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useContentStore } from "@/stores/content";
import { useSessionStore } from "@/stores/session";

export default {
  props: {
    // from the route: /cahiers/:slug
    slug: { type: String, required: true },
  },
  data() {
    return {
      error: "",
    };
  },
  computed: {
    ...mapState(useSessionStore, ["token_path"]),
    ...mapState(useContentStore, ["getFolder"]),
    path_to_folder() {
      return `cahiers/${this.slug}`;
    },
    // kept up to date by the cahier's room (stores/content.js)
    cahier() {
      return this.getFolder(this.path_to_folder);
    },
    title() {
      return this.cahier?.title || this.slug;
    },
  },
  watch: {
    path_to_folder(new_path, old_path) {
      this.closeFolder(old_path);
      this.open();
    },
    // a private cahier opens once its contributor logs in
    token_path() {
      this.open();
    },
  },
  created() {
    this.open();
  },
  beforeUnmount() {
    this.closeFolder(this.path_to_folder);
  },
  methods: {
    ...mapActions(useContentStore, ["openFolder", "closeFolder"]),
    async open() {
      this.error = "";
      try {
        await this.openFolder(this.path_to_folder);
      } catch (err) {
        this.error = this.$t("error_with_code", {
          code: err.code || err.message,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.m_cahier--header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-small);
  padding: var(--spacing-small) var(--spacing-medium);
  background-color: var(--c-noir);
  color: white;
}

.m_cahier--back {
  padding: 0 var(--spacing-small) 0 0;
  font-size: var(--font-size-small);
  opacity: 0.7;

  &:hover,
  &:focus-visible {
    opacity: 1;
  }
}

.m_cahier--title {
  margin: 0;
  font-size: inherit;
  font-weight: normal;
  letter-spacing: 0.05em;
}

.m_cahier--message {
  padding: var(--spacing-medium);
}
</style>
