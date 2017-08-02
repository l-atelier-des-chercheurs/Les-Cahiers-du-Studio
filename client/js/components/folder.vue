<template>
  <div>
    <h2>
      {{ folder.name }}
    </h2>
    <fileUpload>
    </fileUpload>

    <media v-for='(media, index) in folder.medias' :key='index' :folderSlug='slug' :slug='index' :media='media'>
    </media>

  </div>
</template>
<script>
import media from './media.vue';
import fileUpload from './fileUpload.vue';

export default {
  props: ['folder', 'slug'],
  components: {
    media,
    fileUpload
  },
  data() {
    return {
    }
  },
  computed: {
  }
}
</script>
<style>
</style>