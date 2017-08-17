<template>
  <div id="app">

    <div
      :class="{ 'is--collapsed' : $root.settings.currentlyOpenedFolder !== '' }"
      class="pushContentDown">
    </div>

    <div class="container">
      <div class="row">

        <Navbar :folder="$root.store.folders[$root.settings.currentlyOpenedFolder]">
        </Navbar>

        <transition name="component-fade">
          <main v-if="$root.settings.currentlyOpenedFolder === ''">
            <h1>
              la plate-forme du studio-théâtre de Vitry
            </h1>
            <p>Ici une présentation de la plate-forme en elle-même. Ici une présentation de la plate-forme. Ici une présentation de la plate-forme. Ici une présentation de la plate-forme en elle-même. Ici une présentation de la plate-forme. Ici une présentation de la plate-forme […].</p>
            <p>
              <a class="with_arrow" href="http://www.studiotheatre.fr/" target="_blank">plus d’informations sur le site du studio-théâtre</a>
            </p>
          </main>
        </transition>
      </div>
    </div>

    <transition name="component-fade" mode="out-in">
      <component
        :is="view"
        :slugFolderName="$root.settings.currentlyOpenedFolder"
        :folder="$root.store.folders[$root.settings.currentlyOpenedFolder]"
      ></component>
    </transition>

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
