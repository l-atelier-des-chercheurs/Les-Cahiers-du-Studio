<template>
  <div>

    <NavbarTop
      :folder="folder"
      :slugFolderName="slugFolderName"
      :currentDay="timelineViewport.currentDay"
      @toggleSidebar="toggleSidebar()"
      :timelineViewport_scale="timelineViewport.scale"
      >
    </NavbarTop>

    <transition name="sidebar-animation">
      <Sidebar
        v-if="$root.settings.has_sidebar_opened"
        :folder="folder"
        :slugFolderName="slugFolderName"
        :currentDay="timelineViewport.currentDay"
        :medias="medias"
        :timelineInfos="timelineInfos"
        >
      </Sidebar>
    </transition>

    <button type="button"
      class="button_sidebarToggle"
      @click.prevent="toggleSidebar()"
      :class="{ 'is--collapsed' : !$root.settings.has_sidebar_opened }"
      >
      <template v-if="$root.settings.has_sidebar_opened">←</template>
      <template v-else>→</template>
    </button>

    <EditFolder
      v-if="showEditFolderModal"
      :folder="folder"
      :slugFolderName="slugFolderName"
      @close="showEditFolderModal = false"
    >
    </EditFolder>

    <div class="m_timeline" ref="timeline"
      :class="{
        'is--realtime' : isRealtime,
        'with--sidebar_opened' : $root.settings.has_sidebar_opened,
        'is--animated': isAnimated
      }"
      >
      <div class="m_timeline-container"
        :style="setViewedTimeline()"
        >
        <div class="timeline_track">
        </div>

        <!-- GRID -->
        <div class="simple_grid_overlay">
          <div class="horizontal" v-html="generateHorizontalGrid()">
          </div>
        </div>

        <template v-if="Object.keys(medias).length > 0">
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
        </template>

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
import EditFolder from './components/modals/EditFolder.vue';

