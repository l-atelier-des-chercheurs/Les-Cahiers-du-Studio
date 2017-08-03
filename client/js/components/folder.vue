<template>
  <div>
    <h2>
      {{ folder.name }}
    </h2>
    <button @click='openfolder()'>
      Open/close
    </button>

    <template v-if='this.$root.settings.folder_currently_opened === slugfoldername'>
      <fileUpload
        :slugFolderName='slugfoldername'
      >
      </fileUpload>
      <media
        v-for='(media, index) in folder.medias'
        :key='index'
        :slugFolderName='slugfoldername'
        :slugMediaName='index'
        :media='media'
      >
      </media>
    </template>
    <hr>
  </div>
</template>
<script>
import media from './media.vue';
import fileUpload from './fileUpload.vue';

/*
  WARNING : since index compiles to an HTML file, we have to use lowercase variables there
  --> which means slugfoldername becomes slugFolderName but only in this file
*/

export default {
  props: ['folder', 'slugfoldername'],
  components: {
    media,
    fileUpload
  },
  data() {
    return {
    }
  },
  computed: {
  },
  methods: {
    openfolder() {
      if(window.store.debug) { console.log('EVENT: openfolder ' + this.slugfoldername); }
      this.$emit('openfolder', this.slugfoldername);
    }
  },

  computed: {
  }
}
</script>
<style>
</style>