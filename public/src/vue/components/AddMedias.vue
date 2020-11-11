<template>
  <div class="m_addMedias">
    <div
      class="m_addMedias--overlay"
      v-if="show_addmedia_options"
      @click="show_addmedia_options = false"
    />

    <div class="m_authorMenu" @mouseleave="/* show_authors_options = false */">
      <transition name="slideupfrombottomright">
        <Authors
          v-if="show_authors_options"
          class="m_authorMenu--options--authors"
          :slugFolderName="slugFolderName"
          :authors="folder_authors"
        />
      </transition>

      <button
        type="button"
        class="m_authorMenu--button"
        @click="$root.showAuthorsListModal = true"
        :style="addMediaStyles"
        :disabled="read_only"
      >
        <!-- @mouseenter="!is_touch && show_drop_container === false ? show_authors_options = true : ''" -->
        <template v-if="$root.current_author">{{
          $root.current_author.name
        }}</template>
        <template v-else>{{ $t("login").toLowerCase() }}</template>
      </button>
    </div>

    <div
      class="menu_encart"
      @mouseleave="/* show_addmedia_options = false */"
      :class="{ 'is--showing_options': show_addmedia_options }"
      :style="addMediaStyles"
      v-if="can_edit_folder"
    >
      <!-- @mouseenter="!is_touch && show_drop_container === false ? show_addmedia_options = true : ''" -->
      <div class="menu_encart--options">
        <button
          key="add_text"
          type="button"
          class="button button-round button-round-small margin-bottom-small padding-none bg-noir c-blanc"
          @click="createTextMedia"
          :disabled="read_only"
        >
          <span class="text_label show_on_hover">{{ $t("text") }}</span>

          <svg
            id="Calque_1"
            data-name="Calque 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 56.69 56.69"
          >
            <rect
              x="17.57"
              y="13.73"
              width="21.55"
              height="29.23"
              style="
                fill: none;
                stroke: currentColor;
                stroke-linecap: round;
                stroke-linejoin: round;
              "
            />
            <g>
              <line
                x1="20.55"
                y1="20.16"
                x2="33.46"
                y2="20.16"
                style="
                  fill: none;
                  stroke: currentColor;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                "
              />
              <line
                x1="20.55"
                y1="24.4"
                x2="35.72"
                y2="24.4"
                style="
                  fill: none;
                  stroke: currentColor;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                "
              />
              <line
                x1="20.55"
                y1="28.55"
                x2="33.58"
                y2="28.59"
                style="
                  fill: none;
                  stroke: currentColor;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                "
              />
              <line
                x1="20.55"
                y1="32.63"
                x2="35.14"
                y2="32.56"
                style="
                  fill: none;
                  stroke: currentColor;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                "
              />
              <line
                x1="20.55"
                y1="36.54"
                x2="32.4"
                y2="36.54"
                style="
                  fill: none;
                  stroke: currentColor;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                "
              />
            </g>
          </svg>
        </button>

        <button
          key="add_marker"
          type="button"
          class="button button-round button-round-small margin-bottom-small bg-noir c-blanc padding-none"
          @click="createMarkerMedia"
          :disabled="read_only"
        >
          <span class="text_label show_on_hover">{{ $t("marker") }}</span>

          <svg
            id="Calque_1"
            data-name="Calque 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 56.69 56.69"
          >
            <circle
              cx="28.35"
              cy="28.35"
              r="10.22"
              style="
                fill: none;
                stroke: currentColor;
                stroke-linecap: round;
                stroke-linejoin: round;
              "
            />
            <circle
              cx="28.35"
              cy="28.35"
              r="4.5"
              style="
                fill: none;
                stroke: currentColor;
                stroke-linecap: round;
                stroke-linejoin: round;
              "
            />
          </svg>
        </button>

        <button
          key="add_embed"
          type="button"
          class="button button-round button-round-small margin-bottom-small bg-noir c-blanc padding-none"
          @click="createEmbedMedia"
          :disabled="read_only"
        >
          <span class="text_label show_on_hover">{{ $t("embed") }}</span>

          <svg
            id="Calque_1"
            data-name="Calque 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 56.69 56.69"
          >
            <line
              x1="23.53"
              y1="23.92"
              x2="33.13"
              y2="33.52"
              style="
                fill: none;
                stroke: currentColor;
                stroke-linecap: round;
                stroke-linejoin: round;
              "
            />

            <path
              d="M30.09,21.9,27.22,19a6.05,6.05,0,0,0-8.57,0h0a6.05,6.05,0,0,0,0,8.57l2.86,2.87"
              style="
                fill: none;
                stroke: currentColor;
                stroke-linecap: round;
                stroke-linejoin: round;
              "
            />
            <path
              d="M26.58,35.54l2.87,2.86a6.05,6.05,0,0,0,8.57,0h0a6.05,6.05,0,0,0,0-8.57L35.15,27"
              style="
                fill: none;
                stroke: currentColor;
                stroke-linecap: round;
                stroke-linejoin: round;
              "
            />
          </svg>
        </button>

        <template>
          <div
            :key="`add_${field.key}`"
            class="button button-round button-round-small margin-bottom-small bg-noir c-blanc padding-none"
            v-for="field in input_file_fields"
            :disabled="read_only"
          >
            <label :for="`add_${field.key}`">
              <span class="text_label show_on_hover">{{ field.label }}</span>
              <div v-html="field.svg" />
            </label>
            <input
              type="file"
              multiple
              :id="`add_${field.key}`"
              :name="field.key"
              @change="updateInputFiles($event)"
              :accept="field.accept"
              :capture="field.capture"
              style="width: 1px; height: 1px; overflow: hidden"
            />
          </div>
        </template>
      </div>

      <button
        type="button"
        class="menu_encart--button button button-round margin-bottom-small padding-none bg-noir c-blanc button_addMedia m_addMedias--buttons--openHideButton"
        :class="{
          'is--shown': show_addmedia_options,
          'is--dragover': show_drop_container,
        }"
        :style="addMediaStyles"
        @click="show_addmedia_options = !show_addmedia_options"
        @drop="dropHandler($event)"
      >
        <span class="text_label always_show" v-if="show_drop_container"
          >Déposez vos fichiers ici</span
        >
        <!-- TODO scroll to now au click -->
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
          style="enable-background: new 0 0 24 24"
          xml:space="preserve"
        >
          <path
            style="fill: currentColor"
            d="M0,10.5h10.5V0h2.9v10.5H24v2.9H13.5V24h-2.9V13.5H0V10.5z"
          />
        </svg>
      </button>

      <UploadFileModal
        v-if="selected_files.length > 0"
        :slugFolderName="slugFolderName"
        :type="'folders'"
        :selected_files.sync="selected_files"
        @insertMedias="
          (metaFileNames) => insertImportedMedias({ metaFileNames })
        "
        @close="selected_files = []"
      />
    </div>
  </div>
