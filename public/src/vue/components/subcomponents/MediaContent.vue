<template>
  <div
    class="mediaContainer"
    :class="[{ 'is--playing': is_playing }, 'type-' + media.type]"
    :data-context="context"
  >
    <template v-if="media.type === 'image'">
      <img
        :srcset="imageSrcSetAttr"
        :sizes="imageSizesAttr"
        :src="linkToImageThumb"
      />
      <transition name="fade" :duration="600">
        <img
          v-if="is_hovered && $root.state.is_electron && linkToHoveredThumb"
          :src="linkToHoveredThumb"
        />
      </transition>
    </template>

    <template v-else-if="media.type === 'video'">
      <template v-if="context === 'preview'">
        <vue-plyr
          :options="plyr_options"
          :emit="['playing', 'pause', 'ended']"
          @playing="playing"
          @pause="pause"
          @ended="ended"
        >
          <video :poster="linkToVideoThumb" :src="mediaURL" preload="none" />
        </vue-plyr>
      </template>
      <template v-else>
        <vue-plyr :options="plyr_options">
          <video :poster="linkToVideoThumb" :src="mediaURL" preload="none" />
        </vue-plyr>
      </template>
    </template>

    <template v-else-if="media.type === 'audio'">
      <template v-if="context === 'preview'">
        <vue-plyr
          :options="plyr_options"
          :emit="['playing', 'pause', 'ended']"
          @playing="playing"
          @pause="pause"
          @ended="ended"
        >
          <audio :src="mediaURL" preload="none" />
        </vue-plyr>
      </template>
      <template v-else>
        <vue-plyr :options="plyr_options">
          <audio :src="mediaURL" preload="none" />
        </vue-plyr>
      </template>
    </template>

    <template v-else-if="media.type === 'text'">
      <div v-if="context !== 'edit'" class="quillWrapper">
        <div class="ql-snow">
          <div v-if="value.length !== 0" class="ql-editor" v-html="value" />
          <p v-else v-html="'…'" />
        </div>
      </div>
      <TextEditor
        v-else
        v-model="htmlForEditor"
        :media_metaFileName="media.metaFileName"
        :slugFolderName="slugFolderName"
        ref="textField"
        :readonly="read_only"
      />
      <!-- <textarea
        placeholder="…"
        class="mediaTextContent border-none bg-transparent"
        :value="value"
        @input="$emit('input', $event.target.value)"
        ref="textField"
        autocorrect="on"
        :readonly="read_only"
      />-->
    </template>

    <template v-else-if="media.type === 'marker'">
      <div v-if="context !== 'edit'" class="padding-small">
        <template v-if="value.length > 0">{{ value }}</template>
        <template v-else>…</template>
      </div>

      <input
        v-else
        type="text"
        class="border-none bg-transparent"
        placeholder="Étiquette"
        name="label"
        :value="value"
        @input="$emit('input', $event.target.value)"
        ref="textField"
        :readonly="read_only"
      />
    </template>

    <template v-else-if="media.type === 'embed'">
      <div v-if="embedURL" class>
        <vue-plyr
          v-if="embedURL.type !== 'tweet'"
          :options="plyr_options"
          :emit="['playing', 'pause', 'ended']"
          @playing="playing"
          @pause="pause"
          @ended="ended"
        >
          <div
            :data-plyr-provider="embedURL.type"
            :data-plyr-embed-id="embedURL.src"
          ></div>
        </vue-plyr>

        <Tweet
          v-else
          :id="embedURL.id"
          :options="{ cards: 'hidden', theme: 'light' }"
        />
      </div>
      <input
        v-if="context === 'edit'"
        type="url"
        class="border-none bg-transparent"
        placeholder="URL"
        name="url"
        :value="value"
        @input="$emit('input', $event.target.value)"
        ref="textField"
        :readonly="read_only"
      />
    </template>

    <template v-else-if="media.type === 'document'">
      <div v-if="context !== 'edit'" class>
        <pre
          >{{ media.media_filename }}
        </pre>
      </div>
      <iframe v-else :src="mediaURL" />
    </template>

    <template v-else-if="media.type === 'other'">
      <div class="padding-small font-small">
        <pre>
