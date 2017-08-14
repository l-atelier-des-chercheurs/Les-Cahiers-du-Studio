<template>
  <div class="timeline margin-left-small margin-bottom-small" :style="timelineStyles">
<!--
    <template v-if="loading_folder_medias">
      <span class="loader margin-small"></span>
    </template>
    <template v-else>
-->
      <div class="m_fileupload">
        <FileUpload
          v-if="((folder.password === 'has_pass' && folder.authorized) || folder.password !== 'has_pass')"
          :slugFolderName="slugFolderName">
        </FileUpload>
      </div>

      <div v-if="Object.keys(folder.medias).length > 0">
        <div class="mediaWrap" v-for="(media, index) in folder.medias"
          :style="getMediaPosition(media)"
        >
          <media
            :key="index"
            :slugFolderName="slugFolderName"
            :slugMediaName="index"
            :media="media"
          >
          </media>
        </div>
      </div>
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
import moment from 'moment';

export default {
  props: ['slugFolderName', 'folder'],
  components: {
    Media,
    FileUpload
  },
  data() {
    return {
//       loading_folder_medias: true,
      timelineStyles: {
        width: '500vh',
        height: '100vh'
      },
      timelineInfos: {
        start: moment(this.folder.start,'YYYY-MM-DD HH:mm'),
        end:   moment(this.folder.end,'YYYY-MM-DD HH:mm'),
      }
    }
  },
  methods: {
    getMediaPosition(media) {
      let msSinceStart = moment(media.created,'YYYY-MM-DD HH:mm') - this.timelineInfos.start;
      let pc = 100*msSinceStart/(this.timelineInfos.end - this.timelineInfos.start);
      return {
        right: `${pc}%`,
        top: Math.random()*80 + '%'
      };
    },


  },
  watch: {
  }
}
</script>
<style scoped>
.timeline {
  position: relative;
}
.mediaWrap {
  position: absolute;
}

.m_fileupload {
  position: fixed;
  bottom:0;
  right: 5vw;
}

</style>