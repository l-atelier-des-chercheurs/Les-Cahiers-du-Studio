<template>

  <Modal
    @close="$emit('close')"
    @submit="editThisFolder"
    :read_only="read_only"
    >
    <template slot="header">
      <span class="text-cap"> {{ $t('edit_folder') }}</span> <i>{{ folder.name }}</i>
    </template>

    <template slot="sidebar">

<!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('name') }}</label>
        <input type="text" v-model="folderdata.name" required>
      </div>

<!-- Start date -->
      <div class="margin-bottom-small">
        <label>{{ $t('capture_start') }}</label>
        <DateTime v-model="folderdata.start">
        </DateTime>
      </div>

<!-- End date -->
      <div class="margin-bottom-small">
        <label>{{ $t('capture_end') }}</label>
        <DateTime v-model="folderdata.end">
        </DateTime>
      </div>

<!-- Password -->
<!--
      <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="folderdata.password">
        <small>{{ $t('password_instructions') }}</small>
      </div>
 -->

<!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>{{ $t('author') }}</label><br>
        <textarea v-model="folderdata.authors">
        </textarea>
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
import slug from 'slugg';

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    read_only: Boolean
  },
  components: {
    Modal,
    DateTime
  },
  data() {
    return {
      folderdata: {
        name: this.folder.name,
        start: this.$moment(this.folder.start).isValid() ? this.folder.start:'',
        end: this.$moment(this.folder.end).isValid() ? this.folder.end:'',
        authors: this.folder.authors
      }
    }
  },
  computed: {
  },
  methods: {
    editThisFolder: function (event) {
      console.log('editThisFolder');

      // only if user changed the name of this folder
      if(this.folderdata.name !== this.folder.name) {
        function getAllFolderNames() {
          let allFoldersName = [];
          for (let slugFolderName in window.store.state.folders) {
            let foldersName = window.store.state.folders[slugFolderName].name;
            allFoldersName.push(foldersName);
          }
          return allFoldersName;
        }
        let allFoldersName = getAllFolderNames();

        // check if folder name (not slug) already exists
        if(allFoldersName.indexOf(this.folderdata.name) >= 0) {
          // invalidate if it does
          alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error('Folder name already exists. Please use another.')
            ;
          return false;
        }

        if(slug(this.folderdata.name).length === 0) {
          alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error('Folder name needs to contain alphanumeric characters.')
            ;
        }
      }

      // copy all values
      let values = this.folderdata;

      values.slugFolderName = this.slugFolderName;

      // if it's all good, collect everything and send over socketio
      this.$root.editFolder(values);

      // then close that popover
      this.$emit('close', '');
    }
  },
  mounted() {
  }
}

</script>
<style>
</style>
