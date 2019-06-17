<template>
  <div>

    <div
      class='pinp-container'
      :class="{ 'is--showing_grid' : show_grid }"
      ref="pinp_container"
    >
      <!-- :style="`padding: ${grid_options.gutter/2}px; --gridstep: ${grid_options.columnWidth + grid_options.gutter}px`" -->
      <!-- <div class="packery-grid-sizer"></div> -->

      <!-- <div class="stamp stamp1"></div> -->
      <!-- <div class="stamp stamp2"></div> -->

      <MediaBlock2
        v-if="pinp_grid"
        v-for="media in medias" :key="media.metaFileName"
        :pinp_grid="pinp_grid"
        :media="media"
        :folder="folder"
        :slugFolderName="slugFolderName"
        :columnWidth="grid_options.columnWidth"
        :rowHeight="grid_options.rowHeight"
        :base_edge="base_edge"
        :gutter="grid_options.gutter"
        @dragStarted="showGrid"
        @dragEnded="hideGrid"
        @resizeStarted="showGrid"
        @resizeEnded="hideGrid"
        @triggerPackeryLayout="triggerPackeryLayout"
      />

        <!-- <div 
          class="packery-item" 
          v-for="media in medias" 
          :key="media.metaFileName"
          style="width: 200px; height: 200px; background-color: rgb(0,179,149)"        
        /> -->

    </div>
    
  </div>
</template>
<script>
import MediaBlock2 from './subcomponents/MediaBlock2.vue';
// import {packeryEvents} from 'vue-packery-plugin';
import pinp from 'pinp';

export default {
  props: {
    medias: Array,
    folder: Object,
    slugFolderName: String
  },
  components: {
    MediaBlock2
  },
  data() {
    return {
      show_grid: false,
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
        // stagger: 30
      },

      pinp_grid: undefined,
      pinp_options: {
        container: undefined,
        debug: false,
        grid: [40, 40],
        maxSolverIterations: 999, 
        noOOB: true,
        pushBehavior: 'horizontal', // 'horizontal', 'vertical' or 'both'
        updateContainerHeight: false,
        updateContainerWidth: true,
      
        willUpdate: function () {}, 
        didUpdate: function () {}        
      }
    }
  },
  
  created() {
    console.log(`MOUNTED • MediasBlock2: created`);
  },
  mounted() {
    console.log(`MOUNTED • MediasBlock2: mounted`);

    this.pinp_options.container = this.$refs.pinp_container;
    this.pinp_grid = new pinp(this.pinp_options);
    this.triggerPackeryLayout();
  },
  beforeDestroy() {
  },

  watch: {
    'medias': function() {
      this.triggerPackeryLayout();
    }
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
      if(this.pinp_grid) {
        this.pinp_grid.update();    
      }
      
      // this.$forceUpdate();
      // packeryEvents.$emit('layout', this.$refs.packery);
    },
    showGrid() {
      this.show_grid = true;
    },
    hideGrid() {
      this.show_grid = false;
    }
  }
}
</script>
<style lang="scss">
.pinp-container {
  height: 100% !important;  

  // transition: all .1s cubic-bezier(0.19, 1, 0.22, 1);

  // background-image: repeating-linear-gradient(-90deg,transparent,transparent var(--gridstep_before),var(--grid-color) var(--gridstep_before),var(--grid-color) var(--gridstep)),repeating-linear-gradient(180deg,transparent,transparent var(--gridstep_before),var(--grid-color) var(--gridstep_before),var(--grid-color) var(--gridstep));
  // background-repeat: no-repeat;
  // background-size: 100% 100%;

  // Configuration
  --gridstep: 40px;
  --gridstep_before: calc(var(--gridstep) - 1px);
  --grid-color: rgb(235, 235, 235);

  --grid-color-horizontal: var(--grid-color);
  --grid-color-vertical: transparent;

  // background-image: repeating-linear-gradient(-90deg,transparent,transparent var(--gridstep_before),var(--grid-color) var(--gridstep_before),var(--grid-color) var(--gridstep)),repeating-linear-gradient(180deg,transparent,transparent var(--gridstep_before),var(--grid-color) var(--gridstep_before),var(--grid-color) var(--gridstep));
  background-image: repeating-linear-gradient(-90deg,transparent,transparent var(--gridstep_before),var(--grid-color-vertical) var(--gridstep_before),var(--grid-color-vertical) var(--gridstep)),repeating-linear-gradient(180deg,transparent,transparent var(--gridstep_before),var(--grid-color-horizontal) var(--gridstep_before),var(--grid-color-horizontal) var(--gridstep));
  background-repeat: no-repeat;
  background-size: 100% 100%;

  &:not(.is--showing_grid) {
    // background-image: none;
  }    

  &.is--showing_grid {
    --grid-color-vertical: var(--grid-color);
  }
}


.pinp-box {
  pointer-events: auto;
}
</style>