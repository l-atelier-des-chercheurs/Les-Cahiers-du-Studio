<template>
  <Modal @close="$emit('close')" :typeOfModal="'LargeAndScroll'">
    <template slot="header">
      <span class="text-cap"> Flux</span>
    </template>

    <template slot="preview">
      <Tableau
        :display="'mediasList'"
        :sort="sort"
        :sortedMedias="sortedMedias"
        :timeline_start="timeline_start"
        :timeline_end="timeline_end"
        :slugFolderName="slugFolderName"
        @setSort="$emit('setSort')"
      >
      </Tableau>
    </template>
  </Modal>
</template>
<script>
import Tableau from "../sidebar/Tableau.vue";

export default {
  props: {
    sort: Object,
    sortedMedias: Array,
    timeline_start: Number,
    timeline_end: Number,
    slugFolderName: String,
  },
  components: {
    Tableau,
  },
};
</script>
