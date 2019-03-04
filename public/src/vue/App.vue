<template>
  <div id="app" v-if="$root.access">

    <SystemBar
      v-if="$root.settings.enable_system_bar"
      :view="view"
    >
    </SystemBar>

    <template v-if="view === 'ListView'">
      
      <ListView
        v-if="view === 'ListView'"
        :presentationMD="$root.store.presentationMD"
        :read_only="!$root.state.connected"
        :folders="$root.store.folders"
      />

    </template>
    <template v-else-if="view === 'FolderView' && currentFolder.hasOwnProperty('name')">

      <FolderView
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
import SystemBar from './SystemBar.vue';
import ListView from './ListView.vue';
import FolderView from './FolderView.vue';
import BottomFooter from './components/BottomFooter.vue';

export default {
  name: 'app',
  components: {
    SystemBar,
    ListView,
    FolderView,
    BottomFooter
  },
  props: ['current_slugFolderName', 'currentFolder'],
  data() {
    return {};
  },
  computed: {
    view: function() {
      if (this.current_slugFolderName !== '') {
        return 'FolderView';
      }
      return 'ListView';
    }
  },
  watch: {},
  methods: {}
};
</script>

<style lang="less" src="style.less"></style>