<template>
  <div class="mediaWrap"
    :style="getMediaPosition(media)">
    <div class="media"
      :class="{
        'has--duration' : media.duration !== undefined,
        'is--hovered'   : is_hovered,
        'is--dragged'   : is_dragged,
        'is--collapsed' : is_collapsed
      }"
    >
      <button class="accroche accroche_gauche" @click="toggleCollapseMedia"></button>
      <button class="accroche accroche_droite" @click="toggleCollapseMedia"></button>

      <div class="mediaContent"
        @mousedown="mousedown"
        @mousemove="mousemove"
        @mouseup="mouseup"
        @mouseover="mouseover"
        @mouseleave="mouseleave"
        :style="getMediaSize(media)"
      >
        <MediaContent
          :slugFolderName="slugFolderName"
          :slugMediaName="slugMediaName"
          :media="media"
        >
        </MediaContent>
        <button class="button button_small button_openmedia"  @mousedown.stop="$emit('open')">
          Ouvrir
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import MediaContent from './subcomponents/MediaContent.vue';

export default {
  props: ['slugFolderName', 'slugMediaName', 'media', 'timelineScale', 'posX', 'timelineHeight'],
  components: {
    MediaContent
  },
  data() {
    return {
      is_dragged: false,
      is_hovered: false,
      is_collapsed: (this.media.collapsed == 'true'),
      initialMousePos: {
        x: '',
        y: ''
      },
      mediaStyles: {
        ratio: this.media.ratio,
        y: 150
      }
    }
  },
  computed: {
  },
  watch: {
    media: function() {
    },
    'media.collapsed': function() {
      debugger;
      this.is_collapsed = (this.media.collapsed == 'true');
    },
  },
  methods: {
    getMediaPosition() {
      return {
        transform: `translate(${this.posX}px, ${this.mediaStyles.y}px)`
      };
    },
    getMediaSize() {
      let defWidth = 180;
      let defHeight = 120;

      if(this.media.type === 'video') {
        defWidth = Math.max(120, this.media.duration / this.timelineScale);
        return {
          width:  `${defWidth}px`,
          height: `${defHeight}px`
        }
      }

      if(!this.mediaStyles.ratio) {
        return {
          width:  `${defWidth}px`,
          height: `${defHeight}px`
        }
      }

      let r = this.mediaStyles.ratio;
      let w = defWidth;
      let h = w * r;

      return {
        width: `${w}px`,
        height: `${h}px`
      }
    },
    mousedown() {
      console.log('mousedown');
      this.mediaStyles.y += 50;
      this.mediaStyles.y = this.mediaStyles.y%(this.timelineHeight - 70);
/*
      this.is_dragged = true;
      this.initialMousePos.y = event.pageY;
*/
    },
    mousemove() {
      console.log('mousemove');
/*
      if(this.is_dragged) {
        this.mediaStyles.y += event.pageY - this.initialMousePos.y;
      }
*/
    },
    mouseup() {
      // see created
//       this.is_dragged = false;
    },

    mouseover() {
      this.is_hovered = true;
    },
    mouseleave() {
      this.is_hovered = false;
    },

    toggleCollapseMedia() {
      this.is_collapsed = !this.is_collapsed;

      // copy all values
      let values = { collapsed: this.is_collapsed };
      values.slugFolderName = this.slugFolderName;
      values.slugMediaName = this.slugMediaName;

      // if it's all good, collect everything and send over socketio
      this.$root.editMedia(values);

    }
  }
}
</script>
<style scoped lang="sass">
</style>