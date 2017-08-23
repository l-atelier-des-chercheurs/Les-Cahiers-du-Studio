<template>
  <div class="mediaWrap"
    :style="getMediaPosition(media)">
    <div class="media"
      :style="getMediaSize(media)"
      :class="{ 'has--duration' : media.duration !== undefined, 'is--hovered' : is_hovered, 'is--dragged' : is_dragged }"
      @mousedown="mousedown"
      @mousemove="mousemove"
      @mouseup="mouseup"
      @mouseover="mouseover"
      @mouseleave="mouseleave"
    >
      <div class="mediaContent">
        <MediaContent
          :slugFolderName="slugFolderName"
          :slugMediaName="slugMediaName"
          :media="media"
        >
        </MediaContent>
      </div>
      <button class="button button_small button_openmedia"  @mousedown.stop="$emit('open')">
        Ouvrir
      </button>
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
      initialMousePos: {
        x: '',
        y: ''
      },
      mediaStyles: {
        ratio: this.media.ratio,
        y: Math.random() * this.timelineHeight + 70
      }
    }
  },
  computed: {
  },
  watch: {
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
      debugger;
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
      console.log('mouseover');
      this.is_hovered = true;
    },
    mouseleave() {
      console.log('mouseleave');
      this.is_hovered = false;
    }
  }
}
</script>
<style scoped lang="sass">
</style>