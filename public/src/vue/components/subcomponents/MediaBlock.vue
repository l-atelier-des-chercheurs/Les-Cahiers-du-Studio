<template>
  <!-- v-if="media.type === 'marker'" -->
  <div class="packery-item" :style="itemSize">
    <div
      class="packery-item-content"
      :class="{
        'is--hovered': is_hovered && !is_resized,
        'is--resized': is_resized,
        'is--text_overflowing': text_is_overflowing,
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
      <!-- v-if="media.type !== 'embed'" -->
      <!-- <div class="open_chat" @click="openChat">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="168px"
          height="168px"
          viewBox="0 0 168 168"
          style="enable-background: new 0 0 168 168;"
          xml:space="preserve"
        >
          <path
            class="st0"
            style="fill: var(--color-shapes);"
            d="M70.5,104.6C57.1,91,51.9,69.6,60.7,52c8.2-16.4,25.2-27.6,43.9-26.4c19.4,1.3,37.3,14.7,42,34
			c4.8,19.8-3,39.3-19.9,50.7c-2,1.4-2.5,3.6-1.5,5.8c1.3,2.6,2.6,5.3,3.9,7.9c0.8,1.7,1.6,3.3,2.4,5c0.4,0.8,1.1,1.3,0.1,1
			c-5-1.7-10-3.5-15.1-5.2C101.4,119.4,82.6,115.5,70.5,104.6z"
          />
          <path
            class="st1"
            style="fill: var(--color-background);"
            d="M66.7,109.3c14.6,13.3,37.8,17.9,56.2,24.3c5.4,1.9,15.2,6.2,17.3-2.3c1.2-5-3.3-12.3-6.3-17.7
			c16.7-13,25.7-34.7,19.6-55.7c-6.1-20.8-24.3-37-46.3-38.5c-21.7-1.4-44.1,10.7-52.3,31.5C46.8,71.4,51.1,93.6,66.7,109.3z
			 M72.3,103.4c-13-13.1-18-33.7-9.4-50.7c7.9-15.8,24.3-26.6,42.3-25.4c18.7,1.2,35.9,14.2,40.5,32.7c4.7,19.1-2.9,37.9-19.1,48.8
			c-2,1.3-2.4,3.5-1.4,5.6c1.2,2.6,2.5,5.1,3.7,7.7c0.8,1.6,1.6,3.2,2.3,4.8c0.4,0.8,1.1,1.3,0.1,1c-4.8-1.7-9.7-3.4-14.5-5.1
			C102.1,117.7,84,114,72.3,103.4z"
          />
          <path
            class="st0"
            style="fill: var(--color-shapes);"
            d="M60.4,137.4c-4.8,2.4-9.6,4.9-14.4,7.3c-0.9,0.5-0.3-0.1,0-1c0.6-1.8,1.2-3.6,1.8-5.4
			c0.9-2.8,1.9-5.7,2.8-8.5c0.8-2.3,0-4.5-2.3-5.6c-18.5-9.1-29-27.7-26.8-48.2C23.5,56,39.7,40.1,59,36.2
			c18.7-3.8,37.2,5.2,47.7,20.5c11.3,16.5,9,38.7-2.7,54.2C93.4,123.5,75,130,60.4,137.4z"
          />
          <path
            class="st1"
            style="fill: var(--color-background);"
            d="M112.2,55.4c-10.9-19.5-34.7-28.5-56-24.2c-21.7,4.4-37.5,22.9-40.8,44.4c-3.3,21.6,8.6,42,26.9,52.6
			c-2.3,5.7-5.8,13.5-3.9,18.3c3.2,8.2,12.3,2.6,17.4,0c17.4-8.8,39.8-16.5,52.5-31.6C121.6,97.3,122.9,74.7,112.2,55.4z
			 M60.4,135.1c-4.6,2.3-9.1,4.6-13.7,7c-0.9,0.5-0.3-0.1,0-1c0.6-1.7,1.1-3.4,1.7-5.1c0.9-2.7,1.8-5.4,2.7-8.1
			c0.7-2.2,0-4.3-2.1-5.3c-17.6-8.7-27.6-26.3-25.5-45.8c2-19,17.4-34.1,35.7-37.9c17.7-3.6,35.3,4.9,45.3,19.5
			c10.7,15.7,8.6,36.8-2.6,51.5C91.8,121.9,74.3,128,60.4,135.1z"
          />
        </svg>
      </div>-->

      <div class="packery-item-content--meta">
        <span
          v-if="!!media.caption"
          @mouseenter="is_captionHovered = true"
          @mouseleave="is_captionHovered = false"
          @click="openMedia"
          class="packery-item-content--meta--caption"
          :class="{ 'is--expanded': is_captionHovered }"
          :style="`-webkit-line-clamp: ${mediaSize.height <= 2 ? 1 : ''}`"
        >{{ media.caption }}</span>
        <span class="packery-item-content--meta--comments" @click.stop="openChat">
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="168px"
            height="168px"
            viewBox="0 0 168 168"
            style="enable-background: new 0 0 168 168;"
            xml:space="preserve"
          >
            <path
              class="st0"
              style="fill: var(--color-shapes);"
              d="M70.5,104.6C57.1,91,51.9,69.6,60.7,52c8.2-16.4,25.2-27.6,43.9-26.4c19.4,1.3,37.3,14.7,42,34
			c4.8,19.8-3,39.3-19.9,50.7c-2,1.4-2.5,3.6-1.5,5.8c1.3,2.6,2.6,5.3,3.9,7.9c0.8,1.7,1.6,3.3,2.4,5c0.4,0.8,1.1,1.3,0.1,1
			c-5-1.7-10-3.5-15.1-5.2C101.4,119.4,82.6,115.5,70.5,104.6z"
            />
            <path
              class="st1"
              style="fill: var(--color-background);"
              d="M66.7,109.3c14.6,13.3,37.8,17.9,56.2,24.3c5.4,1.9,15.2,6.2,17.3-2.3c1.2-5-3.3-12.3-6.3-17.7
			c16.7-13,25.7-34.7,19.6-55.7c-6.1-20.8-24.3-37-46.3-38.5c-21.7-1.4-44.1,10.7-52.3,31.5C46.8,71.4,51.1,93.6,66.7,109.3z
			 M72.3,103.4c-13-13.1-18-33.7-9.4-50.7c7.9-15.8,24.3-26.6,42.3-25.4c18.7,1.2,35.9,14.2,40.5,32.7c4.7,19.1-2.9,37.9-19.1,48.8
			c-2,1.3-2.4,3.5-1.4,5.6c1.2,2.6,2.5,5.1,3.7,7.7c0.8,1.6,1.6,3.2,2.3,4.8c0.4,0.8,1.1,1.3,0.1,1c-4.8-1.7-9.7-3.4-14.5-5.1
			C102.1,117.7,84,114,72.3,103.4z"
            />
            <path
              class="st0"
              style="fill: var(--color-shapes);"
              d="M60.4,137.4c-4.8,2.4-9.6,4.9-14.4,7.3c-0.9,0.5-0.3-0.1,0-1c0.6-1.8,1.2-3.6,1.8-5.4
			c0.9-2.8,1.9-5.7,2.8-8.5c0.8-2.3,0-4.5-2.3-5.6c-18.5-9.1-29-27.7-26.8-48.2C23.5,56,39.7,40.1,59,36.2
			c18.7-3.8,37.2,5.2,47.7,20.5c11.3,16.5,9,38.7-2.7,54.2C93.4,123.5,75,130,60.4,137.4z"
            />
            <path
              class="st1"
              style="fill: var(--color-background);"
              d="M112.2,55.4c-10.9-19.5-34.7-28.5-56-24.2c-21.7,4.4-37.5,22.9-40.8,44.4c-3.3,21.6,8.6,42,26.9,52.6
			c-2.3,5.7-5.8,13.5-3.9,18.3c3.2,8.2,12.3,2.6,17.4,0c17.4-8.8,39.8-16.5,52.5-31.6C121.6,97.3,122.9,74.7,112.2,55.4z
			 M60.4,135.1c-4.6,2.3-9.1,4.6-13.7,7c-0.9,0.5-0.3-0.1,0-1c0.6-1.7,1.1-3.4,1.7-5.1c0.9-2.7,1.8-5.4,2.7-8.1
			c0.7-2.2,0-4.3-2.1-5.3c-17.6-8.7-27.6-26.3-25.5-45.8c2-19,17.4-34.1,35.7-37.9c17.7-3.6,35.3,4.9,45.3,19.5
			c10.7,15.7,8.6,36.8-2.6,51.5C91.8,121.9,74.3,128,60.4,135.1z"
            />
          </svg>
          <template v-if="number_of_comments_for_media">
            {{
            number_of_comments_for_media + " " + $t("comments")
            }}
          </template>
        </span>
      </div>

      <template v-if="is_hovered && !is_resized">
        <div class="handle handle_resizeMedia handle_resizeMedia_bottomright">
          <div
            @mousedown.stop.prevent="
              resizeMedia('mouse', 'horizontal_vertical')
            "
            @touchstart.stop.prevent="
              resizeMedia('touch', 'horizontal_vertical')
            "
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
              @touchstart.stop.prevent="
                resizeMedia('touch', 'right_horizontal')
              "
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
    gutter: Number,
  },
  components: {
    MediaContent,
  },
  data() {
    return {
      is_hovered: false,
      is_captionHovered: false,
      mediaSize: {
        width: undefined,
        height: undefined,
        pwidth: 0,
        pheight: 0,
      },

      is_resized: false,

      resizeType: undefined,
      resizeOffset: {
        x: 0,
        y: 0,
      },

      is_mounted: false,
      text_is_overflowing: false,
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
      handle: "[data-draggabilly_handle]",
    });
    packeryEvents.$emit("draggie", {
      draggie: this.$el.draggie,
      node: this.$el.parentNode,
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
      deep: true,
    },
    "media.content": function() {
      this.checkTextOverflow();
    },
    "media.w": function() {
      this.setMediaSizeFromMeta();
    },
    "media.h": function() {
      this.setMediaSizeFromMeta();
    },
  },
  computed: {
    itemSize() {
      return {
        width: this.mediaWidth + "px",
        height: this.mediaHeight + "px",
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
    number_of_comments_for_media() {
      return this.$root.getNumberOfCommentsForChat(this.media.metaFileName);
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
            : "#fff",
        },
        this.itemSize
      );
    },
    mediaColorFromFirstAuthor() {
      return this.$root.mediaColorFromFirstAuthor(this.media, this.folder);
    },
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
    openChat() {
      if (this.$root.settings.sidebar_type !== "chats") {
        this.$root.settings.sidebar_type = "chats";
      }
      this.$root.settings.has_sidebar_opened = true;

      this.$root.openOrCreateChatFromMedia(this.media.slugMediaName);
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
      return Math.max(2, Math.min(12, w));
    },
    limitMediaHeight(h) {
      return Math.max(2, Math.min(12, h));
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
            h: this.mediaSize.height,
          },
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
    },
  },
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

  &.is--resized {
    > * {
      pointer-events: none;
    }
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

  .packery-item-content--meta {
    $t-unstick_from_borders: 5px;

    position: absolute;
    top: $t-unstick_from_borders;
    left: $t-unstick_from_borders;
    right: $t-unstick_from_borders;
    height: 100%;
    max-height: calc(100% - #{$t-unstick_from_borders} * 2);
    z-index: 1;
    overflow: visible;

    line-height: 1.2;
    font-size: 70%;
    pointer-events: none;

    span {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.4);
      background-color: var(--author-color);
      max-width: 100%;
      max-height: 100%;
      pointer-events: auto;

      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;

      // display: -webkit-inline-box;
      // -webkit-box-orient: vertical;
      // -webkit-line-clamp: 2;
      // line-clamp: 2;
      // overflow: hidden;

      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;

      padding: 2px;
      border-radius: 2px;

      box-shadow: -0.1em 0.2em 1em rgba(0, 0, 0, 0.35);

      // transition: all 0.4s ease;
    }

    span.is--expanded {
      white-space: initial;

      display: -webkit-inline-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 4 !important;
      line-clamp: 4;
    }
  }

  .packery-item-content--comments {
    svg {
      width: 1rem;
      height: 1rem;
    }
  }

  .plyr__controls {
    color: var(--color-noir);
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
    &.type-video,
    &.type-embed {
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
            bottom: 0;
            margin: 0;
            pointer-events: auto;

            > *:not(:first-child) {
              opacity: 0;
            }
          }

          .plyr__control {
            background-color: rgba(255, 255, 255, 0.45);
            &:hover {
              background: #222;
            }
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
      &.is--playing {
        // display: none;
        .plyr__controls {
          // background-color: rgba(255, 255, 255, 0.45);

          > *:not(:first-child) {
            opacity: 1;
          }
        }
      }
    }
    &.type-embed {
      > * {
        position: absolute;
        // z-index: 1;
        width: 100%;
        height: 100%;
      }
    }

    img,
    video,
    iframe {
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

.open_chat {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  margin: calc(var(--spacing) / 4);

  svg {
    width: 2em;
    height: 2em;
  }
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
