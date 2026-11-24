<template>
  <main class="m_cahier">
    <header class="m_cahier--header">
      <div class="m_cahier--start">
        <!-- a circled arrow -->
        <RouterLink
          :to="{ name: 'home' }"
          class="button m_cahier--back"
          :aria-label="$t('back')"
          :title="$t('back')"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <polyline points="9,4 3,10 9,16" />
            <line x1="3" y1="10" x2="17" y2="10" />
          </svg>
        </RouterLink>
        <h1 class="m_cahier--title">{{ title }}</h1>
        <!-- the cahier's settings, for its admins -->
        <button
          v-if="can_admin"
          type="button"
          class="m_cahier--edit"
          :aria-label="$t('cahier_settings')"
          :title="$t('cahier_settings')"
          @click="show_settings = true"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M13.5,3.5l3,3L7,16H4V13Z" />
            <line x1="11.5" y1="5.5" x2="14.5" y2="8.5" />
          </svg>
        </button>
        <!-- how this cahier is shown: next to its title, or in the menu on
        narrow screens -->
        <Teleport defer to="#m_cahier--menuPanel" :disabled="!is_narrow">
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
        </Teleport>
        <!-- the medias outlined as not seen yet: each click goes to the one
        added earliest, now seen, and the count goes down -->
        <button
          v-if="unseen_medias.length"
          type="button"
          class="m_cahier--unseen"
          :title="$t('show_next_unseen')"
          @click="showNextUnseen"
        >
          {{ $t("unseen_count", unseen_medias.length) }}
        </button>
      </div>

      <Teleport defer to="#m_cahier--menuPanel" :disabled="!is_narrow">
        <FeedbackButtons
          class="m_cahier--prototype"
          @feedback="$emit('feedback')"
        />
      </Teleport>

      <LiveStatus
        class="m_cahier--live"
        :explanation="$t('live_explanation_cahier')"
        :can_publish="can_contribute"
      />

      <!-- narrow screens: the views and the other buttons, behind ☰; it
      closes once one is chosen, on Esc, or on a click elsewhere -->
      <div
        v-show="is_narrow"
        ref="menu"
        class="m_cahier--menu"
        @keydown.esc="closeMenu(true)"
      >
        <button
          ref="menuButton"
          type="button"
          class="m_cahier--menuButton"
          :class="{ 'is--open': is_menu_open }"
          :aria-expanded="is_menu_open"
          aria-controls="m_cahier--menuPanel"
          :aria-label="$t('menu')"
          :title="$t('menu')"
          @click="is_menu_open = !is_menu_open"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <line x1="3" y1="5.5" x2="17" y2="5.5" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="14.5" x2="17" y2="14.5" />
          </svg>
          <!-- what's new, or feedback received, waits in it -->
          <span v-if="has_news" class="m_cahier--menuDot" aria-hidden="true" />
        </button>
        <div
          v-show="is_menu_open"
          id="m_cahier--menuPanel"
          class="m_cahier--menuPanel"
          @click="onMenuClick"
        />
      </div>
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
        :flash="scroll_flash"
        :can_edit="can_contribute"
        @open="openMedia"
      />
      <MediaGrid
        v-else
        :files="cahier.$files"
        :scroll_to="scroll_to"
        :flash="scroll_flash"
        @open="openMedia"
      />
    </div>

    <AddMedias
      v-if="cahier && can_contribute"
      :path_to_folder="path_to_folder"
      @files="selected_files = $event"
      @created="onMediaCreated"
    />

    <MediaModal
      v-if="open_media_meta"
      :media="open_media_meta"
      :can_edit="can_contribute"
      :has_prev="open_media_index > 0"
      :has_next="open_media_index < sorted_medias.length - 1"
      :position="open_media_index + 1"
      :total="sorted_medias.length"
      :all_keywords="all_keywords"
      @close="closeMedia"
      @replaced="open_media = $event"
      @prev="openSibling(-1)"
      @next="openSibling(1)"
    />

    <CahierSettingsModal
      v-if="show_settings && cahier"
      :cahier="cahier"
      @close="show_settings = false"
      @removed="$router.push({ name: 'home' })"
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
import { defineAsyncComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useContentStore } from "@/stores/content";
import { useSessionStore } from "@/stores/session";
import { canAdminFolder, canContributeToFolder } from "@/adc/rights";
import { closeTile, growTile, ungrow } from "@/flash";
import { sortByDate } from "@/medias";
import { useUnseenStore } from "@/stores/unseen";
import { useAppVersionStore } from "@/stores/appVersion";
import { useFeedbackStore } from "@/stores/feedback";
import { isInstanceAdmin } from "@/adc/rights";

