<template>
  <Modal
    @close="$emit('close')"
    >
    <template slot="header">
      <span class="text-cap"> Flux</span>
    </template>

    <template slot="preview">
      <div v-for="media in sortedMedias" class="margin-vert-small">
        <MediaContent
          v-model="media.content"
          style="animation-duration: 0.3s"
          :slugMediaName="media.slugMediaName"
          :media="media"
          :isInTimeline=true
          >
        </MediaContent>
      </div>
    </template>
  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import MediaContent from '../subcomponents/MediaContent.vue';

export default {
  props: {
    sortedMedias: Object,
  },
  components: {
    Modal,
    MediaContent
  }
}
</script>