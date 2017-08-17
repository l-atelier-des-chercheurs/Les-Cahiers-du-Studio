<template>
  <div class="m_timeline">
    <template v-if="loading_folder_medias">
      <span class="loader margin-small"></span>
    </template>
    <template v-else>

      <div class="m_timeline-container" :style="setTimeline()">

        <div class="timeline_track">
        </div>

        <!-- MEDIAS -->
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

        <!-- NO MEDIAS -->
        <template v-else>
          <p>
            <code>
              <template v-if="folder.authorized">
                Aucun média dans ce dossier.
              </template>
              <template v-else>
                Aucun média public dans ce dossier.
              </template>
            </code>
          </p>
        </template>

        <!-- GRID -->
        <div class="simple_grid_overlay">
          <div class="horizontal" v-html="generateHorizontalGrid()">
          </div>
        </div>

      </div>

      <AddMediaButton
        v-if="((folder.password === 'has_pass' && folder.authorized) || folder.password !== 'has_pass')"
        :slugFolderName="slugFolderName">
      </AddMediaButton>

    </template>

    <div class="input-single padding-medium" style="position: fixed; left: 0;
    top: 20%; width: 200px; background-color: white; z-index:1001;">
      <label>Timeline Width</label>
      <input type="range" v-model="timelineStyles.width" min="6" max="200">
    </div>

  </div>
</template>
<script>
import Media from './components/Media.vue';
import AddMediaButton from './components/AddMediaButton.vue';
import moment from 'moment';
import debounce from 'debounce';

export default {
  props: {
    slugFolderName: String,
    folder: Object
  },
  components: {
    Media,
    AddMediaButton
  },
  data() {
    return {
      loading_folder_medias: false,
      windowHeight: window.innerHeight,
      timelineStyles: {
        width: 50,
        height: 1
      },
      topNavbarHeight: 70,
      timelinetrackHeight: 50,
      timelineInfos: {
        start: moment(this.folder.start,'YYYY-MM-DD HH:mm'),
        end:   moment(this.folder.end,'YYYY-MM-DD HH:mm'),
      }
    }
  },
  methods: {
    getVH(val) {
      let winHeight = this.windowHeight - this.topNavbarHeight;
      return val*winHeight;
    },
    setTimeline() {
      let w = this.getVH(this.timelineStyles.width);
      let h = this.getVH(this.timelineStyles.height);
      return `width: ${w}px; height: ${h}px;`;
    },
    generateHorizontalGrid() {
      let timeEllapsed = this.timelineInfos.end - this.timelineInfos.start;
      let html = '';

      let firstDay = moment(moment(this.timelineInfos.start).format('YYYY-MM-DD 00:00'));
      for(var d = 86400000; d < timeEllapsed; d += 86400000) {
        let currentDay = firstDay + d;
        let xPos = this.getXPosition(currentDay);
        let momentDay = moment(currentDay).calendar(null,{
            lastDay : '[Yesterday]',
            sameDay : '[Today]',
            nextDay : '[Tomorrow]',
            lastWeek : 'dddd [dernier]',
            nextWeek : 'dddd',
            sameElse : 'L'
        });


        html += `<div class="gridItem gridItem_isday" style="transform:translate(${xPos}px, 0px)" data-caption="${momentDay}"></div>`;
      }

      let createHourTick = (currentHour) => {
        let xPos = this.getXPosition(currentHour);
        let momentHour = moment(currentHour).format('HH:mm');
        html += `<div class="gridItem gridItem_ishour" style="transform:translate(${xPos}px, 0px)" data-caption="${momentHour}"></div>`;
      }

      createHourTick(this.timelineInfos.start);
      let firstHour = moment(moment(this.timelineInfos.start).format('YYYY-MM-DD HH:00'));
      for(var h = 3600000; h < timeEllapsed; h +=  3600000) {
        let currentHour = firstHour + h;
        createHourTick(currentHour);
      }

      return html;
    },
    getMediaPosition(media) {
      let createdTS = moment(media.created,'YYYY-MM-DD HH:mm')
      let posX = this.getXPosition(createdTS);
      let posY = this.getVH(createdTS.format('mm')/100);
      return {
        transform: `translate(${posX}px, ${posY}px)`
      };
    },
    getXPosition(timestamp) {
      let msSinceStart = timestamp - this.timelineInfos.start;
      let pc = msSinceStart/(this.timelineInfos.end - this.timelineInfos.start);
      let posX = this.getVH(this.timelineStyles.width * pc);
      return Math.floor(posX);
    },
    onResize() {
      this.windowHeight = window.innerHeight;
    }
  },
  created() {
    window.addEventListener('resize', debounce(this.onResize, 300));
  },
  beforeDestroy() {
    window.removeEventListener('resize', debounce(this.onResize, 300))
  },
  watch: {
  }
}
</script>

<style lang="sass">

.timeline_track {
  position: relative;
  height: 50px;
  width:100%;
  border-bottom: 1px solid black;
}


.simple_grid_overlay {
  height: 100%;
  left: 0;
  position: absolute;
  width: 100%;
  z-index: -1;
  pointer-events:none;

  .horizontal {
    height: 100%;
  }

  .gridItem {
    position: absolute;
    width: 1px;
    height: 100%;

    transition: all .4s;

    &.gridItem_isday {
      border-left: 1px solid fade-out(black, 0.0);
      z-index:100;

      &::before {
        content: attr(data-caption);
        display: block;
        width: 150px;
/*         transform: rotate(-15deg); */
        transform-origin: left top;
        margin-left: 4px;
        margin-top: 1px;
      }
    }
    &.gridItem_ishour {
      color: #00ad41;
      border-left: 1px solid fade-out(#00ad41, 0.9);
      z-index:10;

      &::before {
        content: attr(data-caption);
        display: block;
        width: 150px;
        transform: rotate(-15deg);
        transform-origin: left top;
        margin-left: 4px;
        font-style: italic;
        margin-top: -30px;
        font-style: 0.9em;
      }
    }
  }


}









</style>

<style scoped lang="sass">
$artboard-grid-px: 10px !default;
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

