<template>
  <Modal @close="$emit('close')">
    <div slot="header">
      Éditer un dossier
    </div>

    <form slot="body" v-on:submit.prevent="editThisFolder">
<!-- Human name -->
      <div class="input-single">
        <label>Nom</label>
        <input type="text" v-model="folderdata.name" required>
      </div>

<!-- Start date -->
      <div class="input-single">
        <label>Début</label>
        <DateTime v-model="folderdata.start">
        </DateTime>
      </div>

<!-- End date -->
      <div class="input-single">
        <label>Fin</label>
        <DateTime v-model="folderdata.end">
        </DateTime>
      </div>

<!-- Password -->
<!--
      <div class="input-single">
        <label>Mot de passe</label><br>
        <input type="password" v-model="folderdata.password">
        <small>Si existant, seul les utilisateurs possédant ce mot de passe pourront modifier ce dossier.</small>
      </div>
 -->

<!-- Author(s) -->
      <div class="input-single">
        <label>Auteur(s)</label><br>
        <small>un par ligne</small>
        <textarea v-model="folderdata.authors">
        </textarea>
      </div>

      <small>
        les champs comportant un <sup class="c_rouge">o</sup> sont requis<br>
        ils peuvent aussi être édités plus tard
      </small>

      <div>
        <button type="submit" class="m_modal-default-button button-success c_bleu">
          Mettre à jour
        </button>
        <button type="button" class="m_modal-default-button" @click.prevent="$emit('close')">
          Annuler
        </button>
      </div>

    </form>

    <div slot="footer">
    </div>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import DateTime from '../subcomponents/DateTime.vue';
import alertify from 'alertify.js';
import slug from 'slugg';
import moment from 'moment';

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
        start: moment(this.folder.start).isValid() ? this.folder.start:'',
        end: moment(this.folder.end).isValid() ? this.folder.end:'',
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

.two-column {
  column-count: 2;
  column-gap: 1rem;
}

@media (max-width: 50rem) {
  .two-column {
    column-count: 1;
    column-gap: 0;
  }
}
</style>
