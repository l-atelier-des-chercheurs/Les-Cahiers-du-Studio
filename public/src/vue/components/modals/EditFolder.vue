<template>

  <Modal
    @close="$emit('close')"
    @submit="editThisFolder"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
  >
    <template slot="header">
      <span class="text-cap"> {{ $t('edit_folder') }}</span> <i>{{ folder.name }}</i>
    </template>

    <template slot="sidebar">

<!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('name') }}</label>
        <input type="text" v-model="folderdata.name" required :readonly="read_only">
      </div>

<!-- Start date -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('capture_start') }}</label>
        <DateTime v-model="folderdata.start" :twowaybinding=true :read_only="read_only">
        </DateTime>
        <div class="margin-bottom-small">
          <small>
            {{ $t('currently') }}
            <button
              type="button"
              class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
              @click="folderdata.start = $root.currentTime"
            >
              {{ $root.currentTime_human }}
            </button>
          </small>
        </div>
      </div> -->

<!-- End date -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('capture_end') }}</label>
        <DateTime 
          v-model="folderdata.end" 
          :twowaybinding=true 
          :read_only="read_only"
        />
        <div class="margin-bottom-small">
          <small>
            {{ $t('currently') }}
            <button
              type="button"
              class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
              @click="folderdata.end = $root.currentTime"
            >
              {{ $root.currentTime_human }}
            </button>
          </small>
        </div>
      </div> -->

<!-- Password -->
<!--
      <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="folderdata.password" :readonly="read_only">
        <small>{{ $t('password_instructions') }}</small>
      </div>
 -->

<!-- Author(s) -->

      <div v-if="!read_only && !!folderdata.authors" class="margin-bottom-small">
        <label>{{ $t('author') }}</label>
        <AuthorsInput
          :currentAuthors="folderdata.authors"
          :allAuthors="allAuthors"
          @authorsChanged="newAuthors => folderdata.authors = newAuthors"
        />
      </div>

    </template>

    <template slot="submit_button">
      {{ $t('save') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import DateTime from '../subcomponents/DateTime.vue';
import alertify from 'alertify.js';
import AuthorsInput from '../subcomponents/AuthorsInput.vue';

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    read_only: Boolean,
    allAuthors: Array,
  },
  components: {
    Modal,
    DateTime,
    AuthorsInput
  },
  data() {
    return {
      askBeforeClosingModal: false,
      folderdata: {
        name: this.folder.name,
        start: this.$moment(this.folder.start).isValid()
          ? this.folder.start
          : '',
        end: this.$moment(this.folder.end).isValid() ? this.folder.end : '',
        authors: this.folder.authors
      }
    };
  },
  watch: {
    'folderdata': {
      handler() {
        this.askBeforeClosingModal = true;
      },
      deep: true
    }
  },
  computed: {},
  methods: {
    editThisFolder: function(event) {
      console.log('editThisFolder');

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
            .error(this.$t('notifications.folder_name_exists'));
          return false;
        }

        if (this.$slug(this.folderdata.name).length === 0) {
          alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(
              this.$t('notifications.folder_name_needs_alphanumeric_characters')
            );
        }
      }

      this.$root.editFolder({
        type: 'folders',
        slugFolderName: this.slugFolderName, 
        data: this.folderdata 
      });

      this.$emit('close', '');
    }
  },
  mounted() {}
};
</script>
<style>

</style>
