<template>
  <div :class="'mediaContainer type-' + media.type ">
    <template v-if="media.type === 'image'">
      <img :src="linkToThumb">
    </template>
    <template v-else-if="media.type === 'video'">
      <video controls :src="linkToMedia">
      </video>
    </template>
    <template v-else-if="media.type === 'other'">
      <svg class="svg-icon no-preview" viewBox="0 0 20 20"><path fill="none" d="M11.469,10l7.08-7.08c0.406-0.406,0.406-1.064,0-1.469c-0.406-0.406-1.063-0.406-1.469,0L10,8.53l-7.081-7.08 c-0.406-0.406-1.064-0.406-1.469,0c-0.406,0.406-0.406,1.063,0,1.469L8.531,10L1.45,17.081c-0.406,0.406-0.406,1.064,0,1.469 c0.203,0.203,0.469,0.304,0.735,0.304c0.266,0,0.531-0.101,0.735-0.304L10,11.469l7.08,7.081c0.203,0.203,0.469,0.304,0.735,0.304 c0.267,0,0.532-0.101,0.735-0.304c0.406-0.406,0.406-1.064,0-1.469L11.469,10z"></path>
			</svg>
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
<style scoped>
.mediaContainer {
}

.mediaContainer img {
}

.svg-icon path {
  fill: white !important;
}

</style>
