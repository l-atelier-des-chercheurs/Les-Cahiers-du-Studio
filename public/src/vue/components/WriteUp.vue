<template>
  <div class="m_sidebar m_sidebar_journal" ref="sidebar">
    <section class="bg-noir_light c-blanc padding-medium">
      <header class="margin-vert-small">
        <div class="flex-vertically-centered">
          <h3 class="margin-none text-cap with-bullet">{{ $t('journal') }}</h3>
        </div>
      </header>
      <div class>
        <table class v-if="mode === 'writeup_list'">
          <thead>
            <tr>
              <th style>{{ $t('name') }}</th>
              <th>{{ $t('last_modified') }}</th>
              <th>
                <!-- {{ $t('action') }} -->
              </th>
            </tr>
          </thead>
          <transition-group tag="tbody" name="list-complete">
            <tr v-for="w in writeup_medias" :key="w.metaFileName">
              <td>{{ w.name }}</td>
              <td>{{ $moment(w.date_modified).format('l LTS') }}</td>
              <td>
                <button
                  type="button"
                  class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
                  @click="openWriteupMedia(w.metaFileName)"
                >{{ $t('open') }}</button>
              </td>
            </tr>
            <tr :key="'create'">
              <template v-if="!show_createwriteup_section">
                <td colspan="3">
                  <button
                    type="button"
                    class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
                    @click="show_createwriteup_section = !show_createwriteup_section"
                  >{{ $t('create') }}</button>
                </td>
              </template>

              <template v-else>
                <td colspan="2">
                  <input type="text" class="input-xs" ref="nameInput" />
                </td>
                <td>
                  <button
                    type="button"
                    class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
                    @click="createWriteupMedia"
                  >{{ $t('create') }}</button>
                </td>
              </template>
            </tr>
          </transition-group>
        </table>
        <div v-else-if="mode === 'single_writeup'" class="margin-small text-centered">
          <button
            type="button"
            class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
            @click="closeWriteupMedia"
          >{{ $t('back_to_list') }}</button>
        </div>
      </div>

      <WriteUpEditor
        v-if="current_writeup_media"
        class="bg-blanc c-noir"
        :slugFolderName="slugFolderName"
        :media="current_writeup_media"
        :readonly="read_only"
        @close="closeWriteupMedia"
      />
    </section>
  </div>
</template>
<script>
import WriteUpEditor from "./subcomponents/WriteUpEditor.vue";
import SidebarSection from "./sidebar/SidebarSection.vue";

export default {
  props: {
    slugFolderName: String,
    medias: Object
  },
  components: {
    WriteUpEditor,
    SidebarSection
  },
  data() {
    return {
      show_createwriteup_section: false,
      current_writeup_media_metaFileName: false
    };
  },

  created() {},
  mounted() {
    if (this.$root.state.mode === "export_web") {
      if (typeof this.medias === "object") {
        // check how many writeups there are
        const writeups = Object.values(this.medias).filter(
          media => media.hasOwnProperty("type") && media.type === "writeup"
        );

        if (writeups && writeups.length === 1) {
          this.openWriteupMedia(writeups[0].metaFileName);
        }
      }
    }
  },
  beforeDestroy() {},

  watch: {},
  computed: {
    writeup_medias() {
      return Object.values(this.medias)
        .filter(m => m.type === "writeup")
        .sort((a, b) => a.date_modified.localeCompare(b.date_modified));
    },
    current_writeup_media() {
      if (this.current_writeup_media_metaFileName === false) return false;
      return Object.values(this.medias).filter(
        m => m.metaFileName === this.current_writeup_media_metaFileName
      )[0];
    },
    mode() {
      if (this.current_writeup_media_metaFileName) {
        return "single_writeup";
      }
      return "writeup_list";
    }
  },
  methods: {
    textChange(delta, oldDelta, source) {
      // if source === 'user'
    },
    createWriteupMedia() {
      if (window.state.dev_mode === "debug") {
        console.log("METHODS • AddMediaButton: createWriteupMedia");
      }

      let name = this.$refs.nameInput.value;
      if (!name) {
        name = this.$t("untitled_document");
      }

      if (this.writeup_medias.filter(w => w.name === name).length > 0) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.document_name_exists"));
        return false;
      }

      this.show_createwriteup_section = false;

      this.$eventHub.$on("socketio.media_created_or_updated", m =>
        this.openWriteupMedia(m.metaFileName)
      );
      this.$root.createMedia({
        slugFolderName: this.slugFolderName,
        type: "folders",
        additionalMeta: {
          name,
          type: "writeup"
        }
      });
    },
    openWriteupMedia(metaFileName) {
      if (window.state.dev_mode === "debug") {
        console.log(`METHODS • WriteUp: openWriteupMedia / ${metaFileName}`);
      }

      this.current_writeup_media_metaFileName = false;
      this.$nextTick(() => {
        this.current_writeup_media_metaFileName = metaFileName;
      });
    },
    closeWriteupMedia() {
      if (window.state.dev_mode === "debug") {
        console.log(`METHODS • WriteUp: openWriteupMedia`);
      }

      this.current_writeup_media_metaFileName = false;
    }
  }
};
</script>
<style>
</style>