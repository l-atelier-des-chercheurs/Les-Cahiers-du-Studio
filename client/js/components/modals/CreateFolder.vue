<template>
  <Modal
    @close="$emit('close')"
    @submit="newFolder"
    >
    <template slot="header">
      <span class="text-cap"> {{ $t('create_a_folder') }}</span>
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
      <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="folderdata.password">
        <small>{{ $t('password_instructions') }}</small>
      </div>

<!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>{{ $t('author') }}</label><br>
        <textarea v-model="folderdata.authors">
        </textarea>
      </div>

    </template>

    <template slot="submit_button">
      {{ $t('create') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import DateTime from '../subcomponents/DateTime.vue';
import alertify from 'alertify.js';

export default {
  components: {
    Modal,
    DateTime
  },
  data() {
    return {
      folderdata: {
        name: '',
        start: this.$moment(),
        end: '',
        password: '',
        authors: ''
      }
    }
  },
  computed: {
  },
  methods: {
    newFolder: function (event) {
      console.log('newFolder');

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

      // copy all values
      let values = this.folderdata;
      values.slugFolderName = this.slugFolderName;

      // if it's all good, collect everything and send over socketio
      this.$root.createFolder(values);

      // then close that popover
      this.$emit('close', '');
    }
  },
}

</script>
<style>
</style>
