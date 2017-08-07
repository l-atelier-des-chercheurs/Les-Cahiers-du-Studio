<template>
  <div class="media width-25 padding-small float-left">
    <p>
      <small>
        {{ slugMediaName }}
      </small>
    </p>

    <button type="button" class="button" @click="showMediaModal = true">
      Edit Media
    </button>

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
import MediaContent from './MediaContent.vue';

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
  }
}
</script>
<style>
.media {
  border:1px solid #eee;
  background: white;
}

</style>