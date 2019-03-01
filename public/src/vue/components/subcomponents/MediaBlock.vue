<template>
    <!-- v-if="media.type === 'marker'" -->
  <div 
    class="packery-item"
    :style="itemSize"
  >
    <div class="packery-item-content"
      :class="{ 'is--hovered' : is_hovered }"
      :style="itemStylesWithSize"
      @mouseenter="is_hovered = true"
      @mouseleave="is_hovered = false"
    >

      <MediaContent
        v-model="media.content"
        :slugFolderName="slugFolderName"
        :slugMediaName="media.slugMediaName"
        :media="media"
        :context="'preview'"
        :preview_size="360"
      />

      <div class="author_indicator"
        :style="`background-color: ${mediaColorFromFirstAuthor}`"
      />

      <div class="draggabilly_handle" data-draggabilly_handle>
      </div>

      <template v-if="is_hovered">
        <div class="buttons_right">
          <button type="button" @click="changeItemWidth(1)">
            +
          </button>
          <button type="button" @click="changeItemWidth(-1)">
            -
          </button>
        </div>
        <div class="buttons_bottom">
          <button type="button" @click="changeItemHeight(1)">
            +
          </button>
          <button type="button" @click="changeItemHeight(-1)">
            -
          </button>
        </div>
      </template>

      <!-- <div class="handle handle_resizeMedia"
        @mousedown.stop.prevent="resizeMedia('mouse', 'bottomright')"
        @touchstart.stop.prevent="resizeMedia('touch', 'bottomright')"
      >
        <svg version="1.1"
          xmlns="http://www.w3.org/2000/svg" 
          xmlns:xlink="http://www.w3.org/1999/xlink" 
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px" y="0px" width="77.5px" height="77.5px" viewBox="0 0 77.5 77.5" style="enable-background:new 0 0 77.5 77.5;"
          xml:space="preserve">
        <defs>
        </defs>
        <g>
          <path d="M42.5,0l0.4,12.6l-9.3,0.1c-2.8,0-5.1,0-6.9-0.2c-1.8-0.2-3.6-0.6-5.7-1.2l45.3,45.3c-0.6-2-1-3.9-1.2-5.7
            c-0.2-1.8-0.3-4-0.2-6.9v-9.4l12.6,0.4l-1.3,41.2l-41.2,1.3l-0.4-12.6l9.5,0c2.9,0,5.2,0.1,7,0.3c1.8,0.2,3.6,0.5,5.4,1.1
           L11.3,21.1c0.5,1.8,0.9,3.6,1.1,5.4c0.2,1.8,0.3,4.1,0.3,7l-0.1,9.4L0,42.5L1.3,1.3L42.5,0z"/>
        </g>
        </svg>
      </div> -->

    </div>
  </div>
</template>
<script>
import MediaContent from './MediaContent.vue';
import { setTimeout } from 'timers';

