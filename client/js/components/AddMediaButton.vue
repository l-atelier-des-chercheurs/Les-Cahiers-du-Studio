<template>
  <div>

    <div class="m_fileupload">
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
  }
}
</script>
<style>

</style>