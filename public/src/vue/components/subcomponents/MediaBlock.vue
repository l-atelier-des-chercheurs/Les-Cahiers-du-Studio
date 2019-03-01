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

      <div class="author_indicator"
        :style="`background-color: ${mediaColorFromFirstAuthor}`"
      />
    
      <MediaContent
        v-model="media.content"
        :slugFolderName="slugFolderName"
        :slugMediaName="media.slugMediaName"
        :media="media"
        :context="'preview'"
        :preview_size="360"
      />

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
      width: Math.round(Math.random() * 2 + this.base_edge),
      height: Math.round(Math.random() * 2 + this.base_edge),
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
}

.packery-item-content {
  position: relative;
  width: 100%;
  height: 100%;
    border-radius: 4px;

  transition: all .4s cubic-bezier(.25,.8,.25,1);  

  &.is--hovered {
    // background-color: white;
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
    z-index: 100;
  }

  .author_indicator {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 4px;
    height: 4px;
    border-radius: 2px;
    z-index: 10;
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

.packery-drop-placeholder {
  outline: 3px dashed hsla(0, 0%, 0%, 0.2);
  outline-offset: -6px;
  -webkit-transition: -webkit-transform 0.2s;
          transition: transform 0.2s;
  z-index: -1;
}


.buttons_right, .buttons_bottom {
  position: absolute;
  color: white;
  font-size: .8em;

  button {
    background-color: #333;
    display: block;
    border: none;
    appearance: none;
    width: 15px;
    height: 15px;
    padding: 0;
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

</style>