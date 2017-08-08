<template>
  <div class="media width-25 padding-small float-left">
    <p>
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

    <MediaContent
      :slugFolderName="slugFolderName"
      :slugMediaName="index"
      :media="media"
    >
    </MediaContent>

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
<style>
.media {
  border:1px solid #eee;
  background: white;
}

</style>