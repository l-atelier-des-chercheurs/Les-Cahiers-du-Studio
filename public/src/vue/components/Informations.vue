<template>
  <div class="m_informations">
    <div class="m_informations--presentation">
      <div class="m_informations--presentation--langSelector">
        <select v-model="currentLang" class="_langSelector">
          <option
            v-for="(name, code) in $root.lang.available"
            :value="code"
            :key="code"
          >
            {{ name }}
          </option>
        </select>
      </div>

      <div class="m_informations--presentation--folder">
        <Folder
          :slugFolderName="folder.slugFolderName"
          :folder="folder"
          :read_only="read_only"
          :context="'full'"
        />
      </div>

      <div class="m_informations--presentation--instructions">
        <label>
          <button
            type="button"
            class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active': show_instructions }"
            @click="show_instructions = !show_instructions"
          >
            {{ $t("show_instructions") }}
          </button>
        </label>
        <p v-if="show_instructions">
          <small> Texte en cours de rédaction… </small>
        </p>
      </div>

      <!-- {{ introduction_media }} -->

      <div class="m_informations--presentation--introduction">
        <template v-if="!introduction_media">
          <button type="button" @click="createIntroduction">
            {{ $t("create_introduction") }}
          </button>
        </template>
        <template v-else>
          <template v-if="!edit_introduction">
            <div class="ql-editor" v-html="introduction_media.content" />
          </template>
          <template v-else>
            <CollaborativeEditor
              :slugFolderName="slugFolderName"
              :enable_collaboration="true"
              :media="introduction_media"
              :spellcheck="spellcheck"
              @connectionStateChanged="
                (_connection_state) => (connection_state = _connection_state)
              "
              ref="textField"
              :read_only="read_only"
            />
          </template>

          <button type="button" @click="edit_introduction = !edit_introduction">
            {{ $t("edit_introduction_text") }}
          </button>
        </template>
      </div>
    </div>

    <!-- <div
      class="m_informations--buttons"
      v-if="!$root.current_author && $root.state.mode !== 'export_web'"
    >
      <button type="button" @click="$root.showAuthorsListModal = true">
        {{ $t("login").toLowerCase() }}
      </button>
    </div> -->
  </div>
</template>
<script>
import Folder from "./Folder.vue";
import CollaborativeEditor from "./subcomponents/CollaborativeEditor.vue";

export default {
  props: {
    folder: Object,
    slugFolderName: String,
    introduction_media: Object,
  },
  components: {
    Folder,
    CollaborativeEditor,
  },
  data() {
    return {
      currentLang: this.$root.lang.current,
      show_instructions: false,
      edit_introduction: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    currentLang: function () {
      this.$root.updateLocalLang(this.currentLang);
    },
  },
  computed: {},
  methods: {
    createIntroduction() {
      this.$root
        .createMedia({
          slugFolderName: this.slugFolderName,
          type: "folders",
          additionalMeta: {
            type: "introduction",
          },
        })
        .then(() => {
          this.edit_introduction = true;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.m_informations {
  position: relative;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  background-color: var(--color-noir);
  // color: white;

  height: 100%;

  // padding-top: calc(var(--spacing) / 2);
  // padding-bottom: calc(var(--spacing) / 2);

  display: flex;
  flex-flow: column nowrap;

  button,
  input {
    background-color: white;
    color: var(--color-noir);

    &:hover {
      background-color: rgba(210, 210, 210, 1);
    }
  }
}

.m_informations--presentation {
  overflow-y: auto;
  padding: var(--spacing);
  flex: 1 1 auto;
  color: white;

  > * {
    margin: 1em 0;
  }

  .ql-editor {
    padding: 0;
  }
}

.m_informations--buttons {
  flex: 0 0 auto;

  display: flex;
  flex-flow: column nowrap;
  align-items: center;

  padding: calc(var(--spacing) / 2);
  // background-color: white;

  button {
    display: block;
    margin: calc(var(--spacing) / 2);
    padding: calc(var(--spacing) / 2);
    background-color: white;
  }
}

.m_informations--presentation--langSelector {
  select {
    margin-left: auto;
  }
}

.m_informations--presentation--folder {
  // border-left: 2px solid white;
  // margin: calc(var(--spacing) / 2) 0;
}

.m_informations--presentation--instructions {
  button {
    // background-color: transparent;
    // color: inherit;
  }
}
</style>
