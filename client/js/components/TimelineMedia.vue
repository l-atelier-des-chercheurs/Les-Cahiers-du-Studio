<template>
  <div class="mediaPreview"
    :style="getMediaPosition()"
    :class="[{
      'has--duration' : media.duration !== undefined,
      'is--hovered'   : is_hovered,
      'is--dragged'   : is_dragged,
      'is--collapsed' : is_collapsed,
    }, 'type-' + media.type, 'color-' + media.color]"
    @mousedown.prevent="mousedown"
    @mouseover="mouseover"
    @mouseleave="mouseleave"
  >
    <div class="media"
    >

      <div class="mediaScrubber"
        :style="{ width: getMediaWidthFromDuration() + 'px' }"
        :data-mediaduration="media.duration"
      >
        <!-- play media on click -->
        <template v-if="media.duration !== undefined">
          <button class="accroche accroche_gauche" @mouseup=""></button>
          <div class="accrocheDurationLine"></div>
        </template>
        <button class="accroche accroche_droite" @mouseup="clickAccrocheDroite"></button>
      </div>


      <div class="timelineMediaContent"
        :style="getMediaSize()"
      >
        <MediaContent
          :slugFolderName="slugFolderName"
          :slugMediaName="slugMediaName"
          :media="media"
          v-model="media.content"
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
        defaultWidth: 180,
        defaultHeight: 180,
        ratio: this.media.ratio,
        y: this.limitMediaYPos(parseFloat(this.media.y) * this.timelineHeight),
        w: 180,
        h: 180
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
      this.mediaStyles.y = this.limitMediaYPos(parseFloat(this.media.y) * this.timelineHeight);
    },
  },
  created() {
  },
  beforeDestroy() {
    window.removeEventListener('mouseup', this.mouseup);
  },
  methods: {
    limitMediaYPos(yPos) {
      if(this.media.type === 'marker') {
        return 50/2;
      }
      return Math.max(50, Math.min(this.timelineHeight - 100, yPos));
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
      if(this.mediaStyles.ratio) {
        let r = this.mediaStyles.ratio;
        this.mediaStyles.w = this.mediaStyles.h / r;
      }

      if(this.media.duration > 0) {
        if(this.media.type === 'audio') {
          this.mediaStyles.h = 32;
        }
        if(this.getMediaWidthFromDuration() > this.mediaStyles.defaultWidth) {
          this.mediaStyles.w = this.getMediaWidthFromDuration();
        } else {
          this.mediaStyles.w = this.mediaStyles.defaultWidth;
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
        this.mediaStyles.y = this.limitMediaYPos(newY);
      }
    },
    mouseup() {
      console.log(`MEDIA EVENT: mouseup`);
      if(this.is_dragged) {
        let newY = this.mediaStylesOld.y + event.pageY - this.dragOffset.y;
        this.mediaStyles.y = this.limitMediaYPos(newY);

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

    clickAccrocheDroite() {
/*
      if(this.media.type === 'marker') {
        this.$emit('open');
        return;
      }
*/
      this.toggleCollapseMedia();
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
<style lang="sass">
</style>