<template>
  <Modal
    @close="$emit('close')"
    @submit="newFolder"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
    :is_loading="is_sending_content_to_server"
  >
    <template slot="header">
      <span class="text-cap">{{ $t("create_a_folder") }}</span>
    </template>

    <template slot="sidebar">
      <!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t("name") }}</label>
        <input type="text" v-model="folderdata.name" required autofocus />
      </div>

      <!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>{{ $t("author") }} </label>

        <div>
          <AuthorsInput :currentAuthors.sync="folderdata.authors" />
          <small v-html="$t('author_instructions')" />
        </div>
      </div>

      <!-- Access control -->
      <div class="margin-bottom-small">
        <label>{{ $t("manage_access") }}</label>

        <div>
          <EditAccessControl
            :editing_limited_to.sync="folderdata.editing_limited_to"
            :viewing_limited_to.sync="folderdata.viewing_limited_to"
            :password.sync="folderdata.password"
            :authors.sync="folderdata.authors"
          />
        </div>
      </div>

      <!-- Password -->
      <!-- <div class="margin-bottom-small">
        <input type="checkbox" id="enable_password" v-model="show_password_field" />
        <label for="enable_password">{{ $t('password') }}</label>
        <template v-if="show_password_field">
          <input type="password" v-model="folderdata.password" />
          <small>{{ $t('password_instructions') }}</small>
        </template>
      </div>-->
    </template>

    <template slot="submit_button">{{ $t("create") }}</template>
  </Modal>
</template>
<script>
import DateTime from "../subcomponents/DateTime.vue";
import alertify from "alertify.js";
import EditAccessControl from "../subcomponents/EditAccessControl.vue";
import AuthorsInput from "../subcomponents/AuthorsInput.vue";

export default {
  props: {
    read_only: Boolean,
  },
  components: {
    DateTime,
    EditAccessControl,
    AuthorsInput,
  },
  data() {
    return {
      askBeforeClosingModal: false,

      is_sending_content_to_server: false,
      folderdata: {
        name: "",
        password: "",
        authors: "",
        editing_limited_to: "everybody",
        viewing_limited_to: "everybody",
      },
    };
  },
  watch: {
    folderdata: {
      handler() {
        // this.askBeforeClosingModal = true;
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    newFolder: function (event) {
      console.log("newFolder");

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

      this.is_sending_content_to_server = true;

      this.$root
        .createFolder({
          type: "folders",
          data: this.folderdata,
        })
        .then((fdata) => {
          this.$emit("close", "");
          this.$root.openFolder(fdata.slugFolderName);
          this.$root.createMedia({
            slugFolderName: fdata.slugFolderName,
            type: "folders",
            additionalMeta: {
              type: "marker",
              color: "red",
              content: this.$t("creation_of_the_timeline"),
            },
          });
        });
    },
  },
};
</script>
<style></style>
