<template>
  <div class="media" :style="getMediaSize(media)">

    <div class="buttons clearfix">
      <button type="button" class="button-small margin-small float-left" @click="showMediaModal = true">
        Edit Media
      </button>
      <button type="button" class="button-small margin-small float-left" @click="removeMedia()">
        Remove Media
      </button>
    </div>

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
      if(!this.mediaStyles.ratio) {
        return {
          width:  `18vh`,
          height: `12vh`
        }
      }
      let r = this.mediaStyles.ratio;
      let w = 18;
      let h = w * r;
      return {
        width: `${w}vh`,
        height: `${h}vh`
      }
    }
  }
}
</script>
<style scoped>
.media {
  position: relative;
  width:16em;
}

.mediaContent {
  width:100%;
  height:100%;
  background-color: #ddd;
  display: flex;
  align-items:center;
  justify-content:center;
  overflow: hidden;
}

.buttons {
  position: absolute;
  right: 0;

}

</style>