<template>
  <div class="clearfix">
    <h2 class="margin-small">
      {{ folder.name }}
    </h2>

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
      <button type="button" class="button-small margin-small float-left" @click="showEditFolderModal = !showEditFolderModal">
        Edit
      </button>
      <button type="button" class="button-small margin-small float-left" @click="removeFolder()">
        Remove
      </button>
    </div>

    <EditFolder v-if="showEditFolderModal" @close="showEditFolderModal = false">
    </EditFolder>

    <template v-if="$root.settings.folder_currently_opened === slugFolderName">
      <fileUpload
        :slugFolderName="slugfoldername"
      >
      </fileUpload>
      <media
        v-for="(media, index) in folder.medias"
        :key="index"
        :slugFolderName="slugfoldername"
        :slugMediaName="index"
        :media="media"
      >
      </media>
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
      showEditFolderModal: false
    }
  },
  computed: {

  },
  methods: {
    loadFolderMedias() {
      this.$root.$emit('loadFolderMedias', this.slugFolderName);
    },
    removeFolder() {
      if(window.confirm(locals.lang.modal.sureToRemoveFolder)) {
        this.$root.$emit('removeFolder', this.slugFolderName);
      }
    }
  },

  computed: {
  }
}
</script>
<style>
</style>