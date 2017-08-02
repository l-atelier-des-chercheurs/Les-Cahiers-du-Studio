<template>
  <dropzone :id="uniqueDropzoneID" :url="uriToUploadMedia" v-on:vdropzone-success="showSuccess">
      <input type="hidden" name="token" value="xxx">
  </dropzone>
</template>
<script>
import Dropzone from 'vue2-dropzone'

export default {
  name: 'MainApp',
  components: {
    Dropzone
  },
  computed: {
    uniqueDropzoneID: () => {
      return 'myVueDropzone_' + Math.ceil((Math.random() * 1000));
    },
    uriToUploadMedia: function() {
      return this.$parent._props.slug + '/file-upload';
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
