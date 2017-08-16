<template>
  <div class="folder">
    <h2 class="">
      {{ folder.name }}
      <br>
      <mark class="" v-if="folder.password === 'has_pass'">
        protégé par mot de passe
      </mark>
    </h2>

    <div class="folder_metapreview margin-medium margin-left-none">
      Créé {{ formatDateToHuman(folder.created) }}
    </div>

    <table v-if="debugFolderContent" class="">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Values</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, key) in folder">
          <tr>
            <td>{{ key }}</td>
            <td>{{ item }}</td>
          </tr>
        </template>
      </tbody>
    </table>

    <div class="input-group">
      <button type="button" class="button_small" @click="$root.openFolder(slugFolderName)">
        Open
      </button>

      <button v-if="!folder.authorized" type="button" class="button_small" @click="showInputPasswordField = !showInputPasswordField">
        Input password
      </button>
      <button v-if="folder.authorized" type="button" class="button_small" @click="debugFolderContent = !debugFolderContent">
        Debug view
      </button>
      <button v-if="folder.authorized" type="button" class="button_small" @click="showEditFolderModal = true">
        Edit
      </button>
      <button v-if="folder.authorized" type="button" class="button_small" @click="removeFolder()">
        Remove
      </button>
    </div>
      <div v-show="showInputPasswordField" class="input-group" style="width: 250px;">
        <input type="password" ref="passwordField" @keyup.enter="submitPassword" autofocus>
        <button type="button" class="button" @click="submitPassword">Submit</button>
      </div>

    <EditFolder
      v-if="showEditFolderModal"
      :folder="folder"
      :slugFolderName="slugFolderName"
      @close="showEditFolderModal = false"
    >
    </EditFolder>
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
      return moment(date, 'YYYY-MM-DD HH:mm').calendar();
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