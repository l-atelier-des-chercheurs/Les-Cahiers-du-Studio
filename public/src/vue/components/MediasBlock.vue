<template>
  <div>

    <div v-packery="grid_options" 
      class='packery-container'
      ref="packery"
      :style="`padding: ${grid_options.gutter/2}px`"
    >
      <!-- <div class="packery-grid-sizer"></div> -->

      <!-- <div class="stamp stamp1"></div> -->
      <!-- <div class="stamp stamp2"></div> -->

      <MediaBlock
        v-for="media in medias" :key="media.metaFileName" v-packery-item 
        :media="media"
        :folder="folder"
        :slugFolderName="slugFolderName"
        :columnWidth="grid_options.columnWidth"
        :rowHeight="grid_options.rowHeight"
        :base_edge="base_edge"
        :gutter="grid_options.gutter"
        @triggerPackeryLayout="triggerPackeryLayout()"
      />

    </div>
    
  </div>
</template>
<script>
import MediaBlock from './subcomponents/MediaBlock.vue';
import {packeryEvents} from 'vue-packery-plugin';

export default {
  props: {
    medias: Array,
    folder: Object,
    slugFolderName: String
  },
  components: {
    MediaBlock
  },
  data() {
    return {
      grid_options: {
        itemSelector: ".packery-item", 
        percentPosition: true,
        gutter: 4,
        columnWidth: 40,
        rowHeight: 40,
        horizontal: true,
        stamp: '.stamp',
        transitionDuration: '0.4s',
        // originTop: false
        // stagger: 10
      },
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
    base_edge() {
      if(this.medias.length > 5) {
        return 2;
      }
      return 3;
    }
  },
  methods: {
    triggerPackeryLayout() {
      console.log('Triggered packery layout');
      this.$forceUpdate();
      // packeryEvents.$emit('layout', this.$refs.packery);
    }
  }
}
</script>
<style lang="less">
.packery-container {
  height: 100vh;  
}
/* .packery-grid-sizer {
  width: 25px;
  height: 25px;
} */
// /* position stamp elements with CSS */
// .stamp {
//   position: absolute;
//   background: orange;
//   /* border: 4px dotted black; */
// }
// .stamp1 {
//   left: 0px;
//   top: 0px;
//   width: 250px;
//   height: 200px;
// }
// .stamp2 {
//   right: 10%;
//   top: 20px;
//   width: 70%;
//   height: 30px;
// }

</style>