<template>
  <Modal
    @close="$emit('close')"
    @submit="editThisFolder"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
  >
    <template slot="header">
      <span class="text-cap">{{ $t("edit_folder") }}</span>
      <i>{{ folder.name }}</i>
    </template>

    <template slot="sidebar">
      <!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t("name") }}</label>
        <input type="text" v-model="folderdata.name" required />
      </div>

      <!-- Access control -->
      <div class="margin-bottom-small">
        <label>{{ $t("manage_access") }}</label>

        <div>
          <EditAccessControl
            :editing_limited_to.sync="folderdata.editing_limited_to"
            :viewing_limited_to.sync="folderdata.viewing_limited_to"
            :password.sync="folderdata.password"
            :can_have_authors="false"
          />
        </div>
      </div>

      <!-- Author(s) -->
      <!-- <div v-if="!read_only && !!folderdata.authors" class="margin-bottom-small">
        <label>{{ $t('author') }}</label>
        <AuthorsInput
          :currentAuthors="folderdata.authors"
          :allAuthors="allAuthors"
          @authorsChanged="newAuthors => folderdata.authors = newAuthors"
        />
      </div>-->
    </template>

    <template slot="submit_button">{{ $t("save") }}</template>
  </Modal>
</template>
<script>
import DateTime from "../subcomponents/DateTime.vue";
import alertify from "alertify.js";
import AuthorsInput from "../subcomponents/AuthorsInput.vue";
import EditAccessControl from "../subcomponents/EditAccessControl.vue";

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    read_only: Boolean,
    allAuthors: Array,
  },
  components: {
    DateTime,
    AuthorsInput,
    EditAccessControl,
  },
  data() {
    return {
      askBeforeClosingModal: false,
      folderdata: {
        name: this.folder.name,
        start: this.$moment(this.folder.start).isValid()
          ? this.folder.start
          : "",
        end: this.$moment(this.folder.end).isValid() ? this.folder.end : "",
        authors: this.folder.authors,
        editing_limited_to: !!this.folder.editing_limited_to
          ? this.folder.editing_limited_to
          : this.folder.password
          ? "with_password"
          : "everybody",
        viewing_limited_to: this.folder.viewing_limited_to,
      },
    };
  },
  watch: {
    folderdata: {
      handler() {
        this.askBeforeClosingModal = true;
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    editThisFolder: function (event) {
      console.log("editThisFolder");

      // only if user changed the name of this folder
      if (this.folderdata.name !== this.folder.name) {
        function getAllFolderNames() {
          let allFoldersName = [];
          for (let slugFolderName in window.store.folders) {
            let foldersName = window.store.folders[slugFolderName].name;
            allFoldersName.push(foldersName);
          }
          return allFoldersName;
        }
        let allFoldersName = getAllFolderNames();

        // check if folder name (not slug) already exists
        if (allFoldersName.indexOf(this.folderdata.name) >= 0) {
          // invalidate if it does
          alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("notifications.folder_name_exists"));
          return false;
        }

        if (this.$slug(this.folderdata.name).length === 0) {
          alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(
              this.$t("notifications.folder_name_needs_alphanumeric_characters")
            );
        }
      }

      this.$root.editFolder({
        type: "folders",
        slugFolderName: this.slugFolderName,
        data: this.folderdata,
      });

      this.$emit("close", "");
    },
  },
  mounted() {},
};
</script>
<style></style>
