<template>
  <div>
    
    <div
      class='pinp-container'
      :class="{ 'is--showing_grid' : show_grid }"
      :style="`
        padding: ${0}px; 
        --gridstep: ${grid_cell_height + 0}px;
        height: ${adjusted_timeline_height}px;  
      `"
      ref="pinp_container"
    >

      <!-- <div class="packery-grid-sizer"></div> -->

      <MediaBlock2
        v-if="pinp_grid"
        v-for="media in medias" :key="media.metaFileName"
        :pinp_grid="pinp_grid"
        :media="media"
        :folder="folder"
        :slugFolderName="slugFolderName"
        :columnWidth="grid_cell_width"
        :rowHeight="grid_cell_height"
        :base_edge="base_edge"
        :gutter="gutter"
        @dragStarted="showGrid"
        @dragEnded="hideGrid"
        @resizeStarted="showGrid"
        @resizeEnded="hideGrid"
        @triggerPinpUpdate="triggerPinpUpdate"
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
    slugFolderName: String,
    timeline_height: Number
  },
  components: {
    MediaBlock2
  },
  data() {
    return {
      show_grid: false,
      // grid_options: {
      //   itemSelector: ".packery-item", 
      //   percentPosition: true,
      //   gutter: 4,
      //   columnWidth: 40,
      //   rowHeight: 40,
      //   horizontal: true,
      //   stamp: '.stamp',
      //   transitionDuration: '0.4s',
      //   // originTop: false
      //   // stagger: 30
      // },

      number_of_rows: 18,

      pinp_grid: undefined,
      pinp_update_on_next_tick: false,
      gutter: 8
    }
  },
  
  created() {
    console.log(`MOUNTED • MediasBlock2: created`);
  },
  mounted() {
    console.log(`MOUNTED • MediasBlock2: mounted`);

    this.pinp_grid = new pinp({
        container: this.$refs.pinp_container,
        debug: false,
        grid: [
          this.grid_cell_width,
          this.grid_cell_height
        ],
        maxSolverIterations: 999, 
        noOOB: true,
        pushBehavior: 'horizontal', // 'horizontal', 'vertical' or 'both'
        updateContainerHeight: false,
        updateContainerWidth: true,
      
        willUpdate: function () {}, 
        didUpdate: function () {}        
      });
    this.triggerPinpUpdate();
  },
  beforeDestroy() {
  },

  watch: {
    'medias': function() {
      this.triggerPinpUpdate();
    },
  },
  computed: {
    base_edge() {
      if(this.medias.length > 5) {
        return 2;
      }
      return 3;
    },
    grid_cell_width() {
      return Math.floor((this.timeline_height - 25) / this.number_of_rows);
    }, 
    grid_cell_height() {
      return this.grid_cell_width;
    },
    adjusted_timeline_height() {
      return this.grid_cell_height * this.number_of_rows;
    },
    timeline_margin_top() {
      return (this.timeline_height - this.adjusted_timeline_height)/2;
    }
  },
  methods: {
    triggerPinpUpdate() {  
      if(this.pinp_grid && !this.pinp_update_on_next_tick) {
        this.pinp_update_on_next_tick = true;
        this.$nextTick(() => {
          console.log(`MOUNTED • MediasBlock2: triggerPinpUpdate`);
          this.pinp_grid.update();    
          this.pinp_update_on_next_tick = false;
        });
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
  // height: 100% !important;  
  // min-width: 44px;

  // box-sizing: content-box !important;
  // padding-right: 100px !important;  
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
  background-position: top left;

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