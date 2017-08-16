<template>
  <div class="media" :style="getMediaSize(media)">


<!--
    <div class="buttons clearfix">
      <button type="button" class="button_small" @click="showMediaModal = true">
        Edit
      </button>
      <button type="button" class="button_small" @click="removeMedia()">
        Remove
      </button>
    </div>
-->

    <EditMedia
      v-if="showMediaModal"
      :slugFolderName="slugFolderName"
      :slugMediaName="slugMediaName"
      :media="media"
      @close="showMediaModal = false"
    >
    </EditMedia>

    <div class="mediaContent">
      <MediaContent
        :slugFolderName="slugFolderName"
        :slugMediaName="slugMediaName"
        :media="media"
      >
      </MediaContent>
    </div>

  </div>
</template>
<script>
import EditMedia from './modals/EditMedia.vue';
import MediaContent from './subcomponents/MediaContent.vue';

export default {
  props: ['slugFolderName', 'slugMediaName', 'media'],
  components: {
    EditMedia,
    MediaContent
  },
  data() {
    return {
      showMediaModal: false,
      mediaStyles: {
        ratio: this.media.ratio,
      }
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    removeMedia() {
      if(window.confirm(locals.lang.modal.sureToRemoveMedia)) {
        this.$root.removeMedia(this.slugFolderName, this.slugMediaName);
      }
    },
    getMediaSize(media) {
      let defWidth = 180;
      let defHeight = 120;

      if(!this.mediaStyles.ratio) {
        return {
          width:  `${defWidth}px`,
          height: `${defHeight}px`
        }
      }
      let r = this.mediaStyles.ratio;
      let w = defWidth;
      let h = w * r;
      return {
        width: `${w}px`,
        height: `${h}px`
      }
    }
  }
}
</script>
<style scoped lang="sass">
</style>