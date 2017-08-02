<template>
  <div style="width:70px; display: inline-block; margin:5px;">
    <pre>
    </pre>
    <template v-if="media.type === 'image'">
      <img :src="linkToMedia">
    </template>
    <template v-else-if="media.type === 'video'">
      <video controls :src="linkToMedia">
      </video>
    </template>
  </div>
</template>
<script>

export default {
  props: ['folderSlug', 'media', 'slug'],
  data() {
    return {
    }
  },
  computed: {
    linkToMedia: function() {
        return this.folderSlug + '/' + this.slug;
    },
  }
}
</script>
<style>
</style>