<template>
  <div 
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
      width: Math.round(Math.random() * 2 + 1),
      height: Math.round(Math.random() * 2 + 1),
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