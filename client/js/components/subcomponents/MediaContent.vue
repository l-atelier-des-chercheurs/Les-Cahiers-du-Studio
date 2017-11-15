<template>
  <div :class="`mediaContainer flex-wrap flex-vertically-centered type-${media.type}`">
    <template v-if="media.type === 'image'">
      <img :src="linkToThumb">
    </template>
    <template v-else-if="media.type === 'video'">
      <template v-if="isInTimeline">
        <img :src="linkToVideoThumb">
      </template>
      <template v-else>
        <video controls :src="mediaURL">
        </video>
      </template>
    </template>
    <template v-else-if="media.type === 'audio'">
      <audio :controls="isInTimeline" :src="mediaURL">
      </audio>
    </template>
    <template v-else-if="media.type === 'text'">
      <div v-if="isInTimeline" class="padding-small">
        {{ value }}
        <template v-if="value.length === 0">
          …
        </template>
      </div>
      <textarea
        v-else
        placeholder="…"
        class="mediaTextContent border-none bg-transparent"
        :value="value"
        @input="$emit('input', $event.target.value)"
        ref="textField"
      >
      </textarea>
    </template>
    <template v-else-if="media.type === 'marker'">
      <input
        type="text"
        class="border-none bg-transparent"
        placeholder="Étiquette"
        name="label"
        :value="value"
        @input="$emit('input', $event.target.value)"
        ref="textField"
      >
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
    mediaURL: String,
    isInTimeline: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    }
  },
  mounted() {
    if(!this.isInTimeline) {
      if(Modernizr !== undefined && !Modernizr.touchevents) {
        if(this.media.type === 'text' || this.media.type === 'marker') {
          this.$refs.textField.focus();
        }
      }
    }
  },
  computed: {
    linkToThumb: function() {
      let thumbSize = this.isInTimeline ? 400: 1800;
      let pathToSmallestThumb = _.findWhere(this.media.thumbs, { size: thumbSize }).path;
      return pathToSmallestThumb !== undefined ? pathToSmallestThumb : this.mediaURL;
    },
    linkToVideoThumb: function() {
      let timeMark = 0;
      let pathToTimeMarkThumbs = _.findWhere(this.media.thumbs, { timeMark }).thumbsData;

      let thumbSize = this.isInTimeline ? 400: 1800;
      let pathToSmallestThumb = _.findWhere(pathToTimeMarkThumbs, { size: thumbSize }).path;
      return pathToSmallestThumb !== undefined ? pathToSmallestThumb : this.mediaURL;
    }

  }
}

</script>
<style scoped lang="sass">
.mediaContainer {
}

.mediaContainer img {
}

.mediaContainer {
  &.type-text {
    align-self: flex-start;
  }
  &.type-other {
    padding:10px;
    align-self: flex-start;
  }

}

</style>
