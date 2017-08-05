<template>
  <div class="clearfix">
    <h2 class="margin-small">
      {{ folder.name }}
    </h2>
    <button type="button" class="button-small margin-small" @click="openFolder()">
      Open/close
    </button>

    <template v-if="this.$parent.settings.folder_currently_opened === slugFolderName">
      <fileUpload
        :slugFolderName="slugfoldername"
      >
      </fileUpload>
      <media
        v-for="(media, index) in folder.medias"
        :key="index"
        :slugFolderName="slugfoldername"
        :slugMediaName="index"
        :media="media"
      >
      </media>
    </template>
    <hr>
  </div>
</template>
<script>
import Media from './Media.vue';
import FileUpload from './FileUpload.vue';

/*
  WARNING : since index compiles to an HTML file, we have to use lowercase variables there
  --> which means slugfoldername becomes slugFolderName but only in this file
*/

export default {
  props: ['folder', 'slugFolderName'],
  components: {
    Media,
    FileUpload
  },
  data() {
    return {
    }
  },
  computed: {

  },
  methods: {
    openFolder() {
      this.$emit('openFolder', this.slugFolderName);
    }
  },

  computed: {
  }
}
</script>
<style>
</style>