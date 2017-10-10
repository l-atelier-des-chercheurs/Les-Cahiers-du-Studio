<template>
  <div>

    <NavbarTop
      :folder="folder"
      :slugFolderName="slugFolderName"
      :currentDay="timelineViewport.currentDay"
      @toggleSidebar="toggleSidebar()"
      >
    </NavbarTop>

    <Sidebar
      v-if="$root.settings.has_sidebar_opened"
      :folder="folder"
      :slugFolderName="slugFolderName"
      :medias="medias"
      :timelineInfos="timelineInfos"
    >
    </Sidebar>

    <div class="m_timeline" ref="timeline">
      <div class="m_timeline-container"
        :style="setViewedTimeline()"
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
          <transition-group name="fade">
            <Media v-for="(media, index) in medias"
              v-if="getMediaPosX(media.created) && mediaIsVisible(media.created, index)"
              v-bind:key="index"
              :ref="`media_${index}`"
              :slugFolderName="slugFolderName"
              :slugMediaName="index"
              :media="media"
              :timelineScale="timelineViewport.scale"
              :timelineHeight="getVH(1)"
              :posX="getMediaPosX(media.created)"
              :class="{ 'is--highlighted' : highlightedMedia === index }"
              @open="openMediaModal(index)"
            >
            </Media>
          </transition-group>
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

      <DayNavButtons
        :timelineInfos="timelineInfos"
        :timelineViewport="timelineViewport"
        @goToPrevDay="goToPrevDay()"
        @goToNextDay="goToNextDay()"
      >
      </DayNavButtons>

      <div class="options_panel" >
        <button class="button_small padding-medium" @click="showTimelineOptions = !showTimelineOptions">
          options
        </button>

        <div v-if="showTimelineOptions" class="padding-small" style="width:370px">
          <label>Échelle de temps</label>
          <div class="input-group">
            <template v-for="btns in scaleBtns">
              <button type="button"
                class="button"
                :class="{ 'is--active' : timelineViewport.scale === btns.scale }"
                @click="timelineViewport.scale = btns.scale"
              >
                {{ btns.name }}
              </button>
            </template>
          </div>
          <div class="input-single" v-if="isRealtime">
            <label>Défiler automatiquement</label>
            <input type="checkbox" v-model="timelineViewport.autoscroll">
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
  </div>
</template>
<script>
import NavbarTop from './components/NavbarTop.vue';
import Sidebar from './components/Sidebar.vue';
import AddMediaButton from './components/AddMediaButton.vue';

