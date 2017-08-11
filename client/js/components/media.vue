<template>
  <div class="media margin-right-small margin-bottom-small">
    <p class="margin-small">
      <small>
        {{ slugMediaName }}
      </small>
    </p>

    <div class="clearfix">
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
      showMediaModal: false
    }
  },
  computed: {
  },
  watch: {
    showMediaModal: function() {
      this.$root.has_modal_opened = this.showMediaModal;
    }
  },
  methods: {
    removeMedia() {
      if(window.confirm(locals.lang.modal.sureToRemoveMedia)) {
        this.$root.removeMedia(this.slugFolderName, this.slugMediaName);
      }
    }
  }
}
</script>
<style scoped>

.media {
  width:16em;
  float:left;
  background: white;
  border:2px solid #eee;
}

.mediaContent {
  width:100%;
  height:12em;
  background-color: #ddd;
  display: flex;
  align-items:center;
  justify-content:center;
  overflow: hidden;
}

</style>