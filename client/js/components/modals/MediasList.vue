<template>
  <Modal
    @close="$emit('close')"
    >
    <template slot="header">
      <span class="text-cap"> Flux</span>
    </template>

    <template slot="preview">
      <Tableau
        :display="'flux'"
        :filter="filter"
        :sort="sort"
        :sortedMedias="sortedMedias"
        :timelineInfos="timelineInfos"
        @setSort="$emit('setSort')"
        @setFilter="$emit('setFilter')"
        >
      </Tableau>
    </template>
  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import Tableau from '../sidebar/Tableau.vue';

import MediaContent from '../subcomponents/MediaContent.vue';

export default {
  props: {
    filter: String,
    sort: Object,
    sortedMedias: Array,
    timelineInfos: Object,
  },
  components: {
    Modal,
    Tableau
  }
}
</script>