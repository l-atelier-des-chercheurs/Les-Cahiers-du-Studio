<template>
  <div class="mediaWrap"
    :style="getMediaPosition()"
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

      <div class="mediaScrubber">
        <!-- play media on click -->
        <template v-if="media.duration !== undefined">
          <button class="accroche accroche_gauche" @mouseup=""></button>
          <div class="accrocheDurationLine" :style="{ width: getMediaWidthFromDuration() + 'px' }"></div>
        </template>
        <button class="accroche accroche_droite" @mouseup="toggleCollapseMedia"></button>
      </div>


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
        y: this.getPosY(),
        w: 180,
        h: 120
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
      let posX = this.posX !== false ? this.posX : 0;
      return {
        transform: `translate(${posX}px, ${this.mediaStyles.y}px)`
      };
    },
    getMediaWidthFromDuration() {
      return this.media.duration/this.timelineScale;
    },
    getMediaSize() {
      if(this.media.duration !== undefined) {
        this.mediaStyles.w = Math.max(180, this.getMediaWidthFromDuration());
      } else {
        if(this.mediaStyles.ratio) {
          let r = this.mediaStyles.ratio;
          this.mediaStyles.w = this.mediaStyles.h / r;
        }
      }
      return {
        width: `${this.mediaStyles.w}px`,
        height: `${this.mediaStyles.h}px`
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
        this.mediaStyles.y = Math.max(50, Math.min(this.timelineHeight - 100, newY));
      }
    },
    mouseup() {
      console.log(`MEDIA EVENT: mouseup`);
      if(this.is_dragged) {
        let newY = this.mediaStylesOld.y + event.pageY - this.dragOffset.y;
        this.mediaStyles.y = Math.max(50, Math.min(this.timelineHeight - 100, newY));

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