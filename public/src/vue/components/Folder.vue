<template>
  <div class="m_folder">
    <h2
      class="m_folder--title margin-none padding-medium bg-noir c-blanc font-large"
      @click="context !== 'full' ? $root.openFolder(slugFolderName) : ''"
    >
      {{ folder.name }}
    </h2>

    <div class="font-small">
      <div class="margin-sides-medium margin-vert-small">
        <mark class v-if="folder.password === 'has_pass'">
          {{ $t("protected_by_pass") }}
        </mark>
      </div>

      <div class="margin-sides-medium margin-vert-small">
        <DateField :title="'created_date'" :date="folder.created" />
      </div>
      <div class="margin-sides-medium margin-vert-small">
        <DateField :title="'last_modified'" :date="folder.date_modified" />
      </div>
      <div
        class="m_metaField margin-sides-medium"
        v-if="!!folder.authors && Array.isArray(folder.authors)"
      >
        <div>{{ $t("author") }}</div>

        <AuthorsInput :currentAuthors="folder.authors" :read_only="true" />
      </div>

      <hr class="margin-small margin-sides-medium" />

      <div
        class="margin-small flex-wrap flex-vertically-start flex-horizontally-start"
      >
        <button
          v-if="can_see_folder && context !== 'full'"
          type="button"
          :disabled="read_only"
          class="button-round margin-verysmall padding-verysmall"
          @click="$root.openFolder(slugFolderName)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="46.99"
            height="46.99"
            viewBox="0 0 46.99 46.99"
          >
            <g id="Calque_2" data-name="Calque 2">
              <g id="Content">
                <g>
                  <circle cx="23.5" cy="23.5" r="23" style="fill: #fff" />
                  <circle
                    cx="23.5"
                    cy="23.5"
                    r="23"
                    style="fill: none; stroke: #4d4d4d; stroke-miterlimit: 10"
                  />
                </g>
                <polyline
                  points="33.33 23.74 33.33 33.96 23.11 33.96 12.88 33.96 12.88 23.74 12.88 13.52 23.11 13.52"
                  style="fill: none; stroke: #333; stroke-miterlimit: 10"
                />
                <polyline
                  points="26.73 13.52 33.33 13.52 33.33 20.12"
                  style="fill: none; stroke: #333; stroke-miterlimit: 10"
                />
                <line
                  x1="33.05"
                  y1="13.89"
                  x2="22.1"
                  y2="24.83"
                  style="fill: none; stroke: #333; stroke-miterlimit: 10"
                />
              </g>
            </g>
          </svg>
          <span class="text-cap font-verysmall">{{ $t("open") }}</span>
        </button>

        <button
          v-if="can_edit_folder && context === 'full'"
          type="button"
          class="button-round margin-verysmall padding-verysmall"
          @click="showEditFolderModal = true"
          :disabled="read_only"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="46.99"
            height="46.99"
            viewBox="0 0 46.99 46.99"
          >
            <g>
              <circle cx="23.5" cy="23.5" r="23" style="fill: #fff" />
              <circle
                cx="23.5"
                cy="23.5"
                r="23"
                style="fill: none; stroke: #4d4d4d; stroke-miterlimit: 10"
              />
            </g>
            <g>
              <polygon
                points="17.91 33.77 13.32 34.3 13.85 29.71 22.36 21.2 30.86 12.69 32.9 14.72 34.93 16.76 26.42 25.26 17.91 33.77"
                style="fill: none; stroke: #333; stroke-miterlimit: 10"
              />
              <line
                x1="16.13"
                y1="27.43"
                x2="20.19"
                y2="31.49"
                style="fill: none; stroke: #333; stroke-miterlimit: 10"
              />
            </g>
          </svg>
          <span class="text-cap font-verysmall">{{ $t("edit") }}</span>
        </button>
        <button
          v-if="can_edit_folder && context === 'full'"
          type="button"
          class="button-round margin-verysmall padding-verysmall"
          @click="removeFolder()"
          :disabled="read_only"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="49"
            height="49"
            viewBox="0 0 49 49"
          >
            <g>
              <circle cx="24.5" cy="24.5" r="24" style="fill: #fff" />
              <circle
                cx="24.5"
                cy="24.5"
                r="24"
                style="fill: none; stroke: #4d4d4d; stroke-miterlimit: 10"
              />
            </g>
            <g>
              <path
                d="M16.79,35.19l-.72-16.86H33l-.72,16.86a1.42,1.42,0,0,1-1.46,1.31H18.25A1.42,1.42,0,0,1,16.79,35.19Z"
                style="fill: none; stroke: #333; stroke-miterlimit: 10"
              />
              <path
                d="M20.83,15.41v-2a.89.89,0,0,1,.92-.86h5.52a.89.89,0,0,1,.92.86v2Z"
                style="fill: none; stroke: #333; stroke-miterlimit: 10"
              />
              <line
                x1="20.75"
                y1="34.18"
                x2="20.75"
                y2="21.01"
                style="fill: none; stroke: #333; stroke-miterlimit: 10"
              />
              <line
                x1="24.66"
                y1="34.18"
                x2="24.66"
                y2="21.01"
                style="fill: none; stroke: #333; stroke-miterlimit: 10"
              />
              <line
                x1="28.58"
                y1="34.18"
                x2="28.58"
                y2="21.01"
                style="fill: none; stroke: #333; stroke-miterlimit: 10"
              />
              <line
                x1="14"
                y1="15.41"
                x2="35"
                y2="15.41"
                style="fill: none; stroke: #333; stroke-miterlimit: 10"
              />
            </g>
          </svg>
          <span class="text-cap font-verysmall">{{ $t("remove") }}</span>
        </button>
      </div>

      <AccessController
        :folder="folder"
        :context="context"
        :type="'folders'"
        @openFolder="openFolder"
        @closeFolder="closeFolder"
      />

      <EditFolder
        v-if="showEditFolderModal"
        :folder="folder"
        :slugFolderName="slugFolderName"
        :allAuthors="folder.authors"
        @close="showEditFolderModal = false"
        :read_only="read_only"
      ></EditFolder>
    </div>
  </div>
