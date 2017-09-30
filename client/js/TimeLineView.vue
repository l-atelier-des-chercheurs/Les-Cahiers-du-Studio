<template>
  <div class="m_timeline" ref="timeline">

    <div class="m_timeline-container"
      :style="setTimeline()"
      :class="{ 'is--realtime' : isRealtime, 'with--sidebar_opened' : $root.settings.has_sidebar_opened }"
    >
      <div class="timeline_track">
      </div>

      <!-- GRID -->
      <div class="simple_grid_overlay">
        <div class="horizontal" v-html="generateHorizontalGrid()">
        </div>
      </div>

      <div v-if="Object.keys(medias).length > 0">
<!--           v-if="getMediaPosX(media) !== false" -->
        <Media v-for="(media, index) in medias"
          v-bind:key="index"
          :ref="`media_${index}`"
          :slugFolderName="slugFolderName"
          :slugMediaName="index"
          :media="media"
          :timelineScale="timelineViewport.scale"
          :timelineHeight="getVH(1)"
          :posX="getMediaPosX(media)"
          :class="{ 'is--highlighted' : highlightedMedia === index }"
          @open="openMediaModal(index)"
        >
        </Media>
      </div>

      <template v-else>
        <div class="nomediainfo">
          <code>
            <template v-if="folder.authorized">
              Aucun média dans ce dossier.
            </template>
            <template v-else>
              Aucun média public dans ce dossier.
            </template>
          </code>
        </div>
      </template>

    </div>

    <AddMediaButton
      v-if="((folder.password === 'has_pass' && folder.authorized) || folder.password !== 'has_pass')"
      :slugFolderName="slugFolderName">
    </AddMediaButton>


    <div class="options_panel" >
      <button class="button_small padding-medium" @click="showTimelineOptions = !showTimelineOptions">
        options
      </button>

      <div v-if="showTimelineOptions" class="padding-small" style="width:370px">
        <label>Échelle <small>1 pixel de large = {{ timelineViewport.scale }}  secondes</small></label>
        <div class="input-group">
          <button type="button" class="button" @click="timelineViewport.scale = 0.5">0.5</button>
          <button type="button" class="button_small" @click="timelineViewport.scale = 2.5">2.5</button>
          <button type="button" class="button_small" @click="timelineViewport.scale = 5">5</button>
          <button type="button" class="button_small" @click="timelineViewport.scale = 50">50</button>
          <button type="button" class="button_small" @click="timelineViewport.scale = 150">150</button>
