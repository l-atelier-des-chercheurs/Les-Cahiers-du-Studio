<template>
  <div class="m_timeline" ref="timeline">

    <div class="m_timeline-container" :style="setTimeline()" :class="{ 'is--realtime' : isRealtime }">

      <div class="timeline_track">
      </div>

      <!-- GRID -->
      <div class="simple_grid_overlay">
        <div class="horizontal" v-html="generateHorizontalGrid()">
        </div>
      </div>

      <div v-if="Object.keys(medias).length > 0">
        <div class="mediaWrap" v-for="(media, index) in medias"
          :style="getMediaPosition(media)"
          @click="openMediaModal(index)"
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

    <EditTimeline
      v-if="showTimelineEditModal"
    >
    </EditTimeline>

    <EditMedia
      v-if="showMediaModalFor !== ''"
      :slugFolderName="slugFolderName"
      :slugMediaName="showMediaModalFor"
      :media="medias[showMediaModalFor]"
      @close="showMediaModalFor = ''"
    >
    </EditMedia>

  </div>
</template>
<script>
import Media from './components/Media.vue';
import EditMedia from './components/modals/EditMedia.vue';
import EditTimeline from './components/modals/EditTimeline.vue';
import AddMediaButton from './components/AddMediaButton.vue';
import moment from 'moment';
import debounce from 'debounce';

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object
  },
  components: {
    Media,
    EditMedia,
    EditTimeline,
    AddMediaButton
  },
  data() {
    return {
      windowHeight: window.innerHeight,
      topNavbarHeight: 60,
      bottomScrollBar: 20,
      showMediaModalFor: '',
      timelinetrackHeight: 50,
      isRealtime: false,
      timelineInfos: {
        start: 10,
        end:   40,
        scale: 1,
        autoscroll: false
      },
      timelineStyles: {
        width: 1,
        height: 1
      }
      showTimelineEditModal: false
    }
  },
  watch: {
    folder:  function() {
      this.init();
    },
  },
  created() {
    console.log(`Created component timeline`);

    window.addEventListener('resize', debounce(this.onResize, 300));
    this.init();

    // let msTillNextMinute = moment().endOf("minute").diff(moment());

    setInterval(() => {
      this.init();
      this.setTimeline();
      if(this.timelineInfos.autoscroll) {
        setTimeout(() => {
          this.$refs.timeline.scrollLeft = this.timelineStyles.width;
        }, 10);
      }
    }, 1000);
  },
  beforeDestroy() {
    window.removeEventListener('resize', debounce(this.onResize, 300))
  },
  computed: {
  },
  methods: {
    init() {
      this.setTimelineStart(this.folder.start);
      this.setTimelineEnd(this.folder.end);
    },
    // retourne une valeure en pixel qui dépend de la hauteur de la timeline
    setTimelineStart(ts) {
      if(ts && moment(ts,'YYYY-MM-DD HH:mm:ss', true).isValid()) {
        this.timelineInfos.start = moment(ts,'YYYY-MM-DD HH:mm:ss');
      } else {
        console.log(`WARNING: no timeline start. This can’t work.`);
        throw `Missing timeline start`;
      }
    },
    setTimelineEnd(ts) {
      if(ts && moment(ts,'YYYY-MM-DD HH:mm:ss', true).isValid()) {
        this.timelineInfos.end = moment(ts,'YYYY-MM-DD HH:mm:ss');
        this.isRealtime = false;
      } else {
        // set end to current time
        this.timelineInfos.end = moment();
        this.isRealtime = true;
      }
    },
    getVH(val) {
      let winHeight = this.windowHeight - this.topNavbarHeight - this.bottomScrollBar;
      return val*winHeight;
    },
    setTimeline() {
      // récupérer la longueur de la timeline en TS
      let timeEllapsed = this.timelineInfos.end - this.timelineInfos.start;
      // décomposer en secondes
      let secondsEllapsed = timeEllapsed/1000;

      // 1 pixel = 1 second
      let w = Math.floor(secondsEllapsed/this.timelineInfos.scale);
      let h = Math.floor(this.getVH(1));

      this.timelineStyles.width = w;
      this.timelineStyles.height = h;

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

      let firstMinute = moment(this.timelineInfos.start);
      for(var m = 60000; m < timeEllapsed; m +=  60000) {
        let currentMinute = firstMinute + m;
        createMinuteTick(currentMinute);
      }

      return html;
    },
    getMediaPosition(media) {
      let createdTS = moment(media.created,'YYYY-MM-DD HH:mm:ss')
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
      pc = Math.min(Math.max(parseFloat(pc), 0), 1);
      let posX = this.timelineStyles.width * pc;
      return Math.floor(posX);
    },
    onResize() {
      this.windowHeight = window.innerHeight;
    },
    openMediaModal(slugMediaName) {
      this.showMediaModalFor = slugMediaName;
    },
    closeMediaModal() {
      this.showMediaModalFor = '';
    }
  },
}
</script>

<style lang="sass">

.timeline_track {
  position: absolute;
  height: 50px;
  width: 100%;
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
      border-left: 1px solid fade-out(#00ad41, 0);
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
      z-index:1;

      &:nth-of-type(10n) {
        color: #333;
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