import Media from './components/TimelineMedia.vue';
import EditMedia from './components/modals/EditMedia.vue';
import DateTime from './components/subcomponents/DateTime.vue';
import DayNavButtons from './components/subcomponents/DayNavButtons.vue';
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
    NavbarTop,
    Sidebar,
    AddMediaButton,
    DateTime,
    DayNavButtons
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

      // this object contains a start and end for this timeline, ven if it is realtime
      // for example 2017-07-01 13:22 and 2017-07-12 12:24
      timelineInfos: {
        start: 0,
        end:   0,
      },
      timelineViewport: {
        // this object contains a start and end for this view,
        // for example 2017-07-01 13:22 and 2017-07-01 23:59
        start: 0,
        end: 0,
        width: 1,
        height: 1,
        scale: this.$root.getProjectScale(this.slugFolderName),
        currentDay: '',
        scrollLeft: this.$root.getScrollLeft(this.slugFolderName),
        autoscroll: false,
        longestIntervalTS: 86400000 * 10,
      },

      scaleBtns: [{
        name: 'Seconde',
        scale: 1
      },
      {
        name: 'Minute',
        scale: 5
      },
      {
        name: 'Heure',
        scale: 20
      },
      {
        name: 'Demi-journée',
        scale: 50
      },
      {
        name: 'Journée',
        scale: 100
      }]

    }
  },
  watch: {
    folder: function() {
      console.log('WATCH : folder');
      this.setTimelineBounds();
      this.setViewedTimelineBoundsFromInfos();
    },
    'timelineViewport.scale': function() {
      console.log('WATCH : timelineViewport.scale');
      // before updating the scale, we get the percent that's currently shown, store it, and we go back to it right after scaling
      let currentScrollLeft = this.$refs.timeline.scrollLeft;
//       currentScrollLeft += window.innerWidth/2;
      let currentScrollLeft_percent = currentScrollLeft / this.timelineViewport.width;
      this.$nextTick(function () {
        this.$refs.timeline.scrollLeft = this.timelineViewport.width * currentScrollLeft_percent;
      });
      this.$root.updateProjectScale(this.slugFolderName, this.timelineViewport.scale);
    },
    'timelineViewport.scrollLeft': function() {
      console.log('WATCH : timelineViewport.scrollLeft');
      this.$root.updateProjectScrollLeft(this.slugFolderName, this.timelineViewport.scrollLeft);
      this.setCurrentDay();
    },
  },
  created() {
    console.log(`Created component timeline`);

    window.addEventListener('resize', debounce(this.onResize, 300));
    window.addEventListener('timeline.scrolltoend', this.scrollToEnd);
    this.setTimelineBounds();
    this.setViewedTimelineBoundsFromInfos();
    this.setCurrentDay();
    // TODO : check localstorage pour une info de jour
  },
  mounted() {
    EventBus.$on('scrollToMedia', this.scrollToMedia);
    EventBus.$on('scrollToDate', this.scrollToDate);
    EventBus.$on('highlightMedia', this.highlightMedia);
    // set scrollLeft to match timelineViewport.scrollLeft
    this.$refs.timeline.scrollLeft = this.timelineViewport.scrollLeft;

    if(this.timelineViewport.autoscroll) {
      this.scrollToEnd();
    }

    this.timelineUpdateRoutine = setInterval(() => {
      this.setViewedTimelineBoundsFromInfos();
      if(this.timelineViewport.autoscroll) {
        this.scrollToEnd()
      }
      this.timelineViewport.scrollLeft = this.$refs.timeline.scrollLeft;
      this.setCurrentDay();
    }, 1000);
  },
  beforeDestroy() {
    EventBus.$off('scrollToMedia', this.scrollToMedia);
    EventBus.$off('scrollToDate', this.scrollToDate);
    EventBus.$off('highlightMedia', this.highlightMedia);
    window.removeEventListener('resize', debounce(this.onResize, 300));
    window.removeEventListener('timeline.scrolltoend', this.scrollToEnd);
    clearInterval(this.timelineUpdateRoutine);
  },
  computed: {
  },
  methods: {

    /******************************************************************
        Updates timelineInfos with folder start and end
    ******************************************************************/
    setTimelineBounds() {
      this.timelineInfos.start = this.getTimelineStart(this.folder.start);
      this.timelineInfos.end = this.getTimelineEnd(this.folder.end);
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

    /******************************************************************
        Updates viewed timeline with a start and end
    ******************************************************************/
    setViewedTimelineBoundsFromInfos() {
      const newStart = this.getViewedTimelineStart(this.timelineInfos.start);
      if(+newStart !== +this.timelineViewport.start) {
        this.timelineViewport.start = newStart;
      }
      const newEnd = this.getViewedTimelineEnd(this.timelineInfos.end);
      if(+newEnd !== +this.timelineViewport.end) {
        this.timelineViewport.end = newEnd;
      }
    },

    // called by :style in template
    setViewedTimeline() {
      // récupérer la longueur de la timeline en TS
      let timeEllapsed = this.timelineViewport.end - this.timelineViewport.start;
      // décomposer en secondes
      let secondsEllapsed = timeEllapsed/1000;

      let w = Math.floor(secondsEllapsed/this.timelineViewport.scale);
      let h = Math.floor(this.getVH(1));

      this.timelineViewport.width = w;
      this.timelineViewport.height = h;
      return `width: ${w}px; height: ${h}px;`;
    },
    getVH(val) {
      let winHeight = this.windowHeight - this.topNavbarHeight - this.bottomScrollBar;
      return val*winHeight;
    },
    getViewedTimelineStart(timelineView_new_start) {

      // Sanitize new date
      if(timelineView_new_start.isBefore(this.timelineInfos.start)) {
        return moment(this.timelineInfos.start);
      }
      if(timelineView_new_start.isAfter(this.timelineInfos.end)) {
        return moment(this.timelineInfos.end);
      }

      // Sanitize new date
      return timelineView_new_start;
    },
    getViewedTimelineEnd(timelineView_new_end) {
      return timelineView_new_end;
    },

    /******************************************************************
        Updates medias and grid position according to viewed timeline
    ******************************************************************/
    getMediaPosX(media_created) {
      let createdTS = moment(media_created,'YYYY-MM-DD HH:mm:ss');
      let posX = this.getXPositionFromDate(createdTS);
      return posX;
    },
    generateHorizontalGrid() {
      let timeEllapsed = this.timelineViewport.end - this.timelineViewport.start;
      let html = '';

      /****************************** make DAY ticks ******************************/

      let createDayTick = (currentDay) => {
        let xPos = this.getXPositionFromDate(currentDay);
        let momentDay = moment(currentDay).format('DD/MM/YYYY');
        html += `
        <div class="gridItem font-small gridItem_isday" style="transform:translate(${xPos}px, 0px)">
          <div class="gridItem--caption">
            ${momentDay}
          </div>
        </div>
        `;
      }

      createDayTick(this.timelineViewport.start);
      let firstDay = moment(moment(this.timelineViewport.start).startOf('day').subtract(1, 'day'));
      for(var d = 86400000; d < timeEllapsed + 86400000; d += 86400000) {
        let currentDay = firstDay + d;
        createDayTick(currentDay);
      }

      // only show HOUR and MINUTES for the currentDay, the previous and the next
      // to do that, we create a const for the current timestamp and another for the number of ms we show the grid
      let currentDayStart = moment(this.timelineViewport.currentDay).subtract(1, 'days').startOf('day');
      const timeEllapsedDay = 3 * 24*60*60*1000;

      /****************************** make HOUR ticks ******************************/

      let createHourTick = (currentHour, withCaption = false) => {
        let xPos = this.getXPositionFromDate(currentHour);

        if(withCaption || this.timelineViewport.scale < 70) {
          html += `<div class="gridItem font-small gridItem_ishour" style="transform:translate(${xPos}px, 0px)" data-caption="${moment(currentHour).format('HH:mm')}"></div>`;
        } else {
          html += `<div class="gridItem font-small gridItem_ishour" style="transform:translate(${xPos}px, 0px)"></div>`;
        }
      }

      createHourTick(this.timelineViewport.start, true);
      for(var h = 3600000; h < timeEllapsedDay; h +=  3600000) {
        let currentHour = currentDayStart + h;
        createHourTick(currentHour);
      }

      if(this.timelineViewport.scale > 10) { return html; }

      /****************************** make MINUTES ticks ******************************/

      let createMinuteTick = (currentMinute) => {
        let xPos = this.getXPositionFromDate(currentMinute);
        if(moment(currentMinute).minute() === 0) {
          return;
        }
        if(moment(currentMinute).minute()%10 === 0 || this.timelineViewport.scale < 1) {
          html += `<div class="gridItem font-small gridItem_isminute" style="transform:translate(${xPos}px, 0px)" data-caption="${moment(currentMinute).format('HH:mm')}"></div>`;
        } else {
          html += `<div class="gridItem font-small gridItem_isminute" style="transform:translate(${xPos}px, 0px)"></div>`;
        }
      }

      for(var m = 0; m < timeEllapsedDay; m += 60000) {
        let currentMinute = currentDayStart + m;
        createMinuteTick(currentMinute);
      }

      return html;
    },
    getXPositionFromDate(timestamp) {
      let msSinceStart = timestamp - this.timelineViewport.start;
      let pc = msSinceStart/(this.timelineViewport.end - this.timelineViewport.start);
      if(pc < 0 || pc > 1) { return false; }
      pc = Math.min(Math.max(parseFloat(pc), 0), 1);
      let posX = this.timelineViewport.width * pc;
      return Math.floor(posX);
    },
    getDateFromXPosition(posX) {
      let pc = posX/this.timelineViewport.width;
      let viewportLength = this.timelineViewport.end - this.timelineViewport.start;
      let timeSinceStart = pc * viewportLength;
      return moment(timeSinceStart + this.timelineViewport.start);
    },
    mediaIsVisible(media_created, slugMediaName) {
      let mediaCreatedDay = moment(media_created, 'YYYY-MM-DD HH:mm:ss');

      // show if in view
//       if(this.timelineViewport.scrollLeft < mediaPosX && mediaPosX < this.timelineViewport.scrollLeft + window.innerWidth) {
      if(moment(mediaCreatedDay).isSame(this.timelineViewport.currentDay, 'day') ||
      moment(mediaCreatedDay).subtract(1, 'day').isSame(this.timelineViewport.currentDay, 'day') ||
      moment(mediaCreatedDay).add(1, 'day').isSame(this.timelineViewport.currentDay, 'day')
      ) {
        return true;
      }
      return false;
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
      this.$refs.timeline.scrollLeft = this.timelineViewport.width;
    },
    scrollToMedia(slugMediaName) {
      let mediaToScrollTo = this.medias[slugMediaName];
      let mediaPosX = this.getMediaPosX(mediaToScrollTo.created);
      this.$scrollTo('.m_timeline', 500, {
        container: this.$refs.timeline,
        offset: this.$root.settings.has_sidebar_opened ? mediaPosX - 700 : mediaPosX - 500,
        x: true,
        y: false
      });
    },
    scrollToDate(timestamp) {
      let xPos = this.getXPositionFromDate(timestamp);
      this.$scrollTo('.m_timeline', 500, {
        container: this.$refs.timeline,
        offset: this.$root.settings.has_sidebar_opened ? xPos : xPos - 500,
        x: true,
        y: false
      });
    },
    highlightMedia(slugMediaName) {
      this.highlightedMedia = slugMediaName;
    },
    goToPrevDay() {
      let twentyFourHoursInSeconds = 24 * 60 * 60;
      let twentyFourHoursInPixels = Math.floor(twentyFourHoursInSeconds/this.timelineViewport.scale);

      this.$scrollTo('.m_timeline', 500, {
        container: this.$refs.timeline,
        offset: this.$refs.timeline.scrollLeft - twentyFourHoursInPixels,
        x: true,
        y: false
      });
    },
    goToNextDay() {
      let twentyFourHoursInSeconds = 24 * 60 * 60;
      let twentyFourHoursInPixels = Math.floor(twentyFourHoursInSeconds/this.timelineViewport.scale);

      this.$scrollTo('.m_timeline', 500, {
        container: this.$refs.timeline,
        offset: this.$refs.timeline.scrollLeft + twentyFourHoursInPixels,
        x: true,
        y: false
      });
    },
    toggleSidebar() {
      this.$root.settings.has_sidebar_opened = !this.$root.settings.has_sidebar_opened;
    },
    setCurrentDay() {
      let dateFromPosX = this.getDateFromXPosition(this.timelineViewport.scrollLeft + window.innerWidth/4);
      dateFromPosX = Math.min(this.timelineViewport.end, Math.max(dateFromPosX, this.timelineViewport.start));
      this.timelineViewport.currentDay = dateFromPosX;
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
    height: 100%;

    transition: all .4s;

    &.gridItem_isday {
      border-left: 1px solid #00ad41;
      z-index:100;
      color: white;

      .gridItem--caption {
        display: block;
        background-color: #00ad41;
        padding: 1px 4px;
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
