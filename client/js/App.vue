<template>
  <div id="app">

    <div
      v-if="$root.store.is_electron && process.platform === 'darwin'"
      id="systemBar"
    >
      <div class="fixedBand">
        <transition
          name="fade"
          :duration="850"
          >
          <div
            v-if="view === 'TimeLineView'"
            class="titleText font-small text-centered c-blanc"
            @click.prevent="$root.closeFolder()"
            >
            <i>Les Cahiers du Studio</i>
          </div>
        </transition>
      </div>
    </div>

    <div v-if="view === 'ListView'" class="container">
      <div class="row">

        <ListView
          v-if="view === 'ListView'"
          :slugFolderName="$root.settings.currentlyOpenedFolder"
          :folder="$root.store.folders[$root.settings.currentlyOpenedFolder]"
        >
        </ListView>

      </div>
    </div>
    <div v-if="view === 'TimeLineView'">

      <TimeLineView
        :slugFolderName="$root.settings.currentlyOpenedFolder"
        :folder="$root.store.folders[$root.settings.currentlyOpenedFolder]"
        :medias="$root.store.folders[$root.settings.currentlyOpenedFolder].medias"
      >
      </TimeLineView>

    </div>

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
import ListView from './ListView.vue';
import TimeLineView from './TimeLineView.vue';
import BottomFooter from './components/BottomFooter.vue';

export default {
  name: 'app',
  components: {
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
      debugger;
    }
  }
}
</script>

<style>
</style>