import Media from './components/TimelineMedia.vue';
import EditMedia from './components/modals/EditMedia.vue';
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
    EditFolder,
    NavbarTop,
    Sidebar,
    AddMediaButton,
    DateTime
  },
  data() {
    return {
      windowHeight: window.innerHeight,

      topNavbarHeight: 60,
      timelinetrackHeight: 50,
      bottomScrollBar: 20,
      sidebarWidth: parseFloat(window.getComputedStyle(document.querySelector("html")).getPropertyValue("--sidebar-width")),

      showMediaModalFor: '',
      highlightedMedia: '',
      showEditFolderModal: false,

      isRealtime: false,
      isAnimated: true,
      timelineUpdateRoutine: '',
      isScrolling: false,

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
      }


    }
  },
  watch: {
    folder: function() {
      console.log('WATCH • timelineview: folder');
      this.setTimelineBounds();
      this.setViewedTimelineBoundsFromInfos();
    },
    'timelineViewport.scale': function() {
      console.log('WATCH • timelineview: timelineViewport.scale');
      // before updating the scale, we get the percent that's currently shown, store it, and we go back to it right after scaling
      let currentScrollLeft = this.$refs.timeline.scrollLeft;
//       currentScrollLeft += window.innerWidth/2;
      let currentScrollLeft_percent = currentScrollLeft / this.timelineViewport.width;

      // disable media animations
      this.isAnimated = false;
      this.$nextTick(() => {
        this.$refs.timeline.scrollLeft = this.timelineViewport.width * currentScrollLeft_percent;
        // reenable media animations
        this.isAnimated = true;
      });
      this.$root.updateProjectScale(this.slugFolderName, this.timelineViewport.scale);
    },
    'timelineViewport.scrollLeft': function() {
      console.log('WATCH • timelineview: timelineViewport.scrollLeft');
      this.$root.updateProjectScrollLeft(this.slugFolderName, this.timelineViewport.scrollLeft);
      this.setCurrentDay();
    },
  },
  created() {
    console.log('CREATED • timelineview: folder');

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
    EventBus.$on('updateScale', this.updateTimelineViewportScale);
    EventBus.$on('goToPrevScreen', this.goToPrevScreen);
    EventBus.$on('goToNextScreen', this.goToNextScreen);
    EventBus.$on('goToPrevDay', this.goToPrevDay);
    EventBus.$on('goToNextDay', this.goToNextDay);
    EventBus.$on('showEditFolderModal', this.startEditModal);
    // set scrollLeft to match timelineViewport.scrollLeft
    this.$refs.timeline.scrollLeft = this.timelineViewport.scrollLeft;

    if(this.timelineViewport.autoscroll) {
      this.scrollToEnd();
    }

    this.timelineUpdateRoutine = setInterval(() => {
      if(this.isScrolling) {
        return;
      }

      this.setTimelineBounds();
      this.setViewedTimelineBoundsFromInfos();
      if(this.timelineViewport.autoscroll) {
        this.scrollToEnd()
      }
      this.timelineViewport.scrollLeft = this.$refs.timeline.scrollLeft;
      this.setCurrentDay();
    }, 1000);
  },
  beforeDestroy() {
    EventBus.$off('scrollToMedia');
    EventBus.$off('scrollToDate');
    EventBus.$off('highlightMedia');
    EventBus.$off('updateScale');
    EventBus.$off('goToPrevScreen');
    EventBus.$off('goToNextScreen');
    EventBus.$off('goToPrevDay');
    EventBus.$off('goToNextDay');
    EventBus.$off('showEditFolderModal');

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
      console.log('METHODS • timelineview: generateHorizontalGrid');
      let timeEllapsed = this.timelineViewport.end - this.timelineViewport.start;
      let html = '';

      /****************************** make DAY ticks ******************************/

      let createDayTick = (currentDay) => {
        let xPos = this.getXPositionFromDate(currentDay);
        if(xPos === false) { return; }

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
        if(xPos === false) { return; }

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
        if(xPos === false) { return; }
        if(moment(currentMinute).minute() === 0) { return; }

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
      console.log(`METHODS • timelineview: scrollToMedia ${slugMediaName}`);
      let mediaToScrollTo = this.medias[slugMediaName];
      let mediaPosX = this.getMediaPosX(mediaToScrollTo.created);
      this.scrollTimelineToXPos(this.$root.settings.has_sidebar_opened ? mediaPosX : mediaPosX - this.sidebarWidth);
    },
    scrollToDate(timestamp) {
      console.log(`METHODS • timelineview: scrollToDate ${timestamp}`);
      let xPos = this.getXPositionFromDate(timestamp);
      this.scrollTimelineToXPos(this.$root.settings.has_sidebar_opened ? xPos : xPos - this.sidebarWidth);
    },
    highlightMedia(slugMediaName) {
      this.highlightedMedia = slugMediaName;
    },
    goToPrevDay() {
      console.log('METHODS • timelineview: goToPrevDay');
      let twentyFourHoursInSeconds = 24 * 60 * 60;
      let twentyFourHoursInPixels = Math.floor(twentyFourHoursInSeconds/this.timelineViewport.scale);
      this.scrollTimelineToXPos(this.$refs.timeline.scrollLeft - twentyFourHoursInPixels);
    },
    goToNextDay() {
      let twentyFourHoursInSeconds = 24 * 60 * 60;
      let twentyFourHoursInPixels = Math.floor(twentyFourHoursInSeconds/this.timelineViewport.scale);
      this.scrollTimelineToXPos(this.$refs.timeline.scrollLeft + twentyFourHoursInPixels);
    },
    goToPrevScreen() {
      let delta = this.$root.settings.has_sidebar_opened ? window.innerWidth - this.sidebarWidth : window.innerWidth;
      this.scrollTimelineToXPos(this.$refs.timeline.scrollLeft - delta );
    },
    goToNextScreen() {
      let delta = this.$root.settings.has_sidebar_opened ? window.innerWidth - this.sidebarWidth : window.innerWidth;
      this.scrollTimelineToXPos(this.$refs.timeline.scrollLeft + delta);
    },
    scrollTimelineToXPos(xPos_new) {

      this.isScrolling = true;

      this.$scrollTo('.m_timeline', 500, {
        container: this.$refs.timeline,
        offset: xPos_new,
        cancelable: true,
        easing: [0.45, 0.80, 0.58, 1.00],
        x: true,
        y: false,
        onDone: () => {
          this.$nextTick(() => {
            this.isScrolling = false;
            this.setCurrentDay();
            this.timelineViewport.scrollLeft = xPos_new;
          });
        },
        onCancel: () => {
          this.isScrolling = false;
        }
      });
    },

    toggleSidebar() {
      this.$root.settings.has_sidebar_opened = !this.$root.settings.has_sidebar_opened;
    },
    setCurrentDay(xPos = this.timelineViewport.scrollLeft + window.innerWidth/4) {
      let dateFromPosX = this.getDateFromXPosition(xPos);
      dateFromPosX = Math.min(this.timelineViewport.end, Math.max(dateFromPosX, this.timelineViewport.start));
      this.timelineViewport.currentDay = dateFromPosX;
    },
    updateTimelineViewportScale(val) {
      this.timelineViewport.scale = Number(val);
    },

    startEditModal() {
      if(this.folder.authorized) {
        this.showEditFolderModal = true;
      }
    }

  },
}
</script>

<style lang="sass">
</style>
