<template>
  <div class="m_informations">
    <div class="m_informations--presentation">
      <div class="m_informations--presentation--langSelector">
        <select v-model="currentLang">
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
        <h2
          class="m_folder--title margin-none padding-medium bg-noir c-blanc font-large"
        >
          {{ folder.name }}
        </h2>
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
          <small>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit
            deleniti praesentium ullam quas quidem? Labore debitis assumenda
            quidem, fugit, dolor voluptatibus magni voluptates quae optio vero
            laborum ab nisi facilis.
          </small>
        </p>
      </div>

      <!-- {{ introduction_media }} -->

      <div class="m_informations--presentation--introduction">
        <template v-if="!introduction_media">
          <button type="button" @click="createIntroduction">
            Create introduction
          </button>
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
      </div>
    </div>

    <div
      class="m_informations--buttons"
      v-if="!$root.current_author && $root.state.mode !== 'export_web'"
    >
      <button type="button" @click="$root.showAuthorsListModal = true">
        {{ $t("login").toLowerCase() }}
      </button>
    </div>
  </div>
</template>
<script>
import CollaborativeEditor from "./subcomponents/CollaborativeEditor.vue";

export default {
  props: {
    folder: Object,
    slugFolderName: String,
    introduction_media: Object,
  },
  components: {
    CollaborativeEditor,
  },
  data() {
    return {
      currentLang: this.$root.lang.current,
      show_instructions: false,
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
      this.$root.createMedia({
        slugFolderName: this.slugFolderName,
        type: "folders",
        additionalMeta: {
          type: "introduction",
        },
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
  color: white;

  height: 100%;

  // padding-top: calc(var(--spacing) / 2);
  // padding-bottom: calc(var(--spacing) / 2);

  display: flex;
  flex-flow: column nowrap;

  button,
  input,
  select {
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
}

.m_informations--presentation--langSelector {
  max-width: 14ch;
  margin-left: auto;
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
</style>