</template>
<script>
import UploadFileModal from "./modals/UploadFileModal.vue";
import debounce from "debounce";
import Authors from "./subcomponents/Authors.vue";

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    is_realtime: {
      type: Boolean,
      default: false,
    },
    can_edit_folder: {
      type: Boolean,
      default: false,
    },
    read_only: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    UploadFileModal,
    Authors,
  },
  data() {
    return {
      showImportModal: false,

      selected_files: [],
      show_addmedia_options: false,
      show_authors_options: false,

      show_drop_container: false,

      input_file_fields: [
        {
          key: "audio",
          label: "Audio",
          accept: "audio/*",
          capture: true,
          svg: `
<svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.69 56.69">
    <line x1="22.61" y1="44.73" x2="34.42" y2="44.73" style="fill: none;stroke: currentColor;stroke-linecap: round;stroke-linejoin: round"/>
    <line x1="28.26" y1="44.73" x2="28.26" y2="34.68" style="fill: none;stroke: currentColor;stroke-linecap: round;stroke-linejoin: round"/>
    <path d="M36.88,22v4a8.53,8.53,0,0,1-8.53,8.54h0A8.54,8.54,0,0,1,19.81,26V22" style="fill: none;stroke: currentColor;stroke-linecap: round;stroke-linejoin: round"/>
    <rect x="23.28" y="11.96" width="10.14" height="19.06" rx="5.07" style="fill: none;stroke: currentColor;stroke-linecap: round;stroke-linejoin: round"/>
</svg>
          `,
        },
        {
          key: "file",
          label: "Fichier",
          accept: "",
          capture: false,
          svg: `
<svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.69 56.69">
    <polygon points="17.57 42.96 17.57 13.75 30.44 13.75 39.12 22.21 39.12 42.96 17.57 42.96" style="fill: none;stroke: currentColor;stroke-linecap: round;stroke-linejoin: round"/>
    <polyline points="38.99 22.19 30.54 22.19 30.54 13.73" style="fill: none;stroke: currentColor;stroke-linecap: round;stroke-linejoin: round"/>
</svg>
          `,
        },
        {
          key: "video",
          label: "Vidéo",
          accept: "video/*",
          capture: true,
          svg: `
<svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.69 56.69">
<rect x="13.74" y="17.57" width="29.21" height="21.55" style="fill: none;stroke: currentColor;stroke-linecap: round;stroke-linejoin: round"/>
<polygon points="25.33 23.27 33.76 28.51 25.33 33.45 25.33 23.27" style="fill: none;stroke: currentColor;stroke-linecap: round;stroke-linejoin: round"/>
</svg>
          `,
        },
        {
          key: "image",
          label: "Image",
          accept: "image/*",
          capture: true,
          svg: `
          <svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.69 56.69">
            <path d="M40.26,39.12,32.59,24.51a1,1,0,0,0-1.69,0l-4.73,9.11a1,1,0,0,1-1.65.08l-2.08-3.26a1,1,0,0,0-1.65.08L16.44,39" style="fill: none;stroke: currentColor;stroke-linecap: round;stroke-linejoin: round"/>
            <circle cx="20.88" cy="23.72" r="2.21" style="fill: none;stroke: currentColor;stroke-linecap: round;stroke-linejoin: round"/>
            <rect x="13.74" y="17.57" width="29.21" height="21.55" style="fill: none;stroke: currentColor;stroke-linecap: round;stroke-linejoin: round"/>
          </svg>

          `,
        },
      ],
    };
  },
  mounted: function () {
    document.addEventListener("keyup", this.boitierPressed);
    document.addEventListener("dragover", this.ondragover);
    this.cancelDragOver = debounce(this.cancelDragOver, 300);
  },
  destroyed: function () {
    document.removeEventListener("keyup", this.boitierPressed);
    document.removeEventListener("dragover", this.ondragover);
  },
  watch: {
    file: function () {},
    show_addmedia_options() {
      if (this.show_addmedia_options) {
        this.$eventHub.$emit("showingAddmediaOptions");
      } else {
        this.$eventHub.$emit("hidingAddmediaOptions");
      }
    },
    show_authors_options() {
      if (this.show_authors_options) {
        this.$eventHub.$emit("showingAddmediaOptions");
      } else {
        this.$eventHub.$emit("hidingAddmediaOptions");
      }
    },
  },
  computed: {
    is_touch() {
      return Modernizr.touchevents;
    },
    folder_authors() {
      return this.folder.hasOwnProperty("authors") &&
        typeof this.folder.authors === "object"
        ? this.folder.authors
        : [];
    },
    addMediaStyles() {
      let props = {};
      if (
        this.$root.current_author &&
        this.$root.current_author.hasOwnProperty("color")
      ) {
        props["--color-author"] = this.$root.current_author.color;
        props["--color-text_on_author_color"] = "var(--color-noir)";
      } else {
        props["--color-text_on_author_color"] = "#333";
      }
      return props;
    },
  },
  methods: {
    createMedia({ additionalMeta }) {
      return new Promise((resolve, reject) => {
        this.$root
          .createMedia({
            slugFolderName: this.slugFolderName,
            type: "folders",
            additionalMeta,
          })
          .then((mdata) => {
            this.$eventHub.$emit("scrollToMedia", mdata.metaFileName);
            return resolve(mdata);
          });
      });
    },
    createTextMedia() {
      if (window.state.dev_mode === "debug") {
        console.log("METHODS • AddMediaButton: createTextMedia");
      }
      this.show_addmedia_options = false;
      const additionalMeta = {
        type: "text",
        w: 4,
        h: 4,
      };
      this.createMedia({ additionalMeta }).then((mdata) => {
        setTimeout(() => {
          this.$eventHub.$emit("timeline.openMediaModal", mdata.metaFileName);
        }, 500);
      });
    },
    createMarkerMedia() {
      if (window.state.dev_mode === "debug")
        console.log("METHODS • AddMediaButton: createMarkerMedia");

      this.show_addmedia_options = false;
      const additionalMeta = {
        type: "marker",
      };
      this.createMedia({ additionalMeta }).then((mdata) => {
        setTimeout(() => {
          this.$eventHub.$emit("timeline.openMediaModal", mdata.metaFileName);
        }, 500);
      });
    },
    createEmbedMedia() {
      if (window.state.dev_mode === "debug")
        console.log("METHODS • AddMediaButton: createMarkerMedia");

      this.show_addmedia_options = false;

      const additionalMeta = {
        type: "embed",
      };
      this.createMedia({ additionalMeta }).then((mdata) => {
        setTimeout(() => {
          this.$eventHub.$emit("timeline.openMediaModal", mdata.metaFileName);
        }, 500);
      });
    },

    boitierPressed(event) {
      if (window.state.dev_mode === "debug") {
        console.log("METHODS • AddMediaButton: boitierPressed");
      }

      // if there is a modal opened, let’s not do something
      if (this.$root.settings.has_modal_opened === true) {
        return;
      }
      if (this.$root.settings.has_writeup_opended) {
        return;
      }

      if (
        event.target.tagName.toLowerCase() === "input" ||
        event.target.tagName.toLowerCase() === "textarea" ||
        event.target.className.includes("ql-editor")
      ) {
        return;
      }

      var key = event.key;

      this.$root.settings.keyboard_shortcuts.forEach((k) => {
        if (k.key === key) {
          let additionalMeta = {
            type: "marker",
          };

          if (k.author_name !== "" && k.author_name !== "none") {
            additionalMeta.authors = [{ slugFolderName: k.slugFolderName }];
          }

          this.$root.createMedia({ additionalMeta });
        }
      });
    },
    updateInputFiles($event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / updateSelectedFiles`);
      }
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },

    insertImportedMedias({ metaFileNames }) {
      // get last media

      if (metaFileNames.length === 0) return false;

      const last_media_meta = metaFileNames[metaFileNames.length - 1];
      this.show_addmedia_options = false;

      this.$eventHub.$once(`socketio.folders.media_listed`, () => {
        this.selected_files = [];
        setTimeout(() => {
          this.$eventHub.$emit("scrollToMedia", last_media_meta);
        }, 500);
      });
    },

    ondragover(e) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / ondragover`);
      }

      var dt = e.dataTransfer;
      if (
        dt.types &&
        (dt.types.indexOf
          ? dt.types.indexOf("Files") != -1
          : dt.types.contains("Files"))
      ) {
        console.log(`is file`);
        this.show_drop_container = true;
        this.cancelDragOver();
      }
    },
    cancelDragOver() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / cancelDragOver`);
      }
      this.show_drop_container = false;
    },
    dropHandler($event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • AddMedia / dropHandler`);
      }

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();

      if ($event.dataTransfer.items) {
        let files = [];
        for (var i = 0; i < $event.dataTransfer.items.length; i++) {
          if ($event.dataTransfer.items[i].kind === "file") {
            files.push($event.dataTransfer.items[i].getAsFile());
          }
        }
        this.selected_files = files;
      } else {
        for (var i = 0; i < $event.dataTransfer.files.length; i++) {
          this.selected_files = Array.from($event.dataTransfer.files);
        }
      }
    },
  },
};
</script>
<style lang="less" scoped>
button,
.button {
  position: relative;
  box-shadow: -0.1em 0.2em 1em rgba(0, 0, 0, 0.35);
  // margin: .3em;

  &:active {
    background-color: var(--color-vert_vif);
  }

  label {
    cursor: pointer;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    user-select: none;
  }

  span {
    margin-top: 0;
  }

  .text_label:not(.always_show) {
    // opacity: 0;
    transition: opacity 0.08s;

    html.touchevents & {
      opacity: 1;
    }
  }

  &:hover .text_label {
    opacity: 1;
  }
}

