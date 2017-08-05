<template>
  <div id="app">

    <CreateFolder @createFolder="createFolder">
    </CreateFolder>

    <Folder v-for="(folder, index) in store.folders" :key="index" :slugFolderName="index" :folder="folder" @openFolder="openFolder">
    </Folder>
  </div>
</template>

<script>
import FileUpload from './components/FileUpload.vue';
import Folder from './components/Folder.vue';
import CreateFolder from './components/CreateFolder.vue';

export default {
  name: 'app',
  data () {
    return {
      store: window.store.state,
      settings: {
        folder_currently_opened: ''
      },
    }
  },
  components: {
    FileUpload,
    Folder,
    CreateFolder
  },
  methods: {
    openFolder: function(slugFolderName) {
      if(window.store.debug) { console.log(`ROOT EVENT: openFolder: ${slugFolderName}`); }

      if(this.settings.folder_currently_opened !== slugFolderName) {
        window.socketio.listMedias(slugFolderName);
        this.settings.folder_currently_opened = slugFolderName;
      } else {
        this.settings.folder_currently_opened = '';
      }
    },
    createFolder: function(fdata) {
      if(window.store.debug) { console.log(`ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`); }
      window.socketio.createFolder(fdata);
    },


  },
  watch: {
  }
}
</script>

<style>
</style>
