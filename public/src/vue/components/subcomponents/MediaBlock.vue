<template>
  <!-- v-if="media.type === 'marker'" -->
  <div class="packery-item" :style="itemSize">
    <div
      class="packery-item-content"
      :class="{ 
        'is--hovered' : is_hovered && !is_resized,
        'is--text_overflowing' : text_is_overflowing
      }"
      :style="itemStylesWithSize"
      @mouseenter="is_hovered = true"
      @mouseleave="is_hovered = false"
      :draggable="$root.settings.has_writeup_opended"
      @dragstart="startMediaDrag(media, $event)"
      @dragend="endMediaDrag()"
    >
      <MediaContent
        v-model="media.content"
        :slugFolderName="slugFolderName"
        :data-slugmedianame="media.slugMediaName"
        :media="media"
        :context="'preview'"
        :element_width_for_sizes="widthForSizes"
        ref="MediaContent"
      />

      <div class="author_indicator" v-if="mediaColorFromFirstAuthor" />

      <div class="draggabilly_handle" @click="openMedia" />

      <div
        v-if="!!media.caption"
        class="packery-item-content--caption"
        :class="{ 'is--expanded' : is_captionHovered }"
        @mouseenter="is_captionHovered = true"
        @mouseleave="is_captionHovered = false"
        @click="openMedia"
      >
        <span :style="`-webkit-line-clamp: ${mediaSize.height <= 2 ? 1 : 3 }`">{{ media.caption }}</span>
      </div>

      <!-- <template v-if="is_hovered">
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
      </template>-->

      <template v-if="is_hovered && !is_resized">
        <div class="handle handle_resizeMedia handle_resizeMedia_bottomright">
          <div
            @mousedown.stop.prevent="resizeMedia('mouse', 'horizontal_vertical')"
            @touchstart.stop.prevent="resizeMedia('touch', 'horizontal_vertical')"
          >
            <span></span>
          </div>
        </div>

        <template v-if="mediaSize.width >= 2 && mediaSize.height >= 2">
          <div class="handle handle_resizeMedia handle_resizeMedia_bottom">
            <div
              @mousedown.stop.prevent="resizeMedia('mouse', 'bottom_vertical')"
              @touchstart.stop.prevent="resizeMedia('touch', 'bottom_vertical')"
            >
              <span></span>
            </div>
          </div>

          <div class="handle handle_resizeMedia handle_resizeMedia_right">
            <div
              @mousedown.stop.prevent="resizeMedia('mouse', 'right_horizontal')"
              @touchstart.stop.prevent="resizeMedia('touch', 'right_horizontal')"
            >
              <span></span>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";
