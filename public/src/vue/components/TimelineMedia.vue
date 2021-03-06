<template>
  <div
    class="mediaPreview font-small"
    :style="{
      transform: `translate(${posX}px, ${mediaStyles.y}px`,
      '--media-color': color ? color : '#ffffff'
    }"
    :class="[{
      'has--duration' : media.duration !== undefined,
      'is--hovered'   : is_hovered,
      'is--dragged'   : is_dragged,
      'is--collapsed' : is_collapsed,
    }, 'type-' + media.type, class_from_first_author ]"
    @mousedown.prevent="mousedown"
    @mouseover="mouseover"
    @mouseleave="mouseleave"
  >
    <div class="media">
      <div class="mediaScrubber" :style="getMediaWidthFromDuration()">
        <!-- play media on click -->
        <template v-if="media.duration !== undefined">
          <button class="accroche accroche_gauche"></button>
          <div class="accrocheDurationLine"></div>
        </template>
        <button class="accroche accroche_droite" @mouseup.stop="toggleCollapseMedia"></button>
      </div>

      <div class="timelineMediaContent" :style="getMediaSize()">
        <MediaContent
          v-if="!is_placeholder"
          v-model="media.content"
          :slugFolderName="slugFolderName"
          :slugMediaName="slugMediaName"
          :media="media"
          :context="'preview'"
          :is_hovered="is_hovered"
          :read_only="read_only"
        />

        <!-- <div class="mediaContour" /> -->

        <transition
          name="slide"
          enter-active-class="slideInUp"
          leave-active-class="slideOutDown"
          :duration="350"
        >
          <button
            type="button"
            class="button_openmedia bg-noir c-blanc"
            :class="{ 'padding-verysmall button-thin' : this.media.type === 'marker' }"
            style="animation-duration: 0.3s"
            v-if="!is_placeholder && is_hovered"
            @mousedown.stop="openMedia"
          >{{ $t('open') }}</button>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>
import MediaContent from "./subcomponents/MediaContent.vue";