export default {
  props: {
    media: Object,
    folder: Object,
    slugFolderName: String,
    base_edge: Number,
    columnWidth: Number,
    rowHeight: Number,
    gutter: Number
  },
  components: {
    MediaContent
  },
  data() {
    return {
      is_hovered: false,
      is_resized: false,
      width: Math.round(Math.random() * 2 + this.base_edge),
      height: Math.round(Math.random() * 2 + this.base_edge),
    }
  },
  
  created() {
  },
  mounted() {
    debugger;
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
    itemSize() {
      return {
        width: this.width * this.columnWidth + (this.width-1) * this.gutter + 'px',
        height: this.height * this.rowHeight + (this.height-1) * this.gutter + 'px',
      }
    },
    itemStylesWithSize() {
      return Object.assign({
        backgroundColor: this.mediaColorFromFirstAuthor
      }, this.itemSize)
    },
    mediaColorFromFirstAuthor() {
      if(!this.media.hasOwnProperty('authors')) {
        return '';
      }

      const media_authors = this.media.authors;
      if(typeof media_authors !== 'object' 
      || media_authors.length == 0
      || typeof this.folder.authors !== 'object'
      || this.folder.authors.length == 0
      ) {
        return '';
      }

      const full_authors_info = this.folder.authors.filter(a => a.name === media_authors[0].name);
      if(full_authors_info.length == 0) {
        return '';
      }

      return full_authors_info[0].color;
    },

  },
  methods: {
    changeItemWidth(increment) {
      console.log('MediaBlock changeItemWidth');
      this.width += increment;
      this.$nextTick(() => {
        this.$emit('triggerPackeryLayout');
      });
    },
    changeItemHeight(increment) {
      console.log('MediaBlock changeItemHeight');
      this.height += increment;
      this.$nextTick(() => {
        this.$emit('triggerPackeryLayout');
      });
    },

    resizeMedia(type, origin) {
      debugger;
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: resizeMedia with is_resized = ${this.is_resized}`);
      }
      if (!this.read_only) {
        if(type === 'mouse') {
          window.addEventListener('mousemove', this.resizeMove);
          window.addEventListener('mouseup', this.resizeUp);
        } else if(type === 'touch') {
          window.addEventListener('touchmove', this.resizeMove);
          window.addEventListener('touchend', this.resizeUp);
        }
      }
    },
    resizeMove(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: resizeMove with is_resized = ${this.is_resized}`);
      }

      const pageX = event.pageX ? event.pageX : event.touches[0].pageX;
      const pageY = event.pageY ? event.pageY : event.touches[0].pageY;

      const pageX_mm = pageX / this.pixelsPerMillimeters;
      const pageY_mm = pageY / this.pixelsPerMillimeters;

      if (!this.is_resized) {
        this.is_resized = true;
        this.is_selected = true;
        this.resizeOffset.x = pageX_mm;
        this.resizeOffset.y = pageY_mm;
        this.mediaSize.pwidth = Number.parseInt(this.mediaSize.width);
        this.mediaSize.pheight = Number.parseInt(this.mediaSize.height);
      } else {
        const deltaX = (pageX_mm - this.resizeOffset.x) / this.$root.settings.publi_zoom;
        let newWidth = this.mediaSize.pwidth + deltaX;
        this.mediaSize.width = this.limitMediaWidth(newWidth);

        const deltaY = (pageY_mm - this.resizeOffset.y) / this.$root.settings.publi_zoom;
        let newHeight = this.mediaSize.pheight + deltaY;
        this.mediaSize.height = this.limitMediaHeight(newHeight);
      }
    },
    resizeUp(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: resizeUp with is_resized = ${this.is_resized}`);
      }
      if (this.is_resized) {
        this.mediaSize.width = this.roundMediaVal(this.mediaSize.width);
        this.mediaSize.height = this.roundMediaVal(this.mediaSize.height);

        this.updateMediaPubliMeta({ 
          width: this.mediaSize.width,
          height: this.mediaSize.height 
        });
        this.is_resized = false;
      }

      event.stopPropagation();
      window.removeEventListener('mousemove', this.resizeMove);
      window.removeEventListener('mouseup', this.resizeUp);
      window.removeEventListener('touchmove', this.resizeMove);
      window.removeEventListener('touchend', this.resizeUp);

      return false;
    },

  }
}
</script>
<style lang="scss">
.packery-item, .packery-item-content {
  cursor: -webkit-grabbing;
  cursor: -moz-grabbing;
}
.packery-item {
  /* padding: 1rem; */
  /* border: 0.2rem dashed #f4be41; */
  box-sizing: border-box;
  padding: 5px;

  &.is-dragging, &.is-positioning-post-drag {
    z-index: 2;

    .packery-item-content {
      box-shadow: none !important;
      // transform: translateY(0px);
      transition: none;  
    }
  }
}

.packery-item-content {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background-color: white;

  transition: all .2s cubic-bezier(.25,.8,.25,1);  

  &.is--hovered {
    // background-color: white;
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 46px rgba(0,0,0,0.23);
  }

  .author_indicator {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 6px;
    height: 6px;
    border-radius: 2px;
  }

  .mediaContainer {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    border-radius: 4px;
    overflow: hidden;

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

.draggabilly_handle {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;left: 0;
  // z-index: 1;
}

.packery-drop-placeholder {
  background-color: rgba(0,0,0,.3);
  filter: blur(10px);
  -webkit-transition: -webkit-transform 0.2s;
          transition: transform 0.2s;
  z-index: 0;
}


.buttons_right, .buttons_bottom {
  position: absolute;
  color: white;
  font-size: .8em;
  line-height: 1;
  font-weight: bold;

  button {
    background-color: #333;
    display: block;
    border: none;
    appearance: none;
    width: 15px;
    height: 15px;
    padding: 0;
    margin: 4px;
    min-height: 0;
  }
}

.buttons_right {
  // left: 100%;
  right: 0;
  top: 0;
  bottom: 0;
  width: 15px;
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
}
.buttons_bottom {
  // top: 100%;
  bottom: 0;
  width: 100%;
  height: 15px;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;

  > * {
  }
}

// .handle {
//   position: absolute;
//   z-index: 1;
//   width: 30px;
//   height: 30px;
//   bottom: 0;
//   right: 0;
//   cursor: nwse-resize;

//   pointer-events: auto;

//   border-style: inherit;
//   border-width: 0px;

//   border-radius: 50%;
  
//   display: flex;
//   justify-content: center;
//   align-items: center;

//   svg {
//     width: 34px;
//     height: 34px;
//     padding: 6px;
//     border-style: inherit;
//     border-radius: 50%;
//     overflow: visible;    
//   }
// }

</style>