import { setTimeout } from "timers";
import Draggabilly from "draggabilly";
import { packeryEvents } from "vue-packery-plugin";

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
      is_captionHovered: false,
      mediaSize: {
        width: undefined,
        height: undefined,
        pwidth: 0,
        pheight: 0
      },

      is_resized: false,

      resizeType: undefined,
      resizeOffset: {
        x: 0,
        y: 0
      },

      is_mounted: false,
      text_is_overflowing: false
    };
  },

  created() {
    if (this.media.type === "text") {
      this.mediaSize.width = 1 + this.base_edge;
      this.mediaSize.height = 1 + this.base_edge;
    } else if (this.media.type === "marker") {
      this.mediaSize.width = 1 + this.base_edge;
      this.mediaSize.height = 1;
    } else {
      this.mediaSize.width = Math.round(Math.random() * 2 + this.base_edge);
      if (
        this.media.hasOwnProperty("ratio") &&
        typeof this.media.ratio === "number"
      ) {
        this.mediaSize.height = Math.round(
          this.mediaSize.width * this.media.ratio
        );
      } else {
        this.mediaSize.height = Math.round(Math.random() * 2 + this.base_edge);
      }
    }

    // override with actual media w and h if it exists
    this.setMediaSizeFromMeta();
  },

  mounted() {
    this.$el.draggie = new Draggabilly(this.$el, {
      handle: "[data-draggabilly_handle]"
    });
    packeryEvents.$emit("draggie", {
      draggie: this.$el.draggie,
      node: this.$el.parentNode
    });
    this.$el.draggie.on("dragStart", () => {
      this.$emit("dragStarted");
    });
    this.$el.draggie.on("dragEnd", () => {
      this.$emit("dragEnded");
    });
    this.$el.draggie.on("staticClick", () => {
      this.openMedia();
    });

    this.$nextTick(() => {
      this.is_mounted = true;
    });
  },
  beforeDestroy() {
    this.$el.draggie.destroy();
    this.$el.draggie = null;
  },
  watch: {
    mediaSize: {
      handler: function() {
        if (this.is_mounted) {
          this.$emit("triggerPackeryLayout");
        }
        this.checkTextOverflow();
      },
      deep: true
    },
    "media.content": function() {
      this.checkTextOverflow();
    },
    "media.w": function() {
      this.setMediaSizeFromMeta();
    },
    "media.h": function() {
      this.setMediaSizeFromMeta();
    }
  },
  computed: {
    itemSize() {
      return {
        width: this.mediaWidth + "px",
        height: this.mediaHeight + "px"
      };
    },
    mediaWidth() {
      return (
        this.mediaSize.width * this.columnWidth +
        (this.mediaSize.width - 1) * this.gutter
      );
    },
    mediaHeight() {
      return (
        this.mediaSize.height * this.rowHeight +
        (this.mediaSize.height - 1) * this.gutter
      );
    },
    widthForSizes() {
      // TODO
      // should check the actual width the image will be displayed at,
      // considering that the image is in an object-fit: cover configuration
      return this.mediaWidth > this.mediaHeight
        ? this.mediaWidth
        : this.mediaHeight;
    },
    itemStylesWithSize() {
      return Object.assign(
        {
          "--author-color": this.mediaColorFromFirstAuthor
            ? this.mediaColorFromFirstAuthor
            : "#fff"
        },
        this.itemSize
      );
    },
    mediaColorFromFirstAuthor() {
      return this.$root.mediaColorFromFirstAuthor(this.media, this.folder);
    }
  },
  methods: {
    checkTextOverflow() {
      if (["text", "marker"].includes(this.media.type)) {
        if (this.mediaSize.height === 1) {
          return (this.text_is_overflowing = false);
        }

        this.text_is_overflowing =
          this.mediaHeight <
          this.$refs.MediaContent.$el.children[0].scrollHeight - 10;
      }
    },
    setMediaSizeFromMeta() {
      if (this.media.hasOwnProperty("w") && typeof this.media.w === "number") {
        this.mediaSize.width = this.media.w;
      }
      if (this.media.hasOwnProperty("h") && typeof this.media.h === "number") {
        this.mediaSize.height = this.media.h;
      }
    },
    changeItemWidth(increment) {
      console.log("MediaBlock changeItemWidth");
      this.mediaSize.width += increment;
    },
    changeItemHeight(increment) {
      console.log("MediaBlock changeItemHeight");
      this.mediaSize.height += increment;
    },
    limitMediaWidth(w) {
      return Math.max(1, Math.min(12, w));
    },
    limitMediaHeight(h) {
      return Math.max(1, Math.min(12, h));
    },
    openMedia() {
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • MediaBlock: openMedia");
      }
      this.$eventHub.$emit("timeline.openMediaModal", this.media.slugMediaName);
    },
    resizeMedia(type, origin) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaBlock: resizeMedia with is_resized = ${this.is_resized}`
        );
      }
      if (!this.read_only) {
        this.resizeOrigin = origin;
        this.$emit("resizeStarted");
        if (type === "mouse") {
          window.addEventListener("mousemove", this.resizeMove);
          window.addEventListener("mouseup", this.resizeUp);
        } else if (type === "touch") {
          window.addEventListener("touchmove", this.resizeMove);
          window.addEventListener("touchend", this.resizeUp);
        }
      }
    },
    resizeMove(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaBlock: resizeMove with is_resized = ${this.is_resized}`
        );
      }

      const pageX = event.pageX ? event.pageX : event.touches[0].pageX;
      const pageY = event.pageY ? event.pageY : event.touches[0].pageY;

      if (!this.is_resized) {
        this.is_resized = true;
        this.is_selected = true;
        this.resizeOffset.x = pageX;
        this.resizeOffset.y = pageY;
        this.mediaSize.pwidth = Number.parseInt(this.mediaSize.width);
        this.mediaSize.pheight = Number.parseInt(this.mediaSize.height);
      } else {
        const deltaX = Math.round(
          (pageX - this.resizeOffset.x) / this.columnWidth
        );
        let newWidth = this.mediaSize.pwidth + deltaX;

        if (this.resizeOrigin.includes("horizontal")) {
          this.mediaSize.width = this.limitMediaWidth(newWidth);
        }

        const deltaY = Math.round(
          (pageY - this.resizeOffset.y) / this.rowHeight
        );
        let newHeight = this.mediaSize.pheight + deltaY;

        if (this.resizeOrigin.includes("vertical")) {
          this.mediaSize.height = this.limitMediaHeight(newHeight);
        }
      }
    },
    resizeUp(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaBlock: resizeUp with is_resized = ${this.is_resized}`
        );
      }
      if (this.is_resized) {
        console.log(
          `METHODS • MediaBlock: this.mediaSize.width = ${this.mediaSize.width} and this.mediaSize.height = ${this.mediaSize.height}`
        );

        // this.mediaSize.width = this.mediaSize.width;
        // this.mediaSize.height = this.mediaSize.height;

        this.$root.editMedia({
          type: "folders",
          slugFolderName: this.slugFolderName,
          slugMediaName: this.media.slugMediaName,
          data: {
            w: this.mediaSize.width,
            h: this.mediaSize.height
          }
        });

        this.is_resized = false;
        this.$emit("resizeEnded");
      }

      event.stopPropagation();
      window.removeEventListener("mousemove", this.resizeMove);
      window.removeEventListener("mouseup", this.resizeUp);
      window.removeEventListener("touchmove", this.resizeMove);
      window.removeEventListener("touchend", this.resizeUp);

      return false;
    },
    startMediaDrag(media, $event) {
      console.log(`METHODS • MediaLibrary / startMediaDrag`);

      $event.dataTransfer.setData("text/plain", JSON.stringify(media));
      $event.dataTransfer.effectAllowed = "move";

      // this.media_focus_is_dragged = true;

      this.$root.settings.media_being_dragged = media.metaFileName;
    },
    endMediaDrag() {
      console.log(`METHODS • MediaLibrary / endMediaDrag`);
      setTimeout(() => {
        // this.media_focus_is_dragged = false;
        this.$root.settings.media_being_dragged = false;
      }, 500);
    }
  }
};
</script>
<style lang="scss">
.packery-item,
.packery-item-content {
  // cursor: -webkit-grabbing;
  // cursor: -moz-grabbing;
}
.packery-item {
  /* padding: 1rem; */
  /* border: 0.2rem dashed #f4be41; */
  box-sizing: border-box;
  // padding: 5px;

  &.is-dragging,
  &.is-positioning-post-drag {
    z-index: 2;

    .packery-item-content {
      box-shadow: none !important;
      // transform: translateY(0px);
      transition: none;
    }
  }
}

.packery-item-content {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: white;
  background-color: var(--author-color);
  cursor: pointer;

  border-radius: 4px;
  border: 0px solid black;

  transition: all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);

  &.is--hovered {
    // background-color: white;
    z-index: 1;
    // transform: translateY(-8px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.19), 0 6px 26px rgba(0, 0, 0, 0.03);
  }

  &.is--text_overflowing {
    &::after {
      content: "";
      display: block;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      // background-color: var(--author-color);
      background-image: linear-gradient(
        transparent 0%,
        var(--author-color) 40%
      );
      height: 2em;
      // padding-top:.5em;
      // border-top: 1px solid black;
      margin: 0 10px;
    }
  }

  .packery-item-content--caption {
    $t-unstick_from_borders: 5px;

    position: absolute;
    top: $t-unstick_from_borders;
    left: $t-unstick_from_borders;
    right: $t-unstick_from_borders;
    max-height: calc(100% - #{$t-unstick_from_borders} * 2);
    z-index: 1;

    line-height: 1.2;
    font-size: 70%;
    // overflow: hidden;

    span {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.4);
      background-color: var(--author-color);

      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;

      display: -webkit-inline-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;

      padding: 2px;
      border-radius: 2px;
    }

    &.is--expanded {
      span {
        -webkit-line-clamp: 10 !important;
      }
    }
  }

  .author_indicator {
    $t-button_size: 5px;

    position: absolute;
    top: 5px;
    left: 5px;
    width: $t-button_size;
    height: $t-button_size;
    background-color: var(--author-color);
    border-radius: $t-button_size;
    z-index: 1;
    // height: 100%;

    // border-top: 10px solid var(--author-color);
    // border-right: 10px solid transparent;
    // border-left: none;
    // transform: rotate(-45deg);
    // border-radius: 2px 0 0 0;
    // border-top-left-radius: 2px;
  }

  .mediaContainer {
    width: 100%;
    height: 100%;
    margin: 0;
    border-radius: 4px;
    overflow: hidden;

    &.type-audio,
    &.type-video {
      > * {
        position: absolute;
        z-index: 1;
        width: 100%;
        height: 100%;
        pointer-events: none;

        .plyr {
          width: 100%;
          height: 100%;
          min-width: 0;

          .plyr__controls {
            position: absolute;
            background: transparent;
          }

          .plyr__control {
            pointer-events: auto;
          }

          .plyr__video-wrapper {
            width: 100%;
            height: 100%;
          }
          .plyr__poster {
            background-size: cover;
          }
        }
      }
    }

    img,
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
    }

    p:first-child {
      margin-top: 0;
    }
    p:last-child {
      margin-bottom: 0;
    }
  }
}

.draggabilly_handle {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  // z-index: 1;

  html.touchevents & {
    display: none;
  }
}

.packery-drop-placeholder {
  background-color: rgba(0, 0, 0, 0.1);
  filter: blur(10px);
  -webkit-transition: -webkit-transform 0.2s;
  transition: transform 0.2s;
  z-index: 0;
}

.buttons_right,
.buttons_bottom {
  position: absolute;
  color: white;
  font-size: 0.8em;
  line-height: 1;
  font-weight: bold;

  button {
    background-color: #333;
    display: block;
    border: none;
    appearance: none;
    width: 15px;
    height: 15px;
    padding: 0;
    margin: 4px;
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
}

.handle {
  position: absolute;
  z-index: 1;
  width: 20px;
  height: 20px;
  top: 0;
  left: 0;
  pointer-events: none;

  border-style: inherit;
  border-width: 0px;

  --handle-width: 15px;
  --handle-height: 5px;

  display: flex;
  justify-content: center;
  align-items: center;

  html.touchevents & {
    display: none;
  }

  &.handle_resizeMedia_bottom {
    width: 100%;
    top: auto;
    bottom: 0;
    cursor: col-resize;

    div {
      cursor: row-resize;

      > span {
        height: var(--handle-height);
        width: var(--handle-width);
      }
    }
  }
  &.handle_resizeMedia_bottomright {
    right: 0;
    top: auto;
    left: auto;
    bottom: 0;

    div {
      cursor: nwse-resize;

      span {
        height: var(--handle-height);
        width: var(--handle-height);
      }
    }
  }
  &.handle_resizeMedia_right {
    height: 100%;
    right: 0;
    left: auto;

    div {
      cursor: col-resize;

      > span {
        height: var(--handle-width);
        width: var(--handle-height);
      }
    }
  }

  > div {
    position: relative;
    pointer-events: auto;
    padding: 1em;
    border-radius: 50%;
    // background-color: red;

    &:hover > span {
      background-color: #aaa;
    }

    > span {
      display: block;
      width: var(--handle-height);
      height: var(--handle-height);
      background-color: #fff;
      box-shadow: 0 0px 4px rgba(0, 0, 0, 0.43);
      // mix-blend-mode: multiply;
      border-radius: var(--handle-height);
    }
  }
}
</style>