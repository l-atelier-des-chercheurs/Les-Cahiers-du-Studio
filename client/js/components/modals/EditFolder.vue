<template>

  <Modal
    @close="$emit('close')"
    @submit="editThisFolder"
    >
    <template slot="header">
      <span class="text-cap"> {{ $t('edit_folder') }}</span><br>
      <i>{{ folder.name }}</i>
    </template>

    <template slot="sidebar">

<!-- Human name -->
      <div class="margin-bottom-small">
        <label>Nom&nbsp;:</label>
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
<!--
      <div class="margin-bottom-small">
        <label>Mot de passe&nbsp;:</label><br>
        <input type="password" v-model="folderdata.password">
        <small>Si existant, seul les utilisateurs possédant ce mot de passe pourront modifier ce dossier.</small>
      </div>
 -->

<!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>Auteur-e(s)&nbsp;:<small>un-e par ligne</small></label><br>
        <textarea v-model="folderdata.authors">
        </textarea>
      </div>

    </template>

    <template slot="submit_button">
      Enregistrer
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import DateTime from '../subcomponents/DateTime.vue';
import alertify from 'alertify.js';
import slug from 'slugg';

export default {
  props: ['slugFolderName', 'folder'],
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
