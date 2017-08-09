<template>
  <div class="clearfix">
    <h2 class="margin-small">
      {{ folder.name }}
    </h2>

    <p>
      authorized ? {{ folder.authorized }}
    </p>

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

    <div class="clearfix">
      <button type="button" class="button-small margin-small float-left" @click="loadFolderMedias()">
        Open/close
      </button>
      <button type="button" class="button-small margin-small float-left" @click="debugFolderContent = !debugFolderContent">
        Debug view
      </button>
      <button type="button" class="button-small margin-small float-left" @click="showEditFolderModal = true">
        Edit
      </button>
      <button type="button" class="button-small margin-small float-left" @click="removeFolder()">
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

    <template v-if="$root.settings.folder_currently_opened === slugFolderName">
      <template v-if="loading_folder_medias">
        <span class="loader"></span>
      </template>
      <template v-else>
        <fileUpload
          :slugFolderName="slugFolderName"
        >
        </fileUpload>
        <media
          v-for="(media, index) in folder.medias"
          :key="index"
          :slugFolderName="slugFolderName"
          :slugMediaName="index"
          :media="media"
        >
        </media>
      </template>
    </template>
    <hr>
  </div>
</template>
<script>
import Media from './Media.vue';
import FileUpload from './FileUpload.vue';
import EditFolder from './modals/EditFolder.vue';

/*
  WARNING : since index compiles to an HTML file, we have to use lowercase variables there
  --> which means slugfoldername becomes slugFolderName but only in this file
*/

export default {
  props: ['folder', 'slugFolderName'],
  components: {
    Media,
    FileUpload,
    EditFolder
  },
  data() {
    return {
      debugFolderContent: false,
      showEditFolderModal: false,
      loading_folder_medias: false
    }
  },
  computed: {

  },
  methods: {
    loadFolderMedias() {
      this.$root.loadFolderMedias(this.slugFolderName);
      this.loading_folder_medias = true;
    },
    removeFolder() {
      if(window.confirm(locals.lang.modal.sureToRemoveFolder)) {
        this.$root.removeFolder(this.slugFolderName);
      }
    }
  },
  watch: {
    'folder.medias': function() {
      if(this.loading_folder_medias) { this.loading_folder_medias = false; }
    },
    showEditFolderModal: function() {
      this.$root.has_modal_opened = this.showEditFolderModal;
    }
  },

  computed: {
  }
}
</script>
<style>
</style>