<template>
  <div class="m_timeline">
    <template v-if="loading_folder_medias">
      <span class="loader margin-small"></span>
    </template>
    <template v-else>

      <div class="m_timeline-container" :style="setTimeline()">

        <div class="timeline_track">
        </div>
        <!-- GRID -->
        <div class="simple_grid_overlay">
          <div class="horizontal" v-html="generateHorizontalGrid()">
          </div>
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


      </div>

      <AddMediaButton
        v-if="((folder.password === 'has_pass' && folder.authorized) || folder.password !== 'has_pass')"
        :slugFolderName="slugFolderName">
      </AddMediaButton>

    </template>

    <div class="input-single padding-medium" style="position: fixed; left: 0;
    top: 20%; width: 200px; background-color: white; z-index:1001;">
      <label>Timeline Width</label>
      <input type="range" v-model="timelineStyles.width" min="1" max="200">
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
        width: 5,
        height: 1
      },
      topNavbarHeight: 70,
      timelinetrackHeight: 50,
      timelineInfos: {
        start: moment(),
        end:   moment(),
      }
    }
  },
  created() {
    window.addEventListener('resize', debounce(this.onResize, 300));

    if(this.folder.start && moment(this.folder.start,'YYYY-MM-DD HH:mm', true).isValid()) {
      this.timelineInfos.start = moment(this.folder.start,'YYYY-MM-DD HH:mm');
    }
    if(this.folder.end && moment(this.folder.end,'YYYY-MM-DD HH:mm', true).isValid()) {
      this.timelineInfos.end = moment(this.folder.end,'YYYY-MM-DD HH:mm');
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', debounce(this.onResize, 300))
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

      // make DAY ticks
      let createDayTick = (currentDay) => {
        let xPos = this.getXPosition(currentDay);
        let momentDay = moment(currentDay).format('YYYY-MM-DD');
        html += `<div class="gridItem gridItem_isday" style="transform:translate(${xPos}px, 0px)" data-caption="${momentDay}"></div>`;
      }

      createDayTick(this.timelineInfos.start);
      let firstDay = moment(moment(this.timelineInfos.start).format('YYYY-MM-DD 00:00'));
      for(var d = 86400000; d < timeEllapsed; d += 86400000) {
        let currentDay = firstDay + d;
        createDayTick(currentDay);
      }

      // make HOUR ticks
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

      // make 10 MINUTES ticks
      let createMinuteTick = (currentMinute) => {
        let xPos = this.getXPosition(currentMinute);
        let momentMinute = moment(currentMinute).format('HH:mm');
        html += `<div class="gridItem gridItem_isminute" style="transform:translate(${xPos}px, 0px)" data-caption="${momentMinute}"></div>`;
      }

      let firstMinute = moment(moment(this.timelineInfos.start).format('YYYY-MM-DD HH:mm'));
      for(var m = 60000; m < timeEllapsed; m +=  60000) {
        let currentMinute = firstMinute + m;
        createMinuteTick(currentMinute);
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
      if(!this.timelineInfos.start || !this.timelineInfos.end) { console.log(`Error with getXPosition`); }
      let msSinceStart = timestamp - this.timelineInfos.start;
      let pc = msSinceStart/(this.timelineInfos.end - this.timelineInfos.start);
      let posX = this.getVH(this.timelineStyles.width * pc);
      return Math.floor(posX);
    },
    onResize() {
      this.windowHeight = window.innerHeight;
    }
  },
  watch: {
  }
}
</script>

<style lang="sass">

.timeline_track {
  position: absolute;
  height: 50px;
  width:100%;
  border-bottom: 1px solid black;
}


.simple_grid_overlay {
  height: 100%;
  left: 0;
  padding-top:50px;
  position: absolute;
  width: 100%;
  z-index: -1;
  pointer-events:none;

  .horizontal {
    position:relative;
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

    &.gridItem_isminute {
      color: #999;
      border-left: 1px solid #d9d9d9;
      z-index:10;

      &:nth-child(10n) {
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
}
</style>
