<template>
  <div class="media" :style="getMediaSize(media)">
    <div class="mediaContent">
      <MediaContent
        :slugFolderName="slugFolderName"
        :slugMediaName="slugMediaName"
        :media="media"
      >
      </MediaContent>
    </div>

  </div>
</template>
<script>
import MediaContent from './subcomponents/MediaContent.vue';

export default {
  props: ['slugFolderName', 'slugMediaName', 'media'],
  components: {
    MediaContent
  },
  data() {
    return {
      mediaStyles: {
        ratio: this.media.ratio,
      }
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    getMediaSize(media) {
      let defWidth = 180;
      let defHeight = 120;

      if(media.type === 'video') {
        // TODO : set width to duration

        return {
          width:  `${defWidth}px`,
          height: `${defHeight}px`
        }
      }

      if(!this.mediaStyles.ratio) {
        return {
          width:  `${defWidth}px`,
          height: `${defHeight}px`
        }
      }
      let r = this.mediaStyles.ratio;
      let w = defWidth;
      let h = w * r;

      return {
        width: `${w}px`,
        height: `${h}px`
      }
    }
  }
}
</script>
<style scoped lang="sass">
</style>