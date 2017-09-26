<template>
  <div>
    <div class="m_addMedia">
      <button type="button" class="button_small margin-bottom-small button_addText" @click="addText">
        Ajouter du texte
      </button>
      <button type="button" class="button_small margin-bottom-small button_addMarker" @click="addMarker">
        Ajouter un marqueur
      </button>

      <FileUpload
        :slugFolderName="slugFolderName">
      </FileUpload>
    </div>

  </div>
</template>
<script>
import FileUpload from './FileUpload.vue';

export default {
  props: ['slugFolderName'],
  components: {
    FileUpload
  },
  methods: {
    addText() {
      this.$root.createTextMedia({
        slugFolderName: this.slugFolderName
      });
    },
    addMarker() {
      this.$root.createMarker({
        slugFolderName: this.slugFolderName
      });
    }
  }
}
</script>
<style>

</style>