</template>
<script>
import EditFolder from "./modals/EditFolder.vue";
import AccessController from "./subcomponents/AccessController.vue";
import AuthorsInput from "./subcomponents/AuthorsInput.vue";

export default {
  props: {
    folder: Object,
    context: String,
    slugFolderName: String,
    read_only: Boolean,
    sort_field: String,
  },
  components: {
    EditFolder,
    AccessController,
    AuthorsInput,
  },
  data() {
    return {
      debugFolderContent: false,
      showEditFolderModal: false,
      showInputPasswordField: false,
    };
  },
  computed: {
    can_edit_folder() {
      return this.$root.canEditFolder({
        type: "folders",
        slugFolderName: this.slugFolderName,
      });
    },
    can_see_folder() {
      return this.$root.canSeeFolder({
        type: "folders",
        slugFolderName: this.slugFolderName,
      });
    },
  },
  methods: {
    openFolder() {
      this.$root.openFolder(this.slugFolderName);
    },
    closeFolder() {
      this.$root.closeFolder();
    },
    removeFolder() {
      if (window.confirm(this.$t("sureToRemoveFolder"))) {
        this.$root.removeFolder({
          type: "folders",
          slugFolderName: this.slugFolderName,
        });
        this.$root.closeFolder();
      }
    },
    submitPassword() {
      console.log("METHODS • Project: submitPassword");

      this.$auth.updateFoldersPasswords({
        folders: {
          [this.slugFolderName]: this.$refs.passwordField.value,
        },
      });
      this.$socketio.sendAuth();

      // check if password matches or not
      this.$eventHub.$once("socketio.authentificated", () => {
        const has_passworded_folder = window.state.list_authorized_folders.filter(
          (f) =>
            f.type === "folders" &&
            f.allowed_slugFolderNames.includes(this.slugFolderName)
        );
        if (has_passworded_folder.length === 0) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(
              this.$t("notifications.wrong_password_for_folder:") +
                this.folder.name
            );
          this.$refs.passwordField.value = "";
        } else {
          this.$root.openFolder(this.slugFolderName);
        }
      });
    },
  },
  watch: {},
};
</script>
<style scoped>
.m_folder {
  background: white;
  color: var(--c-noir);
}
</style>
