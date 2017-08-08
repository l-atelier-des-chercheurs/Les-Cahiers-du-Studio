<template>
  <div>
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

// is loaded by Media and by EditMedia

export default {
  props: {
    slugFolderName: String,
    slugMediaName: String,
    media: Object,
    size: {
      type: Number,
      default: 600
    }
  },
  data() {
    return {
    }
  },
  computed: {
    linkToMedia: function() {
      return this.slugFolderName + '/' + this.slugMediaName;
    },
    linkToThumb: function() {
      let pathToSmallestThumb = _.findWhere(this.media.thumbs, { size: this.size }).path;
      return pathToSmallestThumb !== undefined ? pathToSmallestThumb : linkToMedia();
    },
  }
}

</script>
