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
        v-for="media in medias" :key="media.metaFileName" v-draggabilly v-packery-item 
        class="packery-item"
        :media="media"
        :columnWidth="grid_options.columnWidth"
        :rowHeight="grid_options.rowHeight"
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
        columnWidth: 75,
        rowHeight: 75,
        gutter: 15,
        horizontal: true,
        stamp: '.stamp',
        transitionDuration: '0.4s',
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
  },
  methods: {
    triggerPackeryLayout() {
      console.log('Triggered packery layout');
      packeryEvents.$emit('layout', this.$refs.packery);
    }
  }
}
</script>
<style lang="scss">
.packery-container {
  /* background-color: #41f4a3; */
  height: 100vh;  
}
/* .packery-grid-sizer {
  width: 25px;
  height: 25px;
} */
.packery-item, .packery-item-content {
  width:  150px;
  height: 150px;
  cursor: pointer;
}
.packery-item {
  /* padding: 1rem; */
  /* border: 0.2rem dashed #f4be41; */
  box-sizing: border-box;
}

.packery-item-content {
  position: relative;
  width: 100%;
  height: 100%;

  transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1), height 0.4s cubic-bezier(0.19, 1, 0.22, 1);  

  .mediaContainer {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    overflow: hidden;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0,0,0,.33);
    border-radius: 4px;

    img, video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
    }

    p:first-child {
      margin-top: 0;
    }
  }
}

.packery-item span{
  display: block;
  font-size: 1.4rem;
  color: #f4be41;
  margin-bottom: 1rem;
}
.packery-item input{
  color: #fff;
  font-size: 1rem;
  padding: 0.5rem;
  /* background-color: #f4be41; */
  border: none;
}
.controls {
  margin-top: 2rem;
  text-align: center;
}
.controls input {
  color: #fff;
  font-size: 1rem;
  padding: 0.5rem;
  background-color: #444;
  border: none;
  margin: 0 1rem;
}

/* position stamp elements with CSS */
.stamp {
  position: absolute;
  background: orange;
  /* border: 4px dotted black; */
}
.stamp1 {
  left: 0px;
  top: 0px;
  width: 250px;
  height: 200px;
}
.stamp2 {
  right: 10%;
  top: 20px;
  width: 70%;
  height: 30px;
}
.packery-drop-placeholder {
  outline: 3px dashed hsla(0, 0%, 0%, 0.2);
  outline-offset: -6px;
  -webkit-transition: -webkit-transform 0.2s;
          transition: transform 0.2s;
  z-index: -1;
}

</style>