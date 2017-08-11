<template>
  <dropzone
    :id="uniqueDropzoneID"
    :url="uriToUploadMedia"
    v-on:vdropzone-success="showSuccess"
    v-on:vdropzone-sending="addMeta"
    :maxFileSizeInMB="50"
    class="dropzone margin-right-small margin-bottom-small"
  >
    <input type="hidden">
  </dropzone>
</template>
<script>
import Dropzone from 'vue2-dropzone';
import alertify from 'alertify.js';

export default {
  props: ['slugFolderName'],
  components: {
    Dropzone
  },
  computed: {
    uniqueDropzoneID: function() {
      return 'myVueDropzone_' + Math.ceil((Math.random() * 1000));
    },
    uriToUploadMedia: function() {
      return this.slugFolderName + '/file-upload';
    },
  },
  methods: {
    showSuccess: function (file) {
      alertify
        .closeLogOnClick(true)
        .delay(4000)
        .log('A file was successfully uploaded.')
        ;
    },
    addMeta: function (file, xhr, formData) {
      // Testing for 'function' is more specific and correct, but doesn't work with Safari 6.x
      if (typeof window.FileReader !== 'function' && typeof window.FileReader !== 'object') {
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(`Reading files not supported in this browser. Additional Meta like creation date won’t be sent.`)
          ;
        return;
      }

      let fileCreationDate = file.lastModified;
      let fileName = file.name;
      let objToSend = {
        fileCreationDate
      }
      formData.append(fileName, JSON.stringify(objToSend));
    }
  }
}
</script>
<style scoped>
.dropzone {

}
</style>