.text_label {
  position: absolute;
  right: ~"calc(100% + 15px)";

  text-transform: initial;
  padding: 3px 4px;
  line-height: 1;

  border-radius: 3px;
  background-color: var(--color-bleu_vif);
  // color: #fff;
  // color: --color-noir;

  // background-color: white;
  // color: black;
  // box-shadow: 2px 4px 13px #bbb;

  top: 50%;
  transform: translate(0, -50%);
  white-space: nowrap;
}

.m_addMedias {
  position: absolute;

  bottom: 8vh;
  right: 4vw;

  z-index: 55000;
  min-height: 100px;
  max-height: 80vh;

  // width: 100px;
  height: auto;

  // color: var(--color-blanc);

  display: flex;
  flex-flow: row nowrap;

  align-items: flex-end;
  align-content: center;
  justify-content: center;

  pointer-events: none;

  .m_addMedias--overlay {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    pointer-events: auto;
    // background-color: red;
  }

  .menu_encart {
    pointer-events: none;
    // --color-author: white;
    --color-author: var(--color-bleu_vif);

    .menu_encart--options {
      flex: 1 1 auto;
      min-width: 70px;
      padding: var(--spacing-medium) var(--spacing-small) 0;

      display: flex;
      flex-flow: column wrap;
      justify-content: center;
      align-items: center;

      // pointer-events: none;
      > * {
        display: block;
        position: relative;
        cursor: pointer;
        opacity: 0;
        transform: translateY(5px) scale(0.8);
        background-color: var(--color-author);
        color: var(--color-text_on_author_color);
        transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

        label {
          cursor: inherit;
        }

        .delay_transition_up(@max, @counter) when (@counter < @max) {
          .delay_transition_up(@max, (@counter + 1));
          &:nth-child(@{counter}) {
            transition-delay: ((@max - @counter) * 0.035s);
          }
        }
        .delay_transition_up(6, 0);
      }
    }
    &.is--showing_options {
      pointer-events: auto;

      .menu_encart--options > * {
        opacity: 1;
        transform: translateY(0px) scale(1);

        &[disabled] {
          // opacity: 0.4;
          cursor: not-allowed;
          background-color: #999;
        }
      }
    }

    .menu_encart--button {
      // height: 2em;
      flex: 0 0 auto;
      transition: all cubic-bezier(0.19, 1, 0.22, 1) 0.8s;
      display: block;
      margin-left: auto;
      margin-right: 0;
      margin-bottom: 22px;
      text-transform: initial;
      pointer-events: auto;
      background-color: var(--color-author);
      color: var(--color-text_on_author_color);

      svg {
        width: 24px;
        height: 24px;
        transition: transform cubic-bezier(0.19, 1, 0.22, 1) 0.8s;
        transform: rotate(0);
      }
      &.is--dragover {
        width: 256px;
        height: 256px;
      }
    }

    &.is--showing_options {
      // background-color: #999;

      .menu_encart--button svg {
        transform: rotate(225deg);
      }
    }
  }

  .m_addMedias--dropContainer {
    position: absolute;
    z-index: 0;
    bottom: 0;
    right: 0;

    border-radius: 6px;

    width: 320px;
    height: 320px;
    background-color: var(--color-noir);
  }
}

.m_authorMenu {
  pointer-events: auto;
  --color-author: var(--color-bleu_vif);

  .m_authorMenu--button {
    flex: 0 0 auto;
    transition: all cubic-bezier(0.19, 1, 0.22, 1) 0.8s;
    display: block;
    margin-left: auto;
    margin-right: 20px;
    margin-bottom: 22px;
    text-transform: initial;
    pointer-events: auto;
    background-color: var(--color-author);
    color: var(--color-text_on_author_color);
  }
}

.picto {
  background-color: var(--color-noir);
}

.button_addMedia {
  width: 64px;
  height: 64px;
  padding: 0 20px;
  margin: 0 auto !important;
  background-color: var(--color-author);
}
</style>