<span v-html="$t('file:')">
</span>
{{ media.media_filename }}
        </pre>
      </div>
    </template>
  </div>
</template>
<script>
import TextEditor from "./TextEditor.vue";
import { Tweet } from "vue-tweet-embed";

export default {
  props: {
    slugFolderName: String,
    media: Object,
    subfolder: {
      type: String,
      default: "",
    },
    context: {
      type: String,
      default: "preview",
      // preview, edit, publication
    },
    value: {
      type: String,
      default: "…",
    },
    is_hovered: Boolean,
    read_only: {
      type: Boolean,
      default: true,
    },
    preview_size: {
      type: Number,
      default: 180,
    },
    element_width_for_sizes: {
      type: Number,
      default: 0,
    },
    element_height: {
      type: Number,
      default: 0,
    },
  },
  components: {
    TextEditor,
    Tweet,
  },
  data() {
    return {
      available_resolutions: {
        preview_hovered: 360,
        default: 1600,
      },
      htmlForEditor: this.value,

      is_playing: false,

      plyr_options: {
        controls: [
          // "play-large",
          "play",
          "progress",
          "current-time",
          // "mute",
          "volume",
          "fullscreen",
        ],
        iconUrl:
          this.$root.state.mode !== "export_web"
            ? "/images/plyr.svg"
            : "./_images/plyr.svg",
        hideControls: false,
      },
    };
  },
  mounted() {
    if (this.context === "edit") {
      if (Modernizr !== undefined && !Modernizr.touchevents) {
        if (this.$refs.textField !== undefined) {
          // this.$refs.textField.focus();
        }
      }
    }
  },
  beforeDestroy() {},
  watch: {
    htmlForEditor: function () {
      this.$emit("input", this.htmlForEditor);
    },
  },
  computed: {
    mediaURL: function () {
      return this.$root.state.mode === "export_web"
        ? `./${this.subfolder}${this.slugFolderName}/${this.media.media_filename}`
        : `/${this.subfolder}${this.slugFolderName}/${this.media.media_filename}`;
    },
    thumbRes: function () {
      return this.context === "preview" && this.element_width_for_sizes
        ? [50, 180, 360, 1600].find(
            (r) => r / 2 >= this.element_width_for_sizes
          )
        : this.available_resolutions.default;
    },
    thumbResHovered: function () {
      return this.available_resolutions.preview_hovered;
    },
    linkToImageThumb: function () {
      if (!this.media.hasOwnProperty("thumbs")) {
        return this.mediaURL;
      }

      if (
        // if image is gif and context is not 'preview', let’s show the original gif
        this.mediaURL.toLowerCase().endsWith(".gif")
      ) {
        return this.mediaURL;
      }

      const small_thumb = this.media.thumbs.filter(
        (m) => m.size === this.thumbRes
      );
      if (small_thumb.length == 0) {
        return this.mediaURL;
      }

      let pathToSmallestThumb = small_thumb[0].path;

      let url =
        this.$root.state.mode === "export_web"
          ? `./${pathToSmallestThumb}`
          : `/${pathToSmallestThumb}`;
      return url;
    },
    imageSrcSetAttr: function () {
      if (
        this.element_width_for_sizes ||
        this.mediaURL.toLowerCase().endsWith(".gif")
      ) {
        return;
      }

      // get all available sizes
      const img_srcset = this.media.thumbs.reduce((acc, t) => {
        if (t.hasOwnProperty("path")) {
          // acc.push(encodeURIComponent(t.path) + ' ' + t.size + 'w');
          acc.push(t.path + " " + t.size + "w");
        }
        return acc;
      }, []);
      return img_srcset.join(", ");
    },
    videostillSrcSetAttr: function () {
      if (this.element_width_for_sizes) {
        return;
      }

      let timeMark = 0;
      let timeMarkThumbs = this.media.thumbs.filter(
        (t) => !!t && t.timeMark === 0
      );

      if (!timeMarkThumbs || timeMarkThumbs.length === 0) {
        return;
      }

      // get all available sizes
      const img_srcset = timeMarkThumbs[0].thumbsData.reduce((acc, t) => {
        if (t.hasOwnProperty("path")) {
          acc.push(t.path + " " + t.size + "w");
        }
        return acc;
      }, []);

      return img_srcset.join(", ");
    },
    imageSizesAttr: function () {
      if (!this.element_width_for_sizes) {
        return;
      }
      return this.element_width_for_sizes + "px";
    },
    linkToHoveredThumb: function () {
      let pathToSmallestThumb = this.media.thumbs.filter(
        (m) => m.size === this.thumbResHovered
      )[0].path;

      const url =
        this.$root.state.mode === "export_web"
          ? "./" + pathToSmallestThumb
          : "/" + pathToSmallestThumb;
      return pathToSmallestThumb !== undefined ? url : this.mediaURL;
    },
    linkToVideoThumb: function () {
      if (
        !this.media["thumbs"] ||
        (typeof this.media.thumbs === "object" &&
          this.media.thumbs.length === 0)
      ) {
        return this.mediaURL;
      }

      let timeMark = 0;
      let timeMarkThumbs = this.media.thumbs.filter(
        (t) => !!t && t.timeMark === 0
      );

      if (!timeMarkThumbs || timeMarkThumbs.length === 0) {
        return this.mediaURL;
      }

      let pathToSmallestThumb = timeMarkThumbs[0].thumbsData.filter(
        (m) => m.size === this.thumbRes
      )[0].path;

      let url =
        this.$root.state.mode === "export_web"
          ? "./" + pathToSmallestThumb
          : "/" + pathToSmallestThumb;
      return pathToSmallestThumb !== undefined ? url : this.mediaURL;
    },
    embedURL: function () {
      if (!this.media.content) return false;
      if (this.media.content.includes("twitter.com")) {
        return {
          type: "tweet",
          id: this.getTweetIdFromURL(this.media.content),
        };
      } else if (
        this.media.content.includes("youtube.com") ||
        this.media.content.includes("youtu.be")
      ) {
        return {
          type: "youtube",
          src: this.getYoutubeIDFromURL(this.media.content),
        };
      } else if (this.media.content.includes("vimeo.com")) {
        return {
          type: "vimeo",
          src: this.getVimeoIDFromURL(this.media.content),
        };
      }
      return this.media.content;
    },
  },
  methods: {
    playing(event) {
      this.is_playing = true;
      this.$eventHub.$emit("timelineplayer.playing", {
        plyr: event.detail.plyr,
        metaFileName: this.media.metaFileName,
        thumb: this.media.type === "video" ? this.linkToVideoThumb : false,
        name: this.media.media_filename,
      });
    },
    pause(event) {
      this.is_playing = false;
      this.$eventHub.$emit("timelineplayer.pause", {
        plyr: event.detail.plyr,
        metaFileName: this.media.metaFileName,
      });
    },
    ended(event) {
      this.is_playing = false;
      this.$eventHub.$emit("timelineplayer.ended", {
        plyr: event.detail.plyr,
        metaFileName: this.media.metaFileName,
      });
    },
    getTweetIdFromURL(url) {
      let tweetRegex = /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/([0-9]{19})/;
      return url.match(tweetRegex)[3];
    },
    getYoutubeIDFromURL(url) {
      function getId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        return match && match[2].length === 11 ? match[2] : null;
      }

      return getId(url);
    },
    getVimeoIDFromURL(url) {
      function getId(url) {
        const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
        const match = url.match(regExp);
        return match ? match[1] : null;
      }

      return getId(url);
    },
  },
};
</script>
