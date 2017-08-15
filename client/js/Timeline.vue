<template>
  <div class="m_timeline" :style="timelineStyles">
    <template v-if="loading_folder_medias">
      <span class="loader margin-small"></span>
    </template>
    <template v-else>
      <AddMediaButton v-if="((folder.password === 'has_pass' && folder.authorized) || folder.password !== 'has_pass')">
      </AddMediaButton>

      <div class="m_fileupload"
      >
        <FileUpload
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

      <div class="artboard-overlay"></div>
    </template>
  </div>
</template>
<script>
import Media from './components/Media.vue';
import FileUpload from './components/FileUpload.vue';
import AddMediaButton from './components/AddMediaButton.vue';
import moment from 'moment';

export default {
  props: {
    slugFolderName: String,
    folder: Object
  },
  components: {
    Media,
    FileUpload,
    AddMediaButton
  },
  data() {
    return {
      loading_folder_medias: false,
      timelineStyles: {
        width: '1024px',
        height: '768px'
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

<style scoped lang="sass">
$artboard-grid-px: 20px !default;
$artboard-grid-color: rgba(0, 0, 0, .25) !default;
$artboard-divider-interval: 10 !default;
$artboard-divider-color: rgba(0, 0, 0, .5) !default;
$artboard-overlay-opacity: .5 !default;

// Private

@function line-background-image($degrees, $size, $color) {
  $line-start: $size - 1;
  $line-end: $size;
  @return repeating-linear-gradient($degrees, transparent, transparent $line-start, $line-start, $color $line-end);
}

@function horizontal-line-background-image($size, $color) {
  @return line-background-image(0deg, $size, $color);
}

@function vertical-line-background-image($size, $color) {
  @return line-background-image(-90deg, $size, $color);
}

@function grid-background-images($size, $color) {
  @return horizontal-line-background-image($size, $color), vertical-line-background-image($size, $color)
}

// Public

@mixin artboard-grid($grid-px: $artboard-grid-px, $grid-color: $artboard-grid-color, $divider-interval: $artboard-divider-interval, $divider-color: $artboard-divider-color) {
  // Blocks
  $grid-background-images: grid-background-images($grid-px, $grid-color);
  // Dividers
  $divider-px: $grid-px * $divider-interval;
  $divider-background-images: grid-background-images($divider-px, $divider-color);
  // Blocks & Dividers
  $background-images: join($divider-background-images, $grid-background-images);
  background-image: $background-images;
  background-size: $divider-px $divider-px;
}

@mixin artboard-overlay($opacity: $artboard-overlay-opacity, $grid-px: $artboard-grid-px, $grid-color: $artboard-grid-color, $divider-interval: $artboard-divider-interval, $divider-color: $artboard-divider-color) {
  @include artboard-grid($grid-px, $grid-color, $divider-interval, $divider-color);
  opacity: $opacity;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: -1;
  pointer-events:none;
}

.artboard-grid {
  @include artboard-grid($artboard-grid-px, $artboard-grid-color, $artboard-divider-interval, $artboard-divider-color);
}

.artboard-overlay {
  @include artboard-overlay();
}
</style>

