<template>
  <div>
    <div>
      Name:
      {{ folder.name }}
    </div>
    <media v-for='(media, index) in folder.medias' :key='index' :slug='index' :media='media'>
    </media>
  </div>
</template>
<script>
import media from './media.vue';

export default {
  props: ['folder', 'slug'],
  components: {
    media
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