<template>
  <div 
    :style="itemStyles(media.metaFileName)"
  >
    <div class="packery-item-content"
      :style="itemStyles(media.metaFileName)"
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
          <button type="button" @click="changeItemWidth(media.metaFileName, 1)">
            +
          </button>
          <button type="button" @click="changeItemWidth(media.metaFileName, -1)">
            -
          </button>
        </div>
        <div class="buttons_bottom">
          <button type="button" @click="changeItemHeight(media.metaFileName, 1)">
            +
          </button>
          <button type="button" @click="changeItemHeight(media.metaFileName, -1)">
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
      width: Math.round(Math.random() * 2),
      height: Math.round(Math.random() * 2),
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
    itemStyles(metaFileName) {
      return {
        width: this.width * this.columnWidth + (this.width-1) * this.gutter + 'px',
        height: this.height * this.rowHeight + (this.height-1) * this.gutter + 'px'
      }
    },
    changeItemWidth(metaFileName, increment) {
      this.width += increment;
      this.$nextTick(() => {
        this.$emit('triggerPackeryLayout');
      });
    },
    changeItemHeight(metaFileName, increment) {
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
  background-color: #333;
  color: white;
  font-size: .8em;

  button {
    padding: 0;
    min-height: 0;
    display: block;
    border: none;
    appearance: none;
    background-color: transparent;
  }
}

.buttons_right {
  left: 100%;
  top: 0;
  bottom: 0;
  width: 15px;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
}
.buttons_bottom {
  top: 100%;
  width: 100%;
  height: 15px;
  display: flex;
  flex-flow: row wrap;
  justify-content: stretch;
  align-items: center;

  > * {
    flex-grow: 1;
  }
}

</style>