<template>
  <div v-if="this.$root.settings.currentlyOpenedFolder === slugFolderName" class="margin-left-small margin-bottom-small">
    <template v-if="loading_folder_medias">
      <span class="loader margin-small"></span>
    </template>
    <template v-else>
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

    </template>
  </div>
</template>
<script>
import Media from './Media.vue';

export default {
  props: ['folder', 'slugFolderName', 'loading_folder_medias'],

  components: {
    Media,
  }
}
</script>
<style>

</style>