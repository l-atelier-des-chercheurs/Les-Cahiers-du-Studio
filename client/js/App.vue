<template>
  <div id="app">

    <Navbar :folder="$root.store.folders[$root.settings.currentlyOpenedFolder]">
    </Navbar>

    <transition name="component-fade" mode="out-in">
      <component
        :is="view"
        :slugFolderName="$root.settings.currentlyOpenedFolder"
        :folder="$root.store.folders[$root.settings.currentlyOpenedFolder]"
      ></component>
    </transition>

    <template>
      <BottomFooter v-if="$root.settings.currentlyOpenedFolder === ''">
      </BottomFooter>
    </template>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import ListView from './ListView.vue'
import TimeLine from './TimeLine.vue';
import BottomFooter from './components/BottomFooter.vue';

export default {
  name: 'app',
  components: {
    Navbar,
    ListView,
    TimeLine,
    BottomFooter,
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
        this.view = 'TimeLine';
      } else {
        this.view = 'ListView';
      }
    }
  }
}
</script>

<style>
</style>
