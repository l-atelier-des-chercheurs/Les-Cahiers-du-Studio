<template>
  <div style="width:270px; display: inline-block; margin:5px;">
    <pre>
    </pre>
    <template v-if="media.type === 'image'">
      <img :src="linkToThumb">
    </template>
    <template v-else-if="media.type === 'video'">
      <video controls :src="linkToMedia">
      </video>
    </template>
  </div>
</template>
<script>
import _ from 'underscore';

export default {
  props: ['slugFolderName', 'slugMediaName', 'media'],
  data() {
    return {
    }
  },
  computed: {
    linkToMedia: function() {
      return this.slugFolderName + '/' + this.slugMediaName;
    },
    linkToThumb: function() {
      let pathToSmallestThumb = _.findWhere(this.media.thumb, {size: "200"}).path;
      return pathToSmallestThumb !== undefined ? pathToSmallestThumb : linkToMedia();
    },
  }
}
</script>
<style>
</style>