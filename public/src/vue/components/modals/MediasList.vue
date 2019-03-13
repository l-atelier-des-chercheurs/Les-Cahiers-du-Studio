<template>
  <Modal
    @close="$emit('close')"
    :typeOfModal="'LargeAndScroll'"
    >
    <template slot="header">
      <span class="text-cap"> Flux</span>
    </template>

    <template slot="preview">
      <Tableau
        :display="'mediasList'"
        :filter="filter"
        :sort="sort"
        :sortedMedias="sortedMedias"
        :timeline_start="timeline_start"
        :timeline_end="timeline_end"
        :slugFolderName="slugFolderName"
        @setSort="$emit('setSort')"
        @setFilter="$emit('setFilter')"
        >
      </Tableau>
    </template>
  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import Tableau from '../sidebar/Tableau.vue';

export default {
  props: {
    filter: String,
    sort: Object,
    sortedMedias: Array,
    timeline_start: Number,
    timeline_end: Number,
    slugFolderName: String
  },
  components: {
    Modal,
    Tableau
  }
};
</script>