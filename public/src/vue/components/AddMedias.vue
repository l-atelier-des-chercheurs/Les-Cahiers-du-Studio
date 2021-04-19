<template>
  <div class="m_addMedias" :style="author_styles">
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
        :disabled="read_only"
      >
        <template v-if="$root.current_author">{{
          $root.current_author.name
        }}</template>
        <template v-else>{{ $t("login").toLowerCase() }}</template>
      </button>
    </div>

    <ImportMedias
      :can_edit_folder="can_edit_folder"
      :read_only="read_only"
      :slugFolderName="slugFolderName"
    />
  </div>
</template>
<script>
import debounce from "debounce";
import Authors from "./subcomponents/Authors.vue";
import ImportMedias from "./subcomponents/ImportMedias.vue";

export default {
  props: {
    slugFolderName: String,
    folder: Object,
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
    Authors,
    ImportMedias,
  },
  data() {
    return {
      showImportModal: false,

      show_addmedia_options: false,
      show_authors_options: false,
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
    author_styles() {
      let props = {};
      if (
        this.$root.current_author &&
        this.$root.current_author.hasOwnProperty("color")
      ) {
        props["--color-author"] = this.$root.current_author.color;
        props["--color-text_on_author_color"] = "#000";
      } else {
        props["--color-text_on_author_color"] = "#fff";
      }
      return props;
    },
  },
  methods: {
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
  },
};
</script>
<style lang="less" scoped>
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
  // --color-author: var(--color-noir);

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
</style>
