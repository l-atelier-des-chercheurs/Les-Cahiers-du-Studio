<template>
  <div id="app">

    <SystemBar
      v-if="$root.settings.enable_system_bar"
      :view="view"
    >
    </SystemBar>

    <template v-if="view === 'ListView'">
      <div class="container">
        <div class="row">

          <ListView
            v-if="view === 'ListView'"
            :slugFolderName="$root.settings.currentlyOpenedFolder"
            :folder="$root.store.folders[$root.settings.currentlyOpenedFolder]"
            :presentationMD="$root.store.presentationMD"
            :read_only="!$root.store.connected"
          >
          </ListView>

        </div>
      </div>
    </template>
    <template v-else-if="view === 'TimeLineView'">

      <TimeLineView
        :slugFolderName="$root.settings.currentlyOpenedFolder"
        :folder="$root.store.folders[$root.settings.currentlyOpenedFolder]"
        :medias="$root.store.folders[$root.settings.currentlyOpenedFolder].medias"
        :read_only="!$root.store.connected"
      >
      </TimeLineView>

    </template>

    <div class="container">
      <div class="row">
        <template>
          <BottomFooter v-if="$root.settings.currentlyOpenedFolder === ''">
          </BottomFooter>
        </template>
      </div>
    </div>

    <portal-target name="modal_container" />

  </div>
</template>

<script>
import SystemBar from './SystemBar.vue';
import ListView from './ListView.vue';
import TimeLineView from './TimeLineView.vue';
import BottomFooter from './components/BottomFooter.vue';

export default {
  name: 'app',
  components: {
    SystemBar,
    ListView,
    TimeLineView,
    BottomFooter
  },
  data () {
    return {
      view: 'ListView',
    }
  },
  computed: {
  },
  watch: {
    '$root.settings.currentlyOpenedFolder' : function() {
      if(this.$root.settings.currentlyOpenedFolder !== '') {
        this.view = 'TimeLineView';
      } else {
        this.view = 'ListView';
      }
    }
  },
  methods: {
    log() {
    }
  }
}
</script>

<style>
</style>
