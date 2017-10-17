<template>
  <div class="m_folder">
    <h2 class="m_folder--title margin-none padding-medium bg-dark c_blanc font-large">
      {{ folder.name }}
    </h2>

    <div class="margin-medium">
      <mark class="" v-if="folder.password === 'has_pass'">
        protégé par mot de passe
      </mark>

      <div class="folder_metapreview margin-small margin-left-none">
        <i>Date de création&nbsp;:</i><br>
        {{ formatDateToHuman(folder.created) }}
      </div>

      <div class="input-group">
        <button type="button" class="button-small" @click="$root.openFolder(slugFolderName)">
          Ouvrir
        </button>

        <button v-if="!folder.authorized" type="button" class="button-small" @click="showInputPasswordField = !showInputPasswordField">
          Entrer un mot de passe
        </button>
  <!--
        <button v-if="folder.authorized" type="button" class="button-small" @click="debugFolderContent = !debugFolderContent">
          Vue de debug
        </button>
  -->
        <button v-if="folder.authorized" type="button" class="button-small" @click="showEditFolderModal = true">
          Éditer
        </button>
        <button v-if="folder.authorized" type="button" class="button-small" @click="removeFolder()">
          Supprimer
        </button>
      </div>
      <div v-if="showInputPasswordField" class="input-group">
        <input type="password" ref="passwordField" @keyup.enter="submitPassword" autofocus>
        <button type="button" class="button-small" @click="submitPassword">Envoyer</button>
      </div>

      <EditFolder
        v-if="showEditFolderModal"
        :folder="folder"
        :slugFolderName="slugFolderName"
        @close="showEditFolderModal = false"
      >
      </EditFolder>
    </div>
  </div>
</template>
<script>
import EditFolder from './modals/EditFolder.vue';
import moment from 'moment';
require('moment/locale/fr')

export default {
  props: ['folder', 'slugFolderName'],
  components: {
    EditFolder,
  },
  data() {
    return {
      debugFolderContent: false,
      showEditFolderModal: false,
      showInputPasswordField: false
    }
  },
  methods: {
    formatDateToHuman(date) {
      return moment(date, 'YYYY-MM-DD HH:mm:ss').calendar();
    },
    openFolder() {
      this.$root.openFolder(this.slugFolderName);
    },
    closeFolder() {
      this.$root.closeFolder();
    },
    removeFolder() {
      if(window.confirm(locals.lang.modal.sureToRemoveFolder)) {
        this.$root.removeFolder(this.slugFolderName);
      }
    },
    submitPassword() {
      auth.updateAdminAccess({ [this.slugFolderName]: this.$refs.passwordField.value });
      window.socketio.sendAuth();
      this.showInputPasswordField = false;
    }
  },
  watch: {
  },
}
</script>
<style scoped>
</style>