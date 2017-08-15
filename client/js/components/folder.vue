<template>
  <div class="folder">
    <h2 class="">
      {{ folder.name }}
      <br>
      <mark class="" v-if="folder.password === 'has_pass'">
        password-protected
      </mark>
    </h2>

    <div class="">
      <table class="">
        <tbody>
          <tr>
            <td :class="{ 'is--active' : $parent.sort.field === 'created' }">Created: {{ formatDateToHuman(folder.created) }}</td>
            <td :class="{ 'is--active' : $parent.sort.field === 'start' }">Start: {{ formatDateToHuman(folder.start) }}</td>
            <td :class="{ 'is--active' : $parent.sort.field === 'end' }">End: {{ formatDateToHuman(folder.end) }}</td>
            <td>Authors: {{ folder.authors }}</td>
            <td>Folder name: {{ folder.slugFolderName }}</td>
          </tr>
        </tbody>
      </table>
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

    <div class="clearfix margin-small">
      <button type="button" class="button-small" @click="$root.openFolder(slugFolderName)">
        Open
      </button>

      <button v-if="!folder.authorized" type="button" class="button-small" @click="showInputPasswordField = !showInputPasswordField">
        Input password
      </button>
      <div v-show="showInputPasswordField" class="input-group" style="width: 250px;">
        <input type="password" ref="passwordField" @keyup.enter="submitPassword" autofocus>
        <button type="button" class="button" @click="submitPassword">Submit</button>
      </div>
      <button v-if="folder.authorized" type="button" class="button-small" @click="debugFolderContent = !debugFolderContent">
        Debug view
      </button>
      <button v-if="folder.authorized" type="button" class="button-small" @click="showEditFolderModal = true">
        Edit
      </button>
      <button v-if="folder.authorized" type="button" class="button-small" @click="removeFolder()">
        Remove
      </button>
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
.folder {
  border:2px solid white;
}
.is--active {
  color: #ff0000;
}
</style>