export default {
  props: {
    slugFolderName: String,
    slugMediaName: String,
    media: Object,
    timelineScale: Number,
    posX: {
      type: Number,
      default: 0
    },
    timelineHeight: Number,
    is_placeholder: Boolean,
    read_only: {
      type: Boolean,
      default: true
    },
    color: String
  },
  components: {
    MediaContent
  },
  data() {
    return {
      is_dragged: false,
      is_hovered: false,
      is_collapsed: this.media.collapsed == true,
      dragOffset: {
        x: "",
        y: ""
      },
      mediaStylesOld: {
        x: "",
        y: ""
      },
      mediaStyles: {
        ratio: parseFloat(this.media.ratio),
        y: this.limitMediaYPos(parseFloat(this.media.y) * this.timelineHeight),
        w: 180,
        h: 180,
        mediaWidthFromDuration: 0
      }
    };
  },
  computed: {},
  watch: {
    media: function() {},
    "media.collapsed": function() {
      this.is_collapsed = this.media.collapsed == true;
    },
    "media.y": function() {
      this.mediaStyles.y = this.limitMediaYPos(
        parseFloat(this.media.y) * this.timelineHeight
      );
    },
    timelineHeight: function() {
      this.mediaStyles.y = this.limitMediaYPos(
        parseFloat(this.media.y) * this.timelineHeight
      );
    },
    timelineScale: function() {
      this.setMediaWidthFromDuration();
      this.setMediaSize();
    }
  },
  mounted() {
    this.setMediaWidthFromDuration();
    this.setMediaSize();
  },
  beforeDestroy() {
    window.removeEventListener("mouseup", this.mouseup);
  },
  methods: {
    limitMediaYPos(yPos) {
      if (window.state.dev_mode === "debug") {
        // console.log(`METHODS • TimelineMedia: limitMediaYPos`);
      }
      if (this.media.type === "marker") {
        return 50 / 2;
      }
      return Math.max(50, Math.min(this.timelineHeight - 100, yPos));
    },
    setMediaWidthFromDuration() {
      if (window.state.dev_mode === "debug") {
        console.log("METHODS • TimelineMedia: setMediaWidthFromDuration");
      }
      this.mediaWidthFromDuration = Math.round(
        this.media.duration / this.timelineScale
      );
    },
    getMediaWidthFromDuration() {
      if (window.state.dev_mode === "debug") {
        console.log("METHODS • TimelineMedia: getMediaWidthFromDuration");
      }
      if (this.media.duration !== undefined) {
        return { width: `${this.mediaWidthFromDuration}px` };
      }
      return false;
    },

    // set width and height for a media.
    // this shouldn’t need updating
    setMediaSize() {
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • TimelineMedia: setMediaSize");
      }

      // let’s set some ratio
      if (this.mediaStyles.ratio) {
        let r = this.mediaStyles.ratio;
        if (r < 1) {
          this.mediaStyles.h = this.mediaStyles.w * r;
        } else {
          this.mediaStyles.w = this.mediaStyles.h / r;
        }
      }

      // if there’s some duration
      if (this.media.duration > 0) {
        if (this.media.type === "audio") {
          this.mediaStyles.h = 32;
        }
        // if (this.mediaWidthFromDuration > this.mediaStyles.w) {
        //   this.mediaStyles.w = this.mediaWidthFromDuration;
        // }
        // if (this.media.type === 'audio') {
        //   this.mediaStyles.h = 32;
        //   this.mediaStyles.w = this.mediaWidthFromDuration + 110 + 185;
        // }
      }
    },
    getMediaSize() {
      // if(this.$root.state.dev_mode === 'debug') { console.log('METHODS • TimelineMedia: getMediaSize'); }
      return {
        width: `${this.mediaStyles.w}px`,
        height: `${this.mediaStyles.h}px`
      };
    },
    mousedown(event) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `METHODS • TimelineMedia: mousedown with is_dragged = ${this.is_dragged}`
        );
      }
      if (!this.read_only || this.$root.state.mode === "export_web") {
        window.addEventListener("mousemove", this.mousemove);
        window.addEventListener("mouseup", this.mouseup);
      }
    },
    mousemove(event) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `METHODS • TimelineMedia: mousemove with is_dragged = ${this.is_dragged}`
        );
      }
      if (!this.is_dragged) {
        this.is_dragged = true;

        this.dragOffset.y = event.pageY;
        this.mediaStylesOld.y = this.mediaStyles.y;
      } else {
        let newY = this.mediaStylesOld.y + event.pageY - this.dragOffset.y;
        this.mediaStyles.y = this.limitMediaYPos(newY);
      }
    },
    openMedia() {
      if (this.is_dragged) {
        return;
      }
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • TimelineMedia: openMedia");
      }
      this.$emit("open");
    },
    mouseup(event) {
      if (window.state.dev_mode === "debug") {
        console.log(`METHODS • TimelineMedia: mouseup`);
        console.log(`with is_dragged = ${this.is_dragged}`);
      }
      if (this.is_dragged) {
        let newY = this.mediaStylesOld.y + event.pageY - this.dragOffset.y;
        this.mediaStyles.y = this.limitMediaYPos(newY);
        let getHeightInPercent = this.mediaStyles.y / this.timelineHeight;

        if (!this.read_only) {
          this.$root.editMedia({
            type: "folders",
            slugFolderName: this.slugFolderName,
            slugMediaName: this.slugMediaName,
            data: {
              y: getHeightInPercent
            }
          });
        }
        this.is_dragged = false;
      }

      event.stopPropagation();
      window.removeEventListener("mousemove", this.mousemove);
      window.removeEventListener("mouseup", this.mouseup);

      return false;
    },

    mouseover(event) {
      if (window.state.dev_mode === "debug") {
        console.log("METHODS • TimelineMedia: mouseover");
      }
      this.is_hovered = true;
    },
    mouseleave(event) {
      if (window.state.dev_mode === "debug") {
        console.log("METHODS • TimelineMedia: mouseleave");
      }
      this.is_hovered = false;
    },
    toggleCollapseMedia(event) {
      if (window.state.dev_mode === "debug") {
        console.log(
          "METHODS • TimelineMedia: toggleCollapseMedia with drag = " +
            this.is_dragged
        );
      }
      if (this.read_only) {
        return;
      }

      if (this.is_dragged) {
        this.mouseup(event);
        return;
      } else {
        // we need to trigger mouseup because this won’t be a drag
        this.mouseup(event);
      }
      this.is_collapsed = !this.is_collapsed;

      this.$root.editMedia({
        type: "folders",
        slugFolderName: this.slugFolderName,
        slugMediaName: this.slugMediaName,
        data: {
          collapsed: this.is_collapsed
        }
      });

      event.stopPropagation();
    }
  }
};
</script>
<style lang="sass">
</style>