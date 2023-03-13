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

    <SessionPassword
      v-if="$root.showSessionPasswordModal"
      @close="$root.showSessionPasswordModal = false"
      :read_only="!$root.state.connected"
    />

    <template v-if="$root.showAuthorsListModal">
      <SimpleAuthorLogin
        v-if="
          !$root.current_author || $root.current_author.role === 'participant'
        "
        :prevent_close="
          $root.state.local_options.force_login && !$root.current_author
        "
        @close="$root.showAuthorsListModal = false"
      />

      <AuthorsList
        v-else
        :authors="$root.store.authors"
        :prevent_close="
          $root.state.local_options.force_login && !$root.current_author
        "
        @close="$root.showAuthorsListModal = false"
      />
    </template>

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
import SessionPassword from "./components/modals/SessionPassword.vue";

// import FolderView from "./FolderView.vue";
import TimelineView from "./TimelineView.vue";
import BottomFooter from "./components/BottomFooter.vue";
import AuthorsList from "./components/modals/AuthorsList.vue";
import SimpleAuthorLogin from "./components/modals/SimpleAuthorLogin.vue";

export default {
  name: "app",
  components: {
    SystemBar,
    ListView,
    SessionPassword,
    // FolderView,
    TimelineView,
    BottomFooter,
    AuthorsList,
    SimpleAuthorLogin,
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
