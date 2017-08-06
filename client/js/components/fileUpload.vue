<template>
  <dropzone
    :id="uniqueDropzoneID"
    :url="uriToUploadMedia"
    v-on:vdropzone-success="showSuccess"
    class="width-25 margin-small"
  >
      <input type="hidden" name="token" :value="slugFolderName">
  </dropzone>
</template>
<script>
import Dropzone from 'vue2-dropzone';

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
    'showSuccess': function (file) {
      console.log('A file was successfully uploaded')
    }
  }
}



</script>
<style scoped>
</style>
