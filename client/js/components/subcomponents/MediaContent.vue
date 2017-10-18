<template>
  <div :class="'mediaContainer flex-wrap flex-vertically-centered type-' + media.type">
    <template v-if="media.type === 'image'">
      <img :src="linkToThumb">
    </template>
    <template v-else-if="media.type === 'video'">
      <video :controls="withControl" :src="mediaURL">
      </video>
    </template>
    <template v-else-if="media.type === 'audio'">
      <audio :controls="withControl" :src="mediaURL">
      </audio>
    </template>
    <template v-else-if="media.type === 'text'">
      <textarea
        placeholder="…"
        class="mediaTextContent border-none bg-transparent"
        :value="value"
        @input="$emit('input', $event.target.value)"
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
    withControl: {
      type: Boolean,
      default: true,
    },
    size: {
      type: Number,
      default: 200
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
  computed: {
    linkToThumb: function() {
      let pathToSmallestThumb = _.findWhere(this.media.thumbs, { size: this.size }).path;
      return pathToSmallestThumb !== undefined ? pathToSmallestThumb : this.mediaURL;
    },
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
