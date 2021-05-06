<template>
  <div>
    <div
      v-packery="grid_options"
      class="packery-container"
      :class="{ 'is--showing_grid': show_grid }"
      ref="packery"
      :style="`padding: ${grid_options.gutter / 2}px; --gridstep: ${
        grid_options.columnWidth + grid_options.gutter
      }px`"
    >
      <!-- <div class="packery-grid-sizer"></div> -->

      <!-- <div class="stamp stamp1"></div> -->
      <!-- <div class="stamp stamp2"></div> -->

      <MediaBlock
        v-for="media in medias"
        :key="media.metaFileName"
        v-packery-item
        :media="media"
        :folder="folder"
        :slugFolderName="slugFolderName"
        :columnWidth="grid_options.columnWidth"
        :rowHeight="grid_options.rowHeight"
        :base_edge="base_edge"
        :gutter="grid_options.gutter"
        :can_edit="can_edit"
        @triggerPackeryLayout="triggerPackeryLayout()"
        @dragStarted="showGrid"
        @dragEnded="hideGrid"
        @resizeStarted="showGrid"
        @resizeEnded="hideGrid"
      />
    </div>
  </div>
</template>
<script>
import MediaBlock from "./subcomponents/MediaBlock.vue";
import { packeryEvents } from "vue-packery-plugin";

export default {
  props: {
    medias: Array,
    folder: Object,
    slugFolderName: String,
    can_edit: Boolean,
  },
  components: {
    MediaBlock,
  },
  data() {
    return {
      show_grid: true,
      grid_options: {
        itemSelector: ".packery-item",
        percentPosition: true,
        gutter: 4,
        columnWidth: 40,
        rowHeight: 40,
        horizontal: true,
        stamp: ".stamp",
        transitionDuration: "0s",
        // originTop: false
        // stagger: 30
      },
    };
  },
  created() {},
  mounted() {
    console.log("MOUNTED • MediasBlock");
  },
  beforeDestroy() {},
  watch: {
    medias: function () {
      this.triggerPackeryLayout();
    },
  },
  computed: {
    base_edge() {
      if (this.medias.length > 5) {
        return 2;
      }
      return 3;
    },
  },
  methods: {
    triggerPackeryLayout() {
      console.log("Triggered packery layout");
      this.$forceUpdate();
      // packeryEvents.$emit('layout', this.$refs.packery);
    },
    showGrid() {
      this.show_grid = true;
    },
    hideGrid() {
      this.show_grid = false;
    },
  },
};
</script>
<style lang="scss">
.packery-container {
  height: 100%;

  // transition: all .1s cubic-bezier(0.19, 1, 0.22, 1);

  // // Configuration
  --gridstep: 40px;
  --gridstep_before: calc(var(--gridstep) - 1px);

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
  background-image: repeating-linear-gradient(
    180deg,
    transparent,
    transparent var(--gridstep_before),
    var(--grid-color-horizontal) var(--gridstep_before),
    var(--grid-color-horizontal) var(--gridstep)
  );
  background-repeat: no-repeat;
  background-size: 100% 100%;

  &:not(.is--showing_grid) {
    // background-image: none;
  }

  &.is--showing_grid {
    --grid-color-vertical: var(--grid-color);
  }
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
