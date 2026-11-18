<template>
  <main class="m_cahier">
    <header class="m_cahier--header">
      <RouterLink :to="{ name: 'home' }" class="button m_cahier--back">
        ← {{ $t("back") }}
      </RouterLink>
      <h1 class="m_cahier--title">{{ title }}</h1>

      <nav class="m_cahier--views" :aria-label="$t('display')">
        <RouterLink
          v-for="option in view_options"
          :key="option.key"
          :to="{ query: option.query }"
          replace
          class="button m_cahier--view"
          :class="{ 'is--active': view === option.key }"
          :aria-current="view === option.key ? 'page' : undefined"
          :aria-label="$t(option.label)"
          :title="$t(option.label)"
        >
          <!-- two days, each a rule with its medias beside it -->
          <svg
            v-if="option.key === 'timeline'"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <line x1="2.5" y1="2" x2="2.5" y2="18" />
            <rect x="4.5" y="3.5" width="4" height="5" />
            <rect x="4.5" y="10.5" width="4" height="5" />
            <line x1="11.5" y1="2" x2="11.5" y2="18" />
            <rect x="13.5" y="3.5" width="4" height="5" />
          </svg>
          <svg v-else viewBox="0 0 20 20" aria-hidden="true">
            <rect x="3" y="3" width="6" height="6" />
            <rect x="11" y="3" width="6" height="6" />
            <rect x="3" y="11" width="6" height="6" />
            <rect x="11" y="11" width="6" height="6" />
          </svg>
        </RouterLink>
      </nav>
    </header>

    <div class="m_cahier--content">
      <p v-if="error" class="form-error m_cahier--message">{{ error }}</p>
      <!-- $files: once the cahier itself is opened, not only listed -->
      <p v-else-if="!cahier?.$files" class="m_cahier--message">
        {{ $t("loading") }}
      </p>

      <MediaTimeline
        v-else-if="view === 'timeline'"
        :path_to_folder="path_to_folder"
        :files="cahier.$files"
        :start="cahier.start"
        :end="cahier.end"
        :scroll_to="scroll_to"
      />
      <MediaGrid v-else :files="cahier.$files" :scroll_to="scroll_to" />
    </div>

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
      @close="onUploadClosed"
    />
  </main>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useContentStore } from "@/stores/content";
import { useSessionStore } from "@/stores/session";
import { canContributeToFolder } from "@/adc/rights";
import { sortByDate } from "@/medias";
import { useUnseenStore } from "@/stores/unseen";
import AddMedias from "@/components/AddMedias.vue";
import MediaGrid from "@/components/MediaGrid.vue";
import MediaTimeline from "@/components/MediaTimeline.vue";
import UploadFilesModal from "@/components/UploadFilesModal.vue";

export default {
  components: { AddMedias, MediaGrid, MediaTimeline, UploadFilesModal },
  props: {
    // from the route: /:slug
    slug: { type: String, required: true },
  },
  data() {
    return {
      error: "",
      // chosen or dropped on the + button, sent by UploadFilesModal
      selected_files: [],
      // a media just added, scrolled to once it shows up
      scroll_to: "",
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
    // the timeline by default, the grid at ?vue=grille
    view() {
      return this.$route.query.vue === "grille" ? "grid" : "timeline";
    },
    view_options() {
      return [
        { key: "timeline", label: "timeline", query: {} },
        { key: "grid", label: "grid", query: { vue: "grille" } },
      ];
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
    clearTimeout(this.scroll_timeout);
    this.closeFolder(this.path_to_folder);
  },
  methods: {
    ...mapActions(useContentStore, ["openFolder", "closeFolder"]),
    ...mapActions(useUnseenStore, { loadUnseen: "load", addUnseen: "add" }),
    // a text, repère or link, from the + button
    // TODO open the media's edit modal for a new text
    onMediaCreated(path_to_meta) {
      this.addUnseen(path_to_meta);
      this.scrollTo(path_to_meta);
    },
    // the files sent (UploadFilesModal marks them unseen): scroll to the
    // earliest on the timeline
    onUploadClosed(paths_to_meta = []) {
      this.selected_files = [];
      const sent = new Set(paths_to_meta);
      const medias = sortByDate(
        (this.cahier?.$files || []).filter((f) => sent.has(f.$path))
      );
      const first = medias[0]?.$path || paths_to_meta[0];
      if (first) this.scrollTo(first);
    },
    // for a few seconds: the media may only show up with the server's event
    scrollTo(path_to_meta) {
      this.scroll_to = path_to_meta;
      clearTimeout(this.scroll_timeout);
      this.scroll_timeout = setTimeout(() => (this.scroll_to = ""), 4000);
    },
    async open() {
      this.error = "";
      try {
        const cahier = await this.openFolder(this.path_to_folder);
        // the medias added from this browser and not seen yet
        this.loadUnseen(
          this.path_to_folder,
          (cahier.$files || []).map((f) => f.$path)
        );
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
// the header, and the view filling the rest of the window: the timeline
// scrolls sideways, the grid downwards
.m_cahier {
  display: flex;
  flex-flow: column nowrap;
  height: 100vh;
  height: 100dvh;
}

.m_cahier--content {
  flex: 1 1 auto;
  min-height: 0;
}

.m_cahier--views {
  display: flex;
  gap: var(--spacing-verysmall);
  margin-left: auto;
}

.m_cahier--view {
  display: flex;
  align-items: center;
  padding: 0.2rem 0.4rem;
  border: 1px solid var(--c-gris_fonce);

  svg {
    display: block;
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.2;
  }

  &:hover {
    border-color: var(--c-gris_clair);
  }
  &.is--active {
    border-color: white;
    background-color: white;
    color: var(--c-noir);
  }
}

.m_cahier--header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-small);
  padding: var(--spacing-verysmall) var(--spacing-small);
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
