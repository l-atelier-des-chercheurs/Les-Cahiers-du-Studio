<template>
  <div id="app" v-if="$root.access">
    <SystemBar v-if="$root.settings.enable_system_bar" :view="view"></SystemBar>

    <div
      class="m_connectionStatus"
      v-if="!$root.state.connected && $root.state.mode !== 'export_web'"
    >
      {{ $t("notifications.connection_lost") }}
      {{ $t("notifications.contents_wont_be_editable") }}
    </div>

    <div class="_openAuthorModal" v-if="view === 'ListView'">
      <button
        type="button"
        class="m_topbar--center--authors--currentAuthor"
        @click="$root.showAuthorsListModal = true"
        :content="$t('login')"
        v-tippy="{
          placement: 'bottom',
          delay: [600, 0],
        }"
      >
        <template v-if="$root.current_author">
          <div
            class="m_topbar--center--authors--portrait"
            v-if="
              $root.current_author.hasOwnProperty('preview') &&
              $root.current_author.preview.length !== ''
            "
          >
            <img
              :src="urlToPortrait($root.current_author.preview)"
              width="100"
              height="100"
              draggable="false"
            />
          </div>
          <div class="m_topbar--center--authors--name">
            {{ $root.current_author.name }}
          </div>
        </template>
        <template v-else>
          <div class="font-medium">({{ $t("authors") }})</div>
        </template>
      </button>
    </div>
    <AuthorsList
      v-if="$root.showAuthorsListModal"
      :authors="$root.store.authors"
      :prevent_close="
        $root.state.local_options.force_login && !$root.current_author
      "
      @close="$root.showAuthorsListModal = false"
    />

    <template v-if="view === 'ListView'">
      <ListView
        v-if="view === 'ListView'"
        :presentationMD="$root.store.presentationMD"
        :read_only="!$root.state.connected"
        :folders="$root.store.folders"
      />
    </template>
    <template v-else-if="view === 'TimelineView' && $root.current_folder">
      <TimelineView
        :slugFolderName="$root.current_folder.slugFolderName"
        :folder="$root.current_folder"
        :medias="$root.current_folder.medias"
        :read_only="!$root.state.connected"
      />
    </template>

    <portal-target name="modal_container" />
  </div>
</template>

<script>
import SystemBar from "./SystemBar.vue";
import ListView from "./ListView.vue";
// import FolderView from "./FolderView.vue";
import TimelineView from "./TimelineView.vue";
import BottomFooter from "./components/BottomFooter.vue";
import AuthorsList from "./components/modals/AuthorsList.vue";

export default {
  name: "app",
  components: {
    SystemBar,
    ListView,
    // FolderView,
    TimelineView,
    BottomFooter,
    AuthorsList,
  },
  data() {
    return {};
  },
  computed: {
    view: function () {
      if (this.$root.settings.current_slugFolderName !== "") {
        return "TimelineView";
      }
      return "ListView";
    },
  },
  watch: {},
  methods: {},
};
</script>

<style lang="less" src="style.less"></style>
