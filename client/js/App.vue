<template>
  <div id="app">

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
  }
}
</script>

<style>
</style>
