<template>
  <div id="app">

    <div
      :class="{ 'is--collapsed' : $root.settings.currentlyOpenedFolder !== '' }"
      class="pushContentDown">
    </div>

    <div v-if="view === 'ListView'" class="container">
      <div class="row">

        <NavbarLeft v-if="view === 'ListView'">
        </NavbarLeft>

        <main>
          <h1>
            la plate-forme du studio-théâtre de Vitry
          </h1>
          <p>Ici une présentation de la plate-forme en elle-même. Ici une présentation de la plate-forme. Ici une présentation de la plate-forme. Ici une présentation de la plate-forme en elle-même. Ici une présentation de la plate-forme. Ici une présentation de la plate-forme […].</p>
          <p>
            <a class="with_arrow js--openInBrowser" href="https://www.studiotheatre.fr/" target="_blank">plus d’informations sur le site du studio-théâtre</a>
          </p>

        </main>

        <ListView
          v-if="view === 'ListView'"
          :slugFolderName="$root.settings.currentlyOpenedFolder"
          :folder="$root.store.folders[$root.settings.currentlyOpenedFolder]"
        >
        </ListView>

      </div>

    </div>
    <div v-if="view === 'TimeLineView'">

      <NavbarTop
        :folder="$root.store.folders[$root.settings.currentlyOpenedFolder]"
        :slugFolderName="$root.settings.currentlyOpenedFolder"
        @toggleSidebar="toggleSidebar()"
        >
      </NavbarTop>

      <Sidebar
        v-if="$root.settings.has_sidebar_opened"
        :slugFolderName="$root.settings.currentlyOpenedFolder"
        :folder="$root.store.folders[$root.settings.currentlyOpenedFolder]"
        :medias="$root.store.folders[$root.settings.currentlyOpenedFolder].medias"
      >
      </Sidebar>

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
import NavbarTop from './components/NavbarTop.vue';
import NavbarLeft from './components/NavbarLeft.vue';
import ListView from './ListView.vue';
import Sidebar from './components/Sidebar.vue';
import TimeLineView from './TimeLineView.vue';
import BottomFooter from './components/BottomFooter.vue';

export default {
  name: 'app',
  components: {
    NavbarTop,
    NavbarLeft,
    ListView,
    Sidebar,
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
    toggleSidebar: function() {
      this.$root.settings.has_sidebar_opened = !this.$root.settings.has_sidebar_opened;
    }

  }
}
</script>

<style>
</style>
