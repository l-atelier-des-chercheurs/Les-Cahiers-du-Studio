<template>
  <div :class="'mediaContainer type-' + media.type ">
    <template v-if="media.type === 'image'">
      <img :src="linkToThumb">
    </template>
    <template v-else-if="media.type === 'video'">
      <video controls :src="linkToMedia">
      </video>
    </template>
    <template v-else-if="media.type === 'text'">
      <textarea placeholder="Texte à remplir ici.">
        {{ textMediaContent }}
      </textarea>
    </template>
    <template v-else-if="media.type === 'other'">
      {{ this.slugMediaName }}
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
      default: 200
    }
  },
  data() {
    return {
    }
  },
  computed: {
    textMediaContent: function() {
      return this.media.content;
    },
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

.mediaContainer.type-other {
  padding:10px;
  align-self: flex-start;
}

</style>
