<template>
  <div class="m_addMedias" :style="author_styles">
    <div class="m_authorMenu">
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

    <CaptureMedias v-if="can_edit_folder" :slugFolderName="slugFolderName" />
  </div>
</template>
<script>
import Authors from "./subcomponents/Authors.vue";
import ImportMedias from "./subcomponents/ImportMedias.vue";
import CaptureMedias from "./subcomponents/CaptureMedias.vue";

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
    CaptureMedias,
  },
  data() {
    return {
      showImportModal: false,
    };
  },
  mounted: function () {
    document.addEventListener("keyup", this.boitierPressed);
  },
  destroyed: function () {
    document.removeEventListener("keyup", this.boitierPressed);
  },
  watch: {
    file: function () {},
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
        props["--c-author"] = this.$root.current_author.color;
        props["--c-text_on_author_color"] = "#000";
      } else {
        props["--c-author"] = `var(--c-noir)`;
        props["--c-text_on_author_color"] = "#fff";
      }
      return props;
    },
  },
  methods: {
    boitierPressed(event) {
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

      if (window.state.dev_mode === "debug") {
        console.log("METHODS • AddMediaButton: boitierPressed");
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
  // position: absolute;
  // left: 0;
  // right: 0;
  // bottom: 0;
  // top: 0;

  // padding-bottom: 8vh;
  // padding-right: 4vw;

  z-index: 1000;

  // width: 100px;
  height: auto;

  // color: var(--c-blanc);

  display: flex;
  flex-flow: row wrap;

  align-items: flex-end;
  align-content: center;
  justify-content: flex-end;

  pointer-events: none;
}

.m_authorMenu {
  pointer-events: auto;
  // --c-author: var(--c-noir);

  .m_authorMenu--button {
    flex: 0 0 auto;
    transition: all cubic-bezier(0.19, 1, 0.22, 1) 0.8s;
    display: block;
    margin-left: auto;
    margin-right: var(--spacing-verysmall);

    margin-bottom: 22px;
    text-transform: initial;
    pointer-events: auto;
    background-color: var(--c-author);
    color: var(--c-text_on_author_color);
  }
}
</style>
