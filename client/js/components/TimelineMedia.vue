<template>
  <div class="mediaWrap"
    :style="getMediaPosition(media)"
    :class="{
      'has--duration' : media.duration !== undefined,
      'is--hovered'   : is_hovered,
      'is--dragged'   : is_dragged,
      'is--collapsed' : is_collapsed
    }"
    @mousedown.prevent="mousedown"
    @mouseover="mouseover"
    @mouseleave="mouseleave"
  >
    <div class="media">
      <button class="accroche accroche_gauche" @mouseup="toggleCollapseMedia"></button>
      <button class="accroche accroche_droite" @mouseup="toggleCollapseMedia"></button>

      <div class="mediaContent"
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
      dragOffset: {
        x: '',
        y: ''
      },
      mediaStylesOld: {
        x: '',
        y: ''
      },
      mediaStyles: {
        ratio: this.media.ratio,
        y: this.getPosY()
      }
    }
  },
  computed: {
  },
  watch: {
    media: function() {
    },
    'media.collapsed': function() {
      this.is_collapsed = (this.media.collapsed == 'true');
    },
    'media.y': function() {
      this.mediaStyles.y = this.getPosY();
    },
  },
  created() {
  },
  beforeDestroy() {
    window.removeEventListener('mouseup', this.mouseup);
  },
  methods: {
    getPosY() {
      return parseFloat(this.media.y) * this.timelineHeight;
    },
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
      console.log(`MEDIA EVENT: mousedown`);

      window.addEventListener('mousemove', this.mousemove);
      window.addEventListener('mouseup', this.mouseup);
    },
    mousemove() {
      console.log(`MEDIA EVENT: mousemove`);
      if(!this.is_dragged) {
        this.is_dragged = true;

        this.dragOffset.y = event.pageY;
        this.mediaStylesOld.y = this.mediaStyles.y;

      } else {
        let newY = this.mediaStylesOld.y + event.pageY - this.dragOffset.y;
        this.mediaStyles.y = Math.max(70, Math.min(this.timelineHeight - 100, newY));
      }
    },
    mouseup() {
      console.log(`MEDIA EVENT: mouseup`);
      if(this.is_dragged) {
        this.mediaStyles.y = this.mediaStylesOld.y + event.pageY - this.dragOffset.y;

        let getHeightInPercent = this.mediaStyles.y / this.timelineHeight;
        let values = { y: getHeightInPercent };
        values.slugFolderName = this.slugFolderName;
        values.slugMediaName = this.slugMediaName;

        // if it's all good, collect everything and send over socketio
        this.$root.editMedia(values);

        this.is_dragged = false;
      }

      event.stopPropagation();

      window.removeEventListener('mousemove', this.mousemove);
      window.removeEventListener('mouseup', this.mouseup);

      return false;
    },

    mouseover() {
      this.is_hovered = true;

    },
    mouseleave() {
      this.is_hovered = false;
    },

    toggleCollapseMedia() {
      if(this.is_dragged) {
        return;
      }

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