// under 700px: the top bar's buttons in a menu
const NARROW = window.matchMedia("(max-width: 43.75rem)");
import AddMedias from "@/components/AddMedias.vue";
import CahierSettingsModal from "@/components/CahierSettingsModal.vue";
import LiveStatus from "@/components/LiveStatus.vue";
import FeedbackButtons from "@/components/FeedbackButtons.vue";
import MediaGrid from "@/components/MediaGrid.vue";
import MediaTimeline from "@/components/MediaTimeline.vue";
import UploadFilesModal from "@/components/UploadFilesModal.vue";

export default {
  emits: ["feedback"],
  components: {
    AddMedias,
    CahierSettingsModal,
    LiveStatus,
    FeedbackButtons,
    MediaGrid,
    // loaded on demand, with its Markdown libraries (marked, DOMPurify),
    // when a media is first opened
    MediaModal: defineAsyncComponent(
      () => import("@/components/MediaModal.vue")
    ),
    MediaTimeline,
    UploadFilesModal,
  },
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
      // …and comes back to its size: "browsed", the media whose window just
      // closed; "seen", from the top bar's count (flash.js)
      scroll_flash: "",
      // the media whose window is open
      open_media: "",
      // moved to another media with ← or →, since the window opened
      has_browsed: false,
      is_narrow: NARROW.matches,
      is_menu_open: false,
      show_settings: false,
    };
  },
  computed: {
    ...mapState(useSessionStore, ["token_path"]),
    ...mapState(useContentStore, ["getFolder"]),
    ...mapState(useAppVersionStore, ["is_updated"]),
    ...mapState(useFeedbackStore, ["new_count"]),
    ...mapState(useUnseenStore, ["isUnseen"]),
    // as on FeedbackButtons': what's new not seen, new feedback for admins
    has_news() {
      return (
        this.is_updated ||
        (isInstanceAdmin(this.token_path) && this.new_count > 0)
      );
    },
    path_to_folder() {
      return `cahiers/${this.slug}`;
    },
    // kept up to date by the cahier's room (stores/content.js)
    cahier() {
      return this.getFolder(this.path_to_folder);
    },
    // in timeline order, for the window's ← and →
    sorted_medias() {
      return sortByDate(this.cahier?.$files || []);
    },
    open_media_index() {
      return this.sorted_medias.findIndex((m) => m.$path === this.open_media);
    },
    // undefined until the media shows up, or once it
    // is removed: the window closes
    open_media_meta() {
      return this.sorted_medias[this.open_media_index];
    },
    // outlined as not seen yet, the one added earliest first ($date_created:
    // ISO dates, in UTC, compared as strings)
    unseen_medias() {
      return (this.cahier?.$files || [])
        .filter((f) => this.isUnseen(f.$path))
        .sort((a, b) =>
          (a.$date_created || "").localeCompare(b.$date_created || "")
        );
    },
    all_keywords() {
      const keywords = new Set();
      for (const media of this.cahier?.$files || [])
        if (Array.isArray(media.keywords))
          media.keywords.forEach((k) => keywords.add(String(k)));
      return [...keywords].sort((a, b) => a.localeCompare(b));
    },
    can_contribute() {
      return canContributeToFolder(this.cahier, this.token_path);
    },
    can_admin() {
      return !!this.cahier && canAdminFolder(this.cahier, this.token_path);
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
    // the medias' paths, once the cahier's files are loaded: compared as a
    // string, not to sync on every change of a media's meta
    media_paths() {
      const files = this.cahier?.$files;
      // the repères left out: never outlined as unseen
      return Array.isArray(files)
        ? files
            .filter((f) => f.$type !== "marker")
            .map((f) => f.$path)
            .join("\n")
        : null;
    },
  },
  watch: {
    // opened, a media added or removed (by anyone), back after a cut: those
    // this browser doesn't know yet are outlined until seen
    media_paths: {
      immediate: true,
      handler(paths) {
        if (paths === null) return;
        this.syncUnseen(this.path_to_folder, paths ? paths.split("\n") : []);
      },
    },
    path_to_folder(new_path, old_path) {
      this.closeFolder(old_path);
      this.open();
    },
    is_menu_open(open) {
      if (open)
        document.addEventListener("pointerdown", this.onPointerOutside, true);
      else
        document.removeEventListener(
          "pointerdown",
          this.onPointerOutside,
          true
        );
    },
    // a private cahier opens once its contributor logs in
    token_path() {
      this.open();
    },
  },
  created() {
    this.open();
  },
  mounted() {
    NARROW.addEventListener("change", this.onNarrowChange);
  },
  beforeUnmount() {
    clearTimeout(this.scroll_timeout);
    this.closeFolder(this.path_to_folder);
    NARROW.removeEventListener("change", this.onNarrowChange);
    document.removeEventListener("pointerdown", this.onPointerOutside, true);
  },
  methods: {
    onNarrowChange(event) {
      this.is_narrow = event.matches;
      if (!event.matches) this.closeMenu();
    },
    // open: a click outside it closes it
    onPointerOutside(event) {
      if (!this.$refs.menu?.contains(event.target)) this.closeMenu();
    },
    // Esc: back on ☰
    closeMenu(focus_button = false) {
      if (!this.is_menu_open) return;
      this.is_menu_open = false;
      if (focus_button) this.$refs.menuButton?.focus();
    },
    // a view, or a button chosen: done with the menu
    onMenuClick(event) {
      if (event.target.closest?.("a, button")) this.closeMenu();
    },
    ...mapActions(useContentStore, ["openFolder", "closeFolder"]),
    ...mapActions(useUnseenStore, {
      syncUnseen: "sync",
      addUnseen: "add",
      markSeen: "markSeen",
    }),
    // the top bar's count: to the media not seen yet added earliest, seen
    // without opening it, its tile coming back from a little larger
    showNextUnseen() {
      const media = this.unseen_medias[0];
      if (!media) return;
      this.markSeen(media.$path);
      this.scrollTo(media.$path, { flash: "seen" });
    },
    // a text, repère or link, from the + button, already written
    onMediaCreated(path_to_meta, type) {
      // a repère is never outlined
      if (type !== "marker") this.addUnseen(path_to_meta);
      this.scrollTo(path_to_meta);
    },
    // the timeline under the window stays still: scrolled once, on closing
    openSibling(offset) {
      const media = this.sorted_medias[this.open_media_index + offset];
      if (media) {
        this.open_media = media.$path;
        this.has_browsed = true;
      }
    },
    // after ← or →: the timeline shows the last media seen
    // from its tile: the tile grows, as if it became the window
    openMedia(path_to_meta) {
      this.open_media = path_to_meta;
      growTile(path_to_meta);
    },
    // the tile back to its size; after ← or →, the one of the last media
    // seen, once scrolled to (MediaTimeline, MediaGrid)
    closeMedia() {
      if (this.has_browsed && this.open_media) {
        ungrow();
        this.scrollTo(this.open_media, { flash: "browsed" });
      } else closeTile(this.open_media);
      this.open_media = "";
      this.has_browsed = false;
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
    // flash: back to its size once there ("browsed" or "seen", flash.js)
    scrollTo(path_to_meta, { flash = "" } = {}) {
      this.scroll_to = path_to_meta;
      this.scroll_flash = flash;
      clearTimeout(this.scroll_timeout);
      this.scroll_timeout = setTimeout(() => {
        this.scroll_to = "";
        this.scroll_flash = "";
      }, 4000);
    },
    async open() {
      this.error = "";
      try {
        // its medias not seen yet: media_paths, watched
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

.m_cahier--start {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  min-width: 0;
}

.m_cahier--views {
  flex: 0 0 auto;
  display: flex;
  gap: var(--spacing-verysmall);
}

.m_cahier--live {
  justify-self: end;
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

// back, title and views on the left, the prototype's message in the
// middle, the live status on the right; on narrow screens, one line still:
// the title cut short, the message small, against the live status
.m_cahier--header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: var(--spacing-small);
  padding: var(--spacing-verysmall) var(--spacing-small);
  background-color: var(--c-noir);
  color: white;
}

// after the rule above, so that it wins
@media screen and (max-width: 60rem) {
  .m_cahier--header {
    grid-template-columns: minmax(0, 1fr) auto auto;
  }
  // more specific than FeedbackButtons' own rules
  .m_cahier--header .m_cahier--prototype {
    justify-self: end;

    :deep(button) {
      padding: 0.1rem 0.45rem;
      font-size: var(--font-size-verysmall);
    }
  }
  // as much room as there is, then an ellipsis
  .m_cahier--title {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// green, as the outline of the medias it counts
.m_cahier--unseen {
  flex: 0 0 auto;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background-color: var(--c-vert_vif);
  color: white;
  font-size: var(--font-size-small);
  line-height: 1.4;
  white-space: nowrap;
  transition: filter 0.15s;

  &:hover,
  &:focus-visible {
    filter: brightness(0.95);
  }
}

// a pencil, next to the title
.m_cahier--edit {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 50%;
  color: var(--c-gris_clair);

  svg {
    display: block;
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.3;
    stroke-linejoin: round;
  }

  &:hover,
  &:focus-visible {
    color: white;
    background-color: var(--c-gris_fonce);
  }
}

.m_cahier--back {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--c-gris_fonce);
  border-radius: 50%;

  svg {
    display: block;
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover,
  &:focus-visible {
    border-color: var(--c-gris_clair);
  }
}

.m_cahier--title {
  margin: 0;
  font-size: inherit;
  font-weight: normal;
  letter-spacing: 0.05em;
  // long titles are shown whole, on several lines if needed
  min-width: 0;
  line-height: 1.25;
  overflow-wrap: break-word;
}

// narrow screens: back and title, the live status, ☰
@media screen and (max-width: 43.75rem) {
  .m_cahier--header {
    grid-template-columns: minmax(0, 1fr) auto auto;
  }
}

.m_cahier--menu {
  position: relative;
}

.m_cahier--menuButton {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--c-gris_fonce);
  border-radius: 4px;
  color: inherit;

  svg {
    display: block;
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  &:hover,
  &:focus-visible,
  &.is--open {
    border-color: var(--c-gris_clair);
  }
}

.m_cahier--menuDot {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: var(--c-rouge);
  box-shadow: 0 0 0 2px var(--c-noir);
}

// under ☰, its right edge aligned with it: the views, then the buttons,
// one under the other
.m_cahier--menuPanel {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: 100;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  gap: var(--spacing-small);
  width: max-content;
  max-width: calc(100vw - 2rem);
  padding: var(--spacing-small);
  border-radius: 4px;
  background-color: var(--c-noir);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);

  // teleported here: more specific than the top bar's narrow rules
  :deep(.m_feedbackButtons) {
    flex-flow: column nowrap;
    align-items: flex-start;

    button {
      padding: 0.15rem 0.6rem;
      font-size: var(--font-size-small);
    }
  }
}

.m_cahier--message {
  padding: var(--spacing-medium);
}
</style>
