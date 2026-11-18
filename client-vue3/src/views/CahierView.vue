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

    <MediaGrid
      v-else
      :files="cahier.$files || []"
      :highlighted="last_created"
    />

    <AddMedias
      v-if="cahier && can_contribute"
      :path_to_folder="path_to_folder"
      @files="selected_files = $event"
      @created="onMediaCreated"
    />

    <UploadFilesModal
      v-if="selected_files.length"
      :path_to_folder="path_to_folder"
      :files="selected_files"
      @close="selected_files = []"
    />
  </main>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useContentStore } from "@/stores/content";
import { useSessionStore } from "@/stores/session";
import { canContributeToFolder } from "@/adc/rights";
import AddMedias from "@/components/AddMedias.vue";
import MediaGrid from "@/components/MediaGrid.vue";
import UploadFilesModal from "@/components/UploadFilesModal.vue";

export default {
  components: { AddMedias, MediaGrid, UploadFilesModal },
  props: {
    // from the route: /:slug
    slug: { type: String, required: true },
  },
  data() {
    return {
      error: "",
      // chosen or dropped on the + button, sent by UploadFilesModal
      selected_files: [],
      // a media added with the + button, outlined in the grid for a while
      last_created: "",
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
    can_contribute() {
      return canContributeToFolder(this.cahier, this.token_path);
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
    clearTimeout(this.highlight_timeout);
    this.closeFolder(this.path_to_folder);
  },
  methods: {
    ...mapActions(useContentStore, ["openFolder", "closeFolder"]),
    // TODO open the media's edit modal for a new text
    onMediaCreated(path_to_meta) {
      this.last_created = path_to_meta;
      clearTimeout(this.highlight_timeout);
      this.highlight_timeout = setTimeout(() => (this.last_created = ""), 4000);
    },
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
