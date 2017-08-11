<template>
  <div class="clearfix folder margin-small">
    <h2 class="margin-small">
      {{ folder.name }}
      <mark class="text-small" v-if="folder.password === 'has_pass'">
        password-protected
      </mark>
    </h2>

    <div class="margin-small">
      <table class="table-bordered text-small">
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

    <table v-if="debugFolderContent" class="table-striped margin-small">
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
      <button type="button" class="button-small" @click="openFolder()">
        Open
      </button>

      <button v-if="!folder.authorized" type="button" class="button-small" @click="showInputPasswordField = !showInputPasswordField">
        Input password
      </button>
      <div v-if="showInputPasswordField" class="input-group" style="width: 250px;">
        <input type="password" ref="passwordField" @keyup.enter="submitPassword">
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

    <FileUpload v-if="(folder.password === 'has_pass' && folder.authorized) || folder.password !== 'has_pass'" :slugFolderName="slugFolderName">
      <slot>
        Upload a media
      </slot>
    </FileUpload>

    <TimeLine
      :slugFolderName="slugFolderName"
      :folder="folder"
      :loading_folder_medias="loading_folder_medias"
    >
    </TimeLine>

  </div>
</template>
<script>
import FileUpload from './FileUpload.vue';
import EditFolder from './modals/EditFolder.vue';
import TimeLine from './TimeLine.vue';
import moment from 'moment';

/*
  WARNING : since index compiles to an HTML file, we have to use lowercase variables there
  --> which means slugfoldername becomes slugFolderName but only in this file
*/

export default {
  props: ['folder', 'slugFolderName'],
  components: {
    FileUpload,
    EditFolder,
    TimeLine
  },
  data() {
    return {
      debugFolderContent: false,
      showEditFolderModal: false,
      loading_folder_medias: false,
      showInputPasswordField: false
    }
  },
  methods: {
    formatDateToHuman(date) {
      return moment(date).calendar();
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
    'folder.medias': function() {
      if(this.loading_folder_medias) { this.loading_folder_medias = false; }
    },
  },
}
</script>
<style scoped>
.folder {
  background-color: #f2f2f2;
  border: 0px solid #eee;
  border-top-width:1px;
  border-bottom-width: 1px;
}

.is--active {
  font-weight: bold;
}
</style>