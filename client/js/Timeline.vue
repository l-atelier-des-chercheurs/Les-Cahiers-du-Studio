<template>
  <div class="timeline margin-left-small margin-bottom-small">
<!--
    <template v-if="loading_folder_medias">
      <span class="loader margin-small"></span>
    </template>
    <template v-else>
-->
      <FileUpload
        v-if="((folder.password === 'has_pass' && folder.authorized) || folder.password !== 'has_pass')"
        :slugFolderName="slugFolderName">
      </FileUpload>

      <template v-if="Object.keys(folder.medias).length > 0">
        <media
          v-for="(media, index) in folder.medias"
          :key="index"
          :slugFolderName="slugFolderName"
          :slugMediaName="index"
          :media="media"
        >
        </media>
      </template>
      <template v-else>
        <p>
          <code>
            <template v-if="folder.authorized">
              No medias in this folder.
            </template>
            <template v-else>
              No public medias in this folder
            </template>
          </code>
        </p>
      </template>

<!--
    </template>
-->
  </div>
</template>
<script>
import Media from './components/Media.vue';
import FileUpload from './components/FileUpload.vue';

export default {
  props: ['slugFolderName', 'folder'],
  components: {
    Media,
    FileUpload
  },
  data() {
    return {
//       loading_folder_medias: true,
    }
  },
  watch: {
  }
}
</script>
<style scoped>
.timeline {
  height: 500px;


}


</style>