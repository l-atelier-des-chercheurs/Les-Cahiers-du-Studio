<template>
  <div
    :class="`mediaContainer flex-wrap flex-vertically-centered type-${media.type}`">

    <template v-if="media.type === 'image'">
      <img :src="linkToThumb">
    </template>

    <template v-else-if="media.type === 'video'">
      <template v-if="this.context === 'preview'">
        <img :src="linkToVideoThumb">
      </template>
      <template v-else>
        <video controls :src="mediaURL" :poster="linkToVideoThumb">
        </video>
      </template>
    </template>

    <template v-else-if="media.type === 'audio'">
      <audio controls :src="mediaURL">
      </audio>
    </template>

    <template v-else-if="media.type === 'text'">
      <div v-if="this.context !== 'edit'" class="padding-small">
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
        autocorrect="on"
      >
      </textarea>
    </template>

    <template v-else-if="media.type === 'marker'">
      <div v-if="this.context !== 'edit'" class="padding-small">
        {{ value }}
        <template v-if="value.length === 0">
          …
        </template>
      </div>
      <input
        v-else
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
    slugMediaName: String,
    slugFolderName: String,
    media: Object,
    context: {
      type: String,
      default: 'preview'
      // preview, edit, ou autre (hi-res, pas de input text)
    },
    value: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      defaultRes: 1200,
      mediaURL: `/${this.slugFolderName}/${this.slugMediaName}`
    }
  },
  mounted() {
    if(!this.context === 'edit') {
      if(Modernizr !== undefined && !Modernizr.touchevents) {
        if(this.media.type === 'text' || this.media.type === 'marker') {
          this.$refs.textField.focus();
        }
      }
    }
  },
  computed: {
    linkToThumb: function() {
      let thumbSize = this.context === 'preview' ? 400 : this.defaultRes;
      let pathToSmallestThumb = _.findWhere(this.media.thumbs, { size: thumbSize }).path;
      return pathToSmallestThumb !== undefined ? pathToSmallestThumb : this.mediaURL;
    },
    linkToVideoThumb: function() {
      let timeMark = 0;
      let pathToTimeMarkThumbs = _.findWhere(this.media.thumbs, { timeMark }).thumbsData;

      let thumbSize = this.context === 'preview' ? 400 : this.defaultRes;
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
