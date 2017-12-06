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
        <label>Début de la capture&nbsp;:</label>
        <DateTime v-model="folderdata.start">
        </DateTime>
      </div>

<!-- End date -->
      <div class="margin-bottom-small">
        <label>Fin de la capture&nbsp;:</label>
        <DateTime v-model="folderdata.end">
        </DateTime>
      </div>

<!-- Password -->
      <div class="margin-bottom-small">
        <label>Mot de passe&nbsp;:</label><br>
        <input type="password" v-model="folderdata.password">
        <small>Si existant, seul les utilisateurs possédant ce mot de passe pourront modifier ce dossier.</small>
      </div>

<!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>Auteur-e(s)&nbsp;:</label><br>
        <textarea v-model="folderdata.authors">
        </textarea>
        <p><small>un-e par ligne</small></p>
      </div>

    </template>

    <template slot="submit_button">
      Créer
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
