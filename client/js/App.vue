<template>
  <div id="app">

    <button type="button" class="button margin-small" @click="showCreateFolderModal = !showCreateFolderModal">
      Create Folder
    </button>

    <CreateFolder v-if="showCreateFolderModal" @close="showCreateFolderModal = false">
    </CreateFolder>

    <Folder v-for="slugFolderName in sortedFoldersSlug" :key="slugFolderName" :slugFolderName="slugFolderName" :folder="$root.store.folders[slugFolderName]">
    </Folder>

  </div>
</template>

<script>
import FileUpload from './components/FileUpload.vue';
import Folder from './components/Folder.vue';
import CreateFolder from './components/modals/CreateFolder.vue';

export default {
  name: 'app',
  data () {
    return {
      showCreateFolderModal: false
    }
  },
  components: {
    FileUpload,
    Folder,
    CreateFolder
  },
  computed: {
    sortedFoldersSlug() {
      var sortable = [];
      for (let folder in this.$root.store.folders) {
        sortable.push(folder);
      }
      return sortable.sort();
    }
  },
  watch: {
  }
}
</script>

<style>
</style>