<!--          <input type="range" v-model.number="" min="0.5" max="140"> -->
        </div>
        <div class="input-single" v-if="isRealtime">
          <label>Défiler automatiquement</label>
          <input type="checkbox" v-model="timelineViewport.autoscroll">
        </div>
        <div class="input-single">
          <label>Afficher la timeline entre :</label>
          <DateTime v-model.number="timelineViewport.start" :twowaybinding="true">
          </DateTime>
          <label>et</label>
          <DateTime v-model.number="timelineViewport.end" :twowaybinding="true">
          </DateTime>
        </div>

        <div class="input-single" v-if="false">
          <input type="range" v-model.number="timelineViewport.start" :min.number="+timelineInfos.start" :max.number="+timelineInfos.end">
        </div>

      </div>
    </div>

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
import Media from './components/TimelineMedia.vue';
import EditMedia from './components/modals/EditMedia.vue';
import AddMediaButton from './components/AddMediaButton.vue';
import DateTime from './components/subcomponents/DateTime.vue';
import moment from 'moment';
import debounce from 'debounce';
import EventBus from './event-bus';

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object,
  },
  components: {
    Media,
    EditMedia,
    AddMediaButton,
    DateTime
  },
  data() {
    return {
      windowHeight: window.innerHeight,

      topNavbarHeight: 60,
      timelinetrackHeight: 50,
      bottomScrollBar: 0,

      showMediaModalFor: '',
      showTimelineOptions: false,
      highlightedMedia: '',

      isRealtime: false,
      timelineUpdateRoutine: '',
      timelineInfos: {
        start: 0,
        end:   0,
      },
      timelineStyles: {
        width: 1,
        height: 1
      },

      timelineViewport: {
        start: 0,
        end: 0,
        scale: this.$root.getProjectScale(this.slugFolderName),
        scrollLeft: this.$root.getScrollLeft(this.slugFolderName),
        autoscroll: false,
        longestIntervalTS: 86400000 * 10,
      }

    }
  },
  watch: {
    folder: function() {
      console.log('WATCH : folder');
      this.setTimelineBounds();
    },
    'timelineViewport.start': function() {
      console.log('WATCH : timelineViewport.start');
      this.updateTimelineEnd();
    },
    'timelineViewport.end': function() {
      console.log('WATCH : timelineViewport.start');
      this.updateTimelineStart();
    },
    'timelineViewport.scale': function() {
      console.log('WATCH : timelineViewport.scale');
      this.$root.updateProjectScale(this.slugFolderName, this.timelineViewport.scale);
    },
    'timelineViewport.scrollLeft': function() {
      console.log('WATCH : timelineViewport.scrollLeft');
      this.$root.updateProjectScrollLeft(this.slugFolderName, this.timelineViewport.scrollLeft);
    },
  },
  created() {
    console.log(`Created component timeline`);

    window.addEventListener('resize', debounce(this.onResize, 300));
    window.addEventListener('timeline.scrolltoend', this.scrollToEnd);
    this.setTimelineBounds();
    this.updateTimelineEnd();
    this.setTimeline();
  },
  mounted() {
    EventBus.$on('scrollToMedia', this.scrollToMedia);
    EventBus.$on('highlightMedia', this.highlightMedia);
    // set scrollLeft to match timelineViewport.scrollLeft
    this.$refs.timeline.scrollLeft = this.timelineViewport.scrollLeft;
    if(this.timelineViewport.autoscroll) {
      this.$refs.timeline.scrollLeft = this.timelineStyles.width;
    }

    this.timelineUpdateRoutine = setInterval(() => {
      this.setTimelineBounds();
      this.updateTimelineEnd();
      this.setTimeline();
      if(this.timelineViewport.autoscroll) {
        this.$refs.timeline.scrollLeft = this.timelineStyles.width;
      }
      this.timelineViewport.scrollLeft = this.$refs.timeline.scrollLeft;
    }, 1000);
  },
  beforeDestroy() {
    EventBus.$off('scrollToMedia', this.scrollToMedia);
    EventBus.$off('highlightMedia', this.highlightMedia);
    window.removeEventListener('resize', debounce(this.onResize, 300));
    window.removeEventListener('timeline.scrolltoend', this.scrollToEnd);
    clearInterval(this.timelineUpdateRoutine);
  },
  computed: {
  },
  methods: {
    setTimelineBounds() {
      this.timelineInfos.start = this.getTimelineStart(this.folder.start);
      this.timelineInfos.end = this.getTimelineEnd(this.folder.end);
    },
    setTimelineView() {
      this.timelineViewport.start = this.timelineInfos.start;
      this.timelineViewport.end = this.timelineInfos.end;
    },
    updateTimelineEnd() {
      this.timelineViewport.end = Math.min(this.timelineViewport.start+this.timelineViewport.longestIntervalTS, this.timelineInfos.end);
    },
    updateTimelineStart() {
      this.timelineViewport.start = Math.max(this.timelineViewport.end-this.timelineViewport.longestIntervalTS, this.timelineInfos.start);
    },
    // retourne une valeure en pixel qui dépend de la hauteur de la timeline
    getTimelineStart(ts) {
      if(ts && moment(ts,'YYYY-MM-DD HH:mm:ss', true).isValid()) {
        return moment(ts,'YYYY-MM-DD HH:mm:ss');
      } else {
        console.log(`WARNING: no timeline start. This can’t work.`);
        throw `Missing timeline start`;
      }
      return;
    },
    getTimelineEnd(ts) {
      if(ts && moment(ts,'YYYY-MM-DD HH:mm:ss', true).isValid()) {
        this.isRealtime = false;
        return moment(ts,'YYYY-MM-DD HH:mm:ss');
      } else {
        // set end to current time
        this.isRealtime = true;
        return moment();
      }

    },
    getVH(val) {
      let winHeight = this.windowHeight - this.topNavbarHeight - this.bottomScrollBar;
      return val*winHeight;
    },
    setTimeline() {
      // récupérer la longueur de la timeline en TS
      let timeEllapsed = this.timelineViewport.end - this.timelineViewport.start;
      // décomposer en secondes
      let secondsEllapsed = timeEllapsed/1000;

      let w = Math.floor(secondsEllapsed/this.timelineViewport.scale);
      let h = Math.floor(this.getVH(1));

      this.timelineStyles.width = w;
      this.timelineStyles.height = h;

      return `width: ${w}px; height: ${h}px;`;
    },
    getMediaPosX(media) {
      let createdTS = moment(media.created,'YYYY-MM-DD HH:mm:ss')
      let posX = this.getXPosition(createdTS);
      return posX;
    },
    generateHorizontalGrid() {
      let timeEllapsed = this.timelineViewport.end - this.timelineViewport.start;
      let html = '';

      /******************************
              make DAY ticks
      ******************************/

      let createDayTick = (currentDay) => {
        let xPos = this.getXPosition(currentDay);
        let momentDay = moment(currentDay).format('YYYY-MM-DD HH:mm:ss');
        html += `<div class="gridItem font-small gridItem_isday" style="transform:translate(${xPos}px, 0px)" data-caption="${momentDay}"></div>`;
      }

      createDayTick(this.timelineViewport.start);
      let firstDay = moment(moment(this.timelineViewport.start).format('YYYY-MM-DD 00:00'));
      for(var d = 86400000; d < timeEllapsed; d += 86400000) {
        let currentDay = firstDay + d;
        createDayTick(currentDay);
      }

//       if(this.timelineViewport.scale > 30) { return html; }

      /******************************
              make HOUR ticks
      ******************************/

      // make HOUR ticks
      let createHourTick = (currentHour) => {
        let xPos = this.getXPosition(currentHour);
        let momentHour = moment(currentHour).format('HH:mm');

        if(this.timelineViewport.scale < 70) {
          html += `<div class="gridItem font-small gridItem_ishour" style="transform:translate(${xPos}px, 0px)" data-caption="${momentHour}"></div>`;
        } else {
          html += `<div class="gridItem font-small gridItem_ishour" style="transform:translate(${xPos}px, 0px)"></div>`;
        }
      }

      let firstHour = moment(moment(this.timelineViewport.start).format('YYYY-MM-DD HH:00'));
      for(var h = 3600000; h < timeEllapsed; h +=  3600000) {
        let currentHour = firstHour + h;
        createHourTick(currentHour);
      }

      if(this.timelineViewport.scale > 10) { return html; }

      /******************************
            make MINUTES ticks
      ******************************/

      // make MINUTES ticks
      let createMinuteTick = (currentMinute) => {
        let xPos = this.getXPosition(currentMinute);
        if(moment(currentMinute).minute() === 0) {
          return;
        }
        if(moment(currentMinute).minute()%10 === 0 || this.timelineViewport.scale < 1) {
          let momentMinute = moment(currentMinute).format('HH:mm');
          html += `<div class="gridItem font-small gridItem_isminute" style="transform:translate(${xPos}px, 0px)" data-caption="${momentMinute}"></div>`;
        } else {
          html += `<div class="gridItem font-small gridItem_isminute" style="transform:translate(${xPos}px, 0px)"></div>`;
        }
      }

      let firstMinute = moment(moment(this.timelineViewport.start).format('YYYY-MM-DD HH:mm:00'));
      for(var m = 0; m < timeEllapsed; m += 60000) {
        let currentMinute = firstMinute + m;
        createMinuteTick(currentMinute);
      }

      return html;
    },
    getXPosition(timestamp) {
      if(this.timelineViewport.start < 0 || !this.timelineViewport.end < 0) { console.log(`Error with getXPosition`); }
      let msSinceStart = timestamp - this.timelineViewport.start;
      let pc = msSinceStart/(this.timelineViewport.end - this.timelineViewport.start);
//       if(pc < 0 || pc > 1) { return false; }
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
    },
    scrollToEnd() {
      this.$refs.timeline.scrollLeft = this.timelineStyles.width;
    },
    scrollToMedia(slugMediaName) {
      let mediaToScrollTo = this.medias[slugMediaName];
      let mediaPosX = this.getMediaPosX(mediaToScrollTo);
      this.$scrollTo('.media', 500, {
        container: this.$refs.timeline,
        offset: this.$root.settings.has_sidebar_opened ? mediaPosX - 700 : 500,
        x: true,
        y: false
      });
    },
    highlightMedia(slugMediaName) {
      this.highlightedMedia = slugMediaName;
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

.timeline_overview {
  position: absolute;
  top:50px;
  height: 10px;
  width: 100%;
  border-bottom: 1px solid black;
}

.nomediainfo {
  position: fixed;
  left: 100px;
  bottom: 100px;
  background: white;
  padding: 15px;
}

.options_panel {
  position: fixed;
  right: 0%;
  top: 10px;
  width: auto;
  border:4px solid white;
  background-color: #f2f2f2;
  z-index: 1001;
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
//       color: #00ad41;
      border-left: 1px solid fade-out(black, 0.8);
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
      }
    }

    &.gridItem_isminute {
      color: #999;
      border-left: 1px solid fade-out(black, 0.9);
      z-index:1;

      &[data-caption] {
        color: #333;
        border-left: 1px solid fade-out(black, 0.8);
        &::before {
          content: attr(data-caption);
          display: block;
          width: 150px;
          transform: rotate(-15deg);
          transform-origin: left top;
          margin-left: 4px;
          font-style: italic;
          margin-top: -30px;
        }
      }
    }

  }
}
</style>
