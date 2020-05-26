<template>
  <div id="app" v-if="$root.access">
    <SystemBar v-if="$root.settings.enable_system_bar" :view="view">
    </SystemBar>

    <div
      class="m_connectionStatus"
      v-if="!$root.state.connected && $root.state.mode !== 'export_web'"
    >
      {{ $t("notifications.connection_lost") }}
      {{ $t("notifications.contents_wont_be_editable") }}
    </div>

    <template v-if="view === 'ListView'">
      <ListView
        v-if="view === 'ListView'"
        :presentationMD="$root.store.presentationMD"
        :read_only="!$root.state.connected"
        :folders="$root.store.folders"
      />
    </template>
    <!-- <template
      v-else-if="view === 'FolderView' && currentFolder.hasOwnProperty('name')"
    >
      <FolderView
        :slugFolderName="current_slugFolderName"
        :folder="currentFolder"
        :medias="currentFolder.medias"
        :read_only="!$root.state.connected"
      />
    </template> -->
    <template
      v-else-if="
        view === 'TimelineView' && currentFolder.hasOwnProperty('name')
      "
    >
      <TimelineView
        :slugFolderName="current_slugFolderName"
        :folder="currentFolder"
        :medias="currentFolder.medias"
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

export default {
  name: "app",
  components: {
    SystemBar,
    ListView,
    // FolderView,
    TimelineView,
    BottomFooter,
  },
  props: ["current_slugFolderName", "currentFolder"],
  data() {
    return {};
  },
  computed: {
    view: function () {
      if (this.current_slugFolderName !== "") {
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
