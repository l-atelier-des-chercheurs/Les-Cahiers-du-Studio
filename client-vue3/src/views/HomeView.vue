<template>
  <section class="home">
    <div class="home__bar">
      <h2 class="home__title">{{ $t("cahiers") }}</h2>
      <button
        v-if="is_logged_in"
        type="button"
        class="button button--primary"
        @click="show_create_modal = true"
      >
        + {{ $t("create_cahier") }}
      </button>
      <p v-else class="form__hint">{{ $t("login_to_create") }}</p>
    </div>

    <p v-if="error" class="form__error">{{ error }}</p>
    <p v-else-if="!cahiers" class="form__hint">{{ $t("loading") }}</p>
    <p v-else-if="visible_cahiers.length === 0" class="form__hint">
      {{ $t("no_cahiers") }}
    </p>
    <ul v-else class="cahiers">
      <li
        v-for="cahier in visible_cahiers"
        :key="cahier.$path"
        class="cahier"
        :class="{ 'is--new': cahier.$path === last_created }"
      >
        <span class="cahier__title">
          {{ cahier.title || cahier.$path.split("/").pop() }}
        </span>
        <span v-if="cahier.$status === 'private'" class="tag">
          {{ $t("private") }}
        </span>
        <span v-if="cahier.$date_created" class="cahier__date">
          {{ $t("created_on", { date: formatDate(cahier.$date_created) }) }}
        </span>
      </li>
    </ul>

    <CreateCahierModal
      v-if="show_create_modal"
      @close="show_create_modal = false"
      @created="onCreated"
    />
  </section>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { canSeeFolder } from "@/adc/rights";
import { i18n } from "@/i18n";
import { useContentStore } from "@/stores/content";
import { useSessionStore } from "@/stores/session";
import CreateCahierModal from "@/components/CreateCahierModal.vue";

export default {
  components: { CreateCahierModal },
  data() {
    return {
      error: "",
      show_create_modal: false,
      last_created: undefined,
    };
  },
  computed: {
    ...mapState(useSessionStore, ["is_logged_in", "token_path"]),
    ...mapState(useContentStore, ["getFolders"]),
    // kept up to date by the "cahiers" room (stores/content.js)
    cahiers() {
      return this.getFolders("cahiers");
    },
    visible_cahiers() {
      return this.cahiers
        .filter((cahier) => canSeeFolder(cahier, this.token_path))
        .sort((a, b) =>
          String(b.$date_created ?? "").localeCompare(
            String(a.$date_created ?? "")
          )
        );
    },
  },
  watch: {
    // what the server lists depends on who is logged in
    token_path() {
      this.load(this.loadFolders);
    },
  },
  created() {
    this.load(this.openFolders);
  },
  beforeUnmount() {
    this.closeFolders("cahiers");
  },
  methods: {
    ...mapActions(useContentStore, [
      "openFolders",
      "loadFolders",
      "closeFolders",
    ]),
    async load(action) {
      this.error = "";
      try {
        await action("cahiers");
      } catch (err) {
        this.error = this.$t("error_with_code", {
          code: err.code || err.message,
        });
      }
    },
    onCreated(path_to_folder) {
      this.show_create_modal = false;
      this.last_created = path_to_folder;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString(i18n.global.locale.value, {
        dateStyle: "medium",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.home__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  margin-bottom: 1.25rem;
}

.home__title {
  margin: 0;
  font-size: 1.5rem;
}

.cahiers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cahier {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 1rem;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: var(--c-surface);
  transition: border-color 0.6s;

  &.is--new {
    border-color: var(--c-accent);
  }
}

.cahier__title {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.cahier__date {
  font-size: 0.85rem;
  color: var(--c-muted);
}

.tag {
  padding: 0.1rem 0.45rem;
  border-radius: 1rem;
  background: var(--c-border);
  font-size: 0.75rem;
}
</style>
