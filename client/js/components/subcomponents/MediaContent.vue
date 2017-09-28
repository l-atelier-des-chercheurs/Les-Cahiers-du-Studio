<template>
  <div :class="'mediaContainer type-' + media.type">
    <template v-if="media.type === 'image'">
      <img :src="linkToThumb">
    </template>
    <template v-else-if="media.type === 'video'">
      <video :controls="withControl" :src="linkToMedia">
      </video>
    </template>
    <template v-else-if="media.type === 'audio'">
      <audio :controls="withControl" :src="linkToMedia">
      </audio>
    </template>
    <template v-else-if="media.type === 'text'">
      <textarea
        placeholder="Champ de texte…"
        class="mediaTextContent"
        :value="value"
        @input="$emit('input', $event.target.value)"
      >
      </textarea>
    </template>
    <template v-else-if="media.type === 'marker'">
      <input
        type="text"
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
    withControl: {
      type: Boolean,
      default: false,
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
