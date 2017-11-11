<template>
  <div class="mediaPreview font-small"
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
<!--
-->
    <div class="media">

      <div class="mediaScrubber"
        :style="getMediaWidthFromDuration()"
        >
        <!-- play media on click -->
        <template
          v-if="media.duration !== undefined"
          >
          <button class="accroche accroche_gauche"></button>
          <div class="accrocheDurationLine"></div>
        </template>
        <button class="accroche accroche_droite" @mouseup="toggleCollapseMedia"></button>
      </div>

      <transition name="fade">
        <div
          class="timelineMediaContent"
          v-if="!isPlaceholder"
          :style="getMediaSize()"
          >
          <MediaContent
            :slugFolderName="slugFolderName"
            :slugMediaName="slugMediaName"
            :media="media"
            v-model="media.content"
            :isPreview="true"
            >
          </MediaContent>

          <div
            class="mediaContour">
          </div>

          <button
            class="button-round bg-transparent button_openmedia padding-medium"
            v-if="!isPlaceholder"
            @mousedown.stop="$emit('open')">
            <svg xmlns="http://www.w3.org/2000/svg" width="46.99" height="46.99" viewBox="0 0 46.99 46.99">
              <g id="Calque_2" data-name="Calque 2">
                <g id="Content">
                  <g>
                    <circle cx="23.5" cy="23.5" r="23" style="fill: #fff"/>
                    <circle cx="23.5" cy="23.5" r="23" style="fill: none;stroke: #4d4d4d;stroke-miterlimit: 10"/>
                  </g>
                  <polyline points="33.33 23.74 33.33 33.96 23.11 33.96 12.88 33.96 12.88 23.74 12.88 13.52 23.11 13.52" style="fill: none;stroke: #333;stroke-miterlimit: 10"/>
                  <polyline points="26.73 13.52 33.33 13.52 33.33 20.12" style="fill: none;stroke: #333;stroke-miterlimit: 10"/>
                  <line x1="33.05" y1="13.89" x2="22.1" y2="24.83" style="fill: none;stroke: #333;stroke-miterlimit: 10"/>
                </g>
              </g>
            </svg>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import MediaContent from './subcomponents/MediaContent.vue';

export default {
  props: ['slugFolderName', 'slugMediaName', 'media', 'timelineScale', 'posX', 'timelineHeight', 'isPlaceholder'],
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
        ratio: parseFloat(this.media.ratio),
        y: this.limitMediaYPos(parseFloat(this.media.y) * this.timelineHeight),
        w: 180,
        h: 180,
        mediaWidthFromDuration: 0
      },
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
  mounted() {
    this.setMediaSize();
    this.setMediaWidthFromDuration();
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
      console.log('METHODS • timelineview: getMediaPosition');
      let posX = this.posX !== false ? this.posX : 0;
      return {
        transform: `translate(${posX}px, ${this.mediaStyles.y}px)`
      };
    },
    setMediaWidthFromDuration() {
      console.log('METHODS • timelineview: setMediaWidthFromDuration');
      this.mediaWidthFromDuration = Math.round(this.media.duration/this.timelineScale);
    },
    getMediaWidthFromDuration() {
      return {
        width: `${this.mediaWidthFromDuration}px`
      };
    },

    // set width and height for a media.
    // this shouldn’t need updating
    setMediaSize() {
      console.log('METHODS • timelineview: setMediaSize');

      // let’s set some ratio
      if(this.mediaStyles.ratio) {
        let r = this.mediaStyles.ratio;
        if(r < 1) {
          this.mediaStyles.h = this.mediaStyles.w * r;
        } else {
          this.mediaStyles.w = this.mediaStyles.h / r;
        }
      }

      // if there’s some ratio
      if(this.media.duration > 0) {
        if(this.media.type === 'audio') {
          this.mediaStyles.h = 32;
        }
        if(this.mediaWidthFromDuration > this.mediaStyles.w) {
          this.mediaStyles.w = this.mediaWidthFromDuration;
        }
      }
    },
    getMediaSize() {
      return {
        width: `${this.mediaStyles.w}px`,
        height: `${this.mediaStyles.h}px`
      }
    },
    mousedown() {
      console.log('METHODS • TimelineMedia: mousedown');
      console.log(`with is_dragged = ${this.is_dragged}`);
      window.addEventListener('mousemove', this.mousemove);
      window.addEventListener('mouseup', this.mouseup);
    },
    mousemove() {
      console.log('METHODS • TimelineMedia: mousemove');
      console.log(`with is_dragged = ${this.is_dragged}`);
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
      console.log(`METHODS • TimelineMedia: mouseup`);
      console.log(`with is_dragged = ${this.is_dragged}`);
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
      console.log('METHODS • TimelineMedia: mouseover');
      this.is_hovered = true;
    },
    mouseleave() {
      console.log('METHODS • TimelineMedia: mouseleave');
      this.is_hovered = false;
    },
    toggleCollapseMedia() {
      console.log('METHODS • TimelineMedia: toggleCollapseMedia');
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