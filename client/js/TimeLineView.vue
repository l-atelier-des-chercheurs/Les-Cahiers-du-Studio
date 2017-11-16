<template>
  <div>

    <NavbarTop
      :folder="folder"
      :slugFolderName="slugFolderName"
      :visibleDay="timelineViewport.visibleDay"
      @toggleSidebar="toggleSidebar()"
      :timelineViewport_scale="timelineViewport.scale"
      >
    </NavbarTop>

    <transition name="component-fade">
      <div
        v-if="$root.settings.is_loading_medias_for_folder"
        class="loader_folder flex-wrap flex-vertically-centered flex-horizontally-centered"
        >
        <span class="animated flash">
          CHARGEMENT
        </span>
      </div>
    </transition>

    <transition name="sidebar-animation">
      <Sidebar
        v-if="$root.settings.has_sidebar_opened"
        :folder="folder"
        :slugFolderName="slugFolderName"
        :visibleDay="timelineViewport.visibleDay"
        :medias="medias"
        :timelineInfos="timelineInfos"
        :isRealtime="isRealtime"
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

    <div class="m_timeline"
      ref="timeline"
      @scroll="onScroll"
      :class="{
        'with--sidebar_opened' : $root.settings.has_sidebar_opened,
        'is--animated': isAnimated,
        'is--realtime': isRealtime
      }"
      >
      <div class="m_timeline-container"
        :style="{
          width: `${timelineViewport.width}px`,
          height: `${timelineViewport.height}px`
        }"
        >
        <div class="timeline_track">
        </div>

        <!-- GRID -->
        <div class="simple_grid_overlay">
          <div class="simple_grid_overlay--wrapper">

            <div
              v-if="overallGrid.days.length > 0"
              v-for="(item, index) in overallGrid.days"
              :key="`index`"
              class="gridItem font-small gridItem_isday"
              :class="{ 'has--caption' : (item.caption !== undefined) }"
              :style="{
                transform: `translate(${item.xPos}px, 0px)`
              }"
              >
              <div v-if="item.caption !== undefined" class="gridItem--caption">
                {{ item.caption }}
              </div>
            </div>

            <div
              v-if="overallGrid.hours.length > 0"
              v-for="(item, index) in overallGrid.hours"
              :key="`index`"
              class="gridItem font-small gridItem_ishour"
              :class="{ 'has--caption' : (item.caption !== undefined) }"
              :style="{
                transform: `translate(${item.xPos}px, 0px)`
              }"
              >
              <div v-if="item.caption !== undefined" class="gridItem--caption">
                {{ item.caption }}
              </div>
            </div>

            <div
              v-if="overallGrid.minutes.length > 0"
              v-for="(item, index) in overallGrid.minutes"
              :key="`index`"
              class="gridItem font-small gridItem_isminute"
              :class="{ 'has--caption' : (item.caption !== undefined) }"
              :style="{
                transform: `translate(${item.xPos}px, 0px)`
              }"
              >
              <div v-if="item.caption !== undefined" class="gridItem--caption">
                {{ item.caption }}
              </div>
            </div>

            <div
              v-if="!!todaysRule.xPos && isRealtime"
              :key="`todaysRule`"
              class="gridItem font-small gridItem_isrealtimerule"
              :style="{
                transform: `translate(${todaysRule.xPos}px, 0px)`
              }"
              >
              <div class="gridItem--caption">
                {{ todaysRule.caption }}
              </div>
              <button type="button" class="gridItem_isrealtimerule--autoscroll_checkbox button-small bg-rouge_vif border-circled button-thin button-wide padding-verysmall margin-none" >
                <small>
                  <label for="autoScroll" class="margin-none">
                    <input
                      type="checkbox"
                      v-model="timelineViewport.autoscroll"
                      id="autoScroll"
                    >défilement<br>
                    automatique
                  </label>
                </small>
              </button>
            </div>

            <transition name="fade">
              <div
                v-if="zoomZone.display"
                class="gridItem gridItem_zoomZone"
                :style="zoomZoneStyle()"
                >
              </div>
            </transition>
          </div>
        </div>

        <template v-if="Object.keys(medias).length > 0">
          <TimelineMedia v-for="(media, index) in medias"
            v-bind:key="index"
            :ref="`media_${index}`"
            :slugFolderName="slugFolderName"
            :slugMediaName="index"
            :isPlaceholder="!mediaIsClose(index,media)"
            :media="media"
            :timelineScale="timelineViewport.scale"
            :timelineHeight="timelineHeight"
            :posX="getMediaPosX(index)"
            :class="{ 'is--highlighted' : highlightedMedia === index }"
            @open="openMediaModal(index)"
            >
          </TimelineMedia>
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

import TimelineMedia from './components/TimelineMedia.vue';
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
    TimelineMedia,
    EditMedia,
    EditFolder,
    NavbarTop,
    Sidebar,
    AddMediaButton,
    DateTime
  },
  data() {
    return {
      topNavbarHeight: 60,
      timelinetrackHeight: 50,
      timelineHeight: 0,
      bottomScrollBar: 20,
      sidebarWidth: parseFloat(window.getComputedStyle(document.querySelector("html")).getPropertyValue("--sidebar-width")),

      showMediaModalFor: '',
      highlightedMedia: '',
      showEditFolderModal: false,

      isRealtime: false,
      isAnimated: true,
      isAdjustingScale: false,
      timelineUpdateRoutine: '',
      isScrolling: false,

      currentScrollEvent: undefined,

      currentTime: moment().millisecond(0),
      todaysRule: {
        caption: '',
        xPos: false
      },
      zoomZone: {
        display: false,
        xPos: 0,
        width: 50
      },

      overallGrid: {
        days: [],
        hours: [],
        minutes: []
      },

      allMediasPosition: {},

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
        visibleDay: 0,
        scrollLeft: this.$root.getScrollLeft(this.slugFolderName),
        autoscroll: false,
        longestIntervalTS: 86400000 * 10,
        leftPadding: 0,
        viewerWidth: 0
      },
    }
  },
  watch: {
    'folder': function() {
      console.log('WATCH • TimeLineView: folder');
      this.setTimelineBounds();
      this.setViewedTimelineBoundsFromInfos();
      this.setViewedTimelineWidthAndHeight();
      this.updateMediaData();
      this.updateGridData();
    },
    'medias': function() {
      this.updateMediaData();
    },
    'timelineViewport.scale': function() {
      console.log('WATCH • TimeLineView: timelineViewport.scale');

      // disable media animations
      this.isAnimated = false;

      // before updating the scale, we get the percent that's currently shown, store it, and we go back to it right after scaling
      let currentScrollLeft = this.$refs.timeline.scrollLeft;
      let currentScrollMiddle = currentScrollLeft + this.timelineViewport.viewerWidth/2 - this.timelineViewport.leftPadding;
      let currentScrollMiddle_percent = currentScrollMiddle / this.timelineViewport.width;

      this.setViewedTimelineWidthAndHeight();

      this.updateGridData();
      this.updateMediaData();

      // reenable media animations
      this.$nextTick(() => {
        let newScrollMiddle = this.timelineViewport.width * currentScrollMiddle_percent;
        let newScrollLeft = newScrollMiddle - this.timelineViewport.viewerWidth/2 + this.timelineViewport.leftPadding;
        this.$refs.timeline.scrollLeft = newScrollLeft;
        this.drawRealtimeRule();
        this.isAnimated = true;
      });

      this.$root.updateProjectScale(this.slugFolderName, this.timelineViewport.scale);
    },
    'timelineViewport.scrollLeft': function() {
      console.log('WATCH • TimeLineView: timelineViewport.scrollLeft');
      this.$root.updateProjectScrollLeft(this.slugFolderName, this.timelineViewport.scrollLeft);
      this.setVisibleDay();
    },
    'timelineViewport.visibleDay': function() {
      this.updateGridData();
    }
  },
  created() {
    console.log('CREATED • TimeLineView: folder');

    this.setTimelineBounds();
    this.setViewedTimelineBoundsFromInfos();
    this.setTimelineHeight();
    this.setViewedTimelineWidthAndHeight();
    this.updateMediaData();
  },
  mounted() {

    window.addEventListener('resize', debounce(this.onResize, 300));

    EventBus.$on('scrollToMedia', this.scrollToMedia);
    EventBus.$on('scrollToDate', this.scrollToDate);
    EventBus.$on('highlightMedia', this.highlightMedia);
    EventBus.$on('updateScale', this.updateTimelineViewportScale);
    EventBus.$on('goToPrevScreen', this.goToPrevScreen);
    EventBus.$on('goToNextScreen', this.goToNextScreen);
    EventBus.$on('goToPrevDay', this.goToPrevDay);
    EventBus.$on('goToNextDay', this.goToNextDay);
    EventBus.$on('showEditFolderModal', this.startEditModal);
    EventBus.$on('timeline.scrollToToday', this.scrollToToday);
    EventBus.$on('timeline.openMediaModal', this.openMediaModal);
    EventBus.$on('timeline.showZoomZone', this.showZoomZone);
    EventBus.$on('timeline.hideZoomZone', this.hideZoomZone);

    this.timelineViewport.leftPadding = parseInt($(this.$refs.timeline).css('padding-left'), 10);
    this.updateViewerWidth();

    // set scrollLeft to match timelineViewport.scrollLeft
    this.$refs.timeline.scrollLeft = this.timelineViewport.scrollLeft;

    if(this.timelineViewport.autoscroll) {
      this.scrollToToday();
    }
    // refresh everything that depends upon scrollLeft
    this.timelineViewport.scrollLeft = this.$refs.timeline.scrollLeft+1;

    this.timelineUpdateRoutine = setInterval(() => {

      if(this.isScrolling || !this.isRealtime) {
        return;
      }

      console.log(`METHODS • TimeLineView: setInterval updating (timelineUpdateRoutine)`);

      this.currentTime = moment().millisecond(0);
      this.setTimelineBounds();
      this.setViewedTimelineBoundsFromInfos();
      this.setViewedTimelineWidthAndHeight();

      if(this.timelineViewport.scrollLeft !== this.$refs.timeline.scrollLeft) {
        this.timelineViewport.scrollLeft = this.$refs.timeline.scrollLeft;
        this.setVisibleDay();
      }

      this.drawRealtimeRule();

      if(this.timelineViewport.autoscroll) {
        this.scrollToToday();
      }

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
    EventBus.$off('timeline.scrollToToday', this.scrollToToday);
    EventBus.$off('timeline.openMediaModal', this.openMediaModal);
    EventBus.$off('timeline.showZoomZone', this.showZoomZone);
    EventBus.$off('timeline.hideZoomZone', this.hideZoomZone);

    window.removeEventListener('resize', this.onResize);

    clearInterval(this.timelineUpdateRoutine);
  },
  computed: {
  },
  methods: {

    /******************************************************************
        Updates timelineInfos with folder start and end
    ******************************************************************/
    setTimelineBounds() {
      console.log('METHODS • TimeLineView: setTimelineBounds');
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
        // if end is in the future
        if(moment(ts,'YYYY-MM-DD HH:mm:ss', true).isAfter(moment())) {
          this.isRealtime = true;
          return moment(ts,'YYYY-MM-DD HH:mm:ss');
        // if end is is in the present or past
        } else {
          this.isRealtime = false;
          return moment(ts,'YYYY-MM-DD HH:mm:ss');
        }
      } else {
        // there is no valid end, we set end to current time and set realtime
        this.isRealtime = true;
        return this.currentTime;
      }
    },

    /******************************************************************
        Updates viewed timeline with a start and end
    ******************************************************************/
    setViewedTimelineBoundsFromInfos() {
      console.log('METHODS • TimeLineView: setViewedTimelineBoundsFromInfos');
      const newStart = this.getViewedTimelineStart(this.timelineInfos.start);
      if(+newStart !== +this.timelineViewport.start) {
        this.timelineViewport.start = newStart;
      }
      const newEnd = this.getViewedTimelineEnd(this.timelineInfos.end);
      if(+newEnd !== +this.timelineViewport.end) {
        this.timelineViewport.end = newEnd;
      }
    },

    setViewedTimelineWidthAndHeight() {
      console.log('METHODS • TimeLineView: setViewedTimelineWidthAndHeight');

      // récupérer la longueur de la timeline en TS
      let timeEllapsed = this.timelineViewport.end - this.timelineViewport.start;
      // décomposer en secondes
      let secondsEllapsed = timeEllapsed/1000;

      let w = Math.floor(secondsEllapsed/this.timelineViewport.scale);
      let h = Math.floor(this.timelineHeight);

      this.timelineViewport.width = w;
      this.timelineViewport.height = h;
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
    getMediaPosX(slugMediaName) {
      return this.allMediasPosition[slugMediaName];
    },
    updateMediaData() {
      console.log('METHODS • TimeLineView: updateMediaData');

      Object.keys(this.medias).map((slugMediaName) => {
        let media = this.medias[slugMediaName];
        let media_created = media.created;
        let createdTS = moment.isMoment(media_created) ? media_created : moment(media_created,'YYYY-MM-DD HH:mm:ss');
        let posX = this.getXPositionFromDate(+createdTS, false);
        this.allMediasPosition[slugMediaName] = posX;
      });
    },
    updateGridData() {
      console.log('METHODS • TimeLineView: updateGridData');

      let timeEllapsed = this.timelineViewport.end - this.timelineViewport.start;
      let overallGrid = { minutes: [], hours: [], days: [] };

      /****************************** make DAY ticks ******************************/

      let createDayTick = (thisDay, f = 'DD/MM/YYYY') => {
        let xPos = this.getXPositionFromDate(thisDay);
        if(xPos === false) { return; }
        let caption = moment(thisDay).format(f);
        overallGrid.days.push({ xPos, caption });
      }

      createDayTick(this.timelineViewport.start, 'DD/MM/YYYY HH:mm:ss');
      let nextDay = moment(moment(this.timelineViewport.start).startOf('day').add(1, 'day'));

      // we need to iterate by day (and not every 24 hours, because of possible daylight savings)
      for (var d = nextDay; d.isSameOrBefore(moment(this.timelineViewport.end)); d.add(1, 'days')) {
        createDayTick(d);
      }


      // only show HOUR and MINUTES for two screens on the left and right
      // to do that, we create a const for the current timestamp and another for the number of ms we show the grid
      let thisDayStart = moment(this.timelineViewport.visibleDay).subtract(2, 'days').startOf('day');
      const timeEllapsedDay = 5 * 24*60*60*1000;

      /****************************** make HOUR ticks ******************************/

      let createHourTick = (currentHour, withCaption = false) => {
        let xPos = this.getXPositionFromDate(currentHour);
        if(xPos === false) { return; }
        if(!this.elesIsClose(xPos, 4)) { return; }

        let caption;
        if(withCaption || this.timelineViewport.scale < 70) {
          caption = moment(currentHour).format('HH:mm');
        }
        overallGrid.hours.push({ xPos, caption });
      }

      createHourTick(this.timelineViewport.start, true);
      for(var h = 3600000; h < timeEllapsedDay; h +=  3600000) {
        let currentHour = thisDayStart + h;
        createHourTick(currentHour);
      }

     if(this.timelineViewport.scale <= 10) {

        /****************************** make MINUTES ticks ******************************/

        let createMinuteTick = (currentMinute) => {
          let xPos = this.getXPositionFromDate(currentMinute);
          if(xPos === false) { return; }
          if(moment(currentMinute).minute() === 0) { return; }
          if(!this.elesIsClose(xPos)) { return; }

          let caption;
          if(moment(currentMinute).minute()%10 === 0 || this.timelineViewport.scale < 5) {
            caption = moment(currentMinute).format('HH:mm');
          }
          overallGrid.minutes.push({ xPos, caption });
        }

        for(var m = 0; m < timeEllapsedDay; m += 60000) {
          let currentMinute = thisDayStart + m;
          createMinuteTick(currentMinute);
        }
      }

      this.overallGrid = overallGrid;
    },

    getXPositionFromDate(timestamp, removeFromTimelineIfOutOfBounds = true) {
      let msSinceStart = timestamp - this.timelineViewport.start;
      let pc = msSinceStart/(this.timelineViewport.end - this.timelineViewport.start);

      // What to do if the element (grid item or media) is out of the timeline
      if(pc < 0 || pc > 1) {
        if(removeFromTimelineIfOutOfBounds) { return false; }
      }
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
    mediaIsClose(index,media) {
      console.log(`METHODS • TimeLineView: mediaIsClose`);
      if(typeof this.$refs.timeline === 'undefined') { return false; }

      // check if media has duration
      if(media.duration !== undefined) {
        // calculate proximity for created
        if(this.elesIsClose(this.getMediaPosX(index))) {
          return true;
        }

        // otherwise, calculate proximity for created minus duration (which should give us when ths recording was started)
        let startRecordingDate = moment(media.created).subtract(parseInt(media.duration), 'seconds');
        if(this.elesIsClose(this.getXPositionFromDate(+startRecordingDate, false))) {
          return true;
        }
        // finally, let’s check whether we are in between those two dates
        let centerOfTimeline = this.timelineViewport.scrollLeft + this.timelineViewport.viewerWidth/2;
        if(this.getXPositionFromDate(+startRecordingDate, false) < centerOfTimeline && centerOfTimeline < this.getXPositionFromDate(media.created)) {
          return true;
        }
      } else {
        return this.elesIsClose(this.getMediaPosX(index));
      }
      return false;
    },
    elesIsClose(xPos, screenMultiplier = 1) {
      if(typeof xPos !== 'number') { return false; }
      if(typeof this.$refs.timeline === 'undefined') { return false; }

      if(xPos < this.timelineViewport.scrollLeft + this.timelineViewport.viewerWidth/2 - window.innerWidth * screenMultiplier) { return false; }
      if(xPos > this.timelineViewport.scrollLeft + this.timelineViewport.viewerWidth/2 + window.innerWidth * screenMultiplier) { return false; }
      return true;
    },
    onResize() {
      console.log(`METHODS • TimeLineView: onResize`);
      this.setTimelineHeight();
      this.setViewedTimelineWidthAndHeight();
      this.updateViewerWidth();
    },
    updateViewerWidth() {
      console.log(`METHODS • TimeLineView: updateViewerWidth`);
      this.timelineViewport.viewerWidth = this.$refs.timeline.offsetWidth;
    },
    setTimelineHeight() {
      console.log(`METHODS • TimeLineView: setTimelineHeight`);
      this.timelineHeight = window.innerHeight - this.topNavbarHeight - this.bottomScrollBar;
    },
    onScroll() {
      if(!this.isScrolling) {
        console.log(`METHODS • TimeLineView: onScroll / scroll has started`);
        this.isScrolling = true;
      }

      console.log(`METHODS • TimeLineView: onScroll / is happening`);
      clearTimeout(window.isScrollingTimeout);

      window.isScrollingTimeout = setTimeout(() => {
        console.log(`METHODS • TimeLineView: onScroll / has finished`);
        this.isScrolling = false;
        // the following line will trigger watch: scrollLeft (which takes care of everything)
        this.timelineViewport.scrollLeft = this.$refs.timeline.scrollLeft;
      }, 300);

    },
    openMediaModal(slugMediaName) {
      this.showMediaModalFor = slugMediaName;
    },
    closeMediaModal() {
      this.showMediaModalFor = '';
    },
    drawRealtimeRule() {
      if(!this.isRealtime) { return; }

      let xPos = this.getXPositionFromDate(this.currentTime);
      if(xPos === false) {
        this.todaysRule.xPos = false;
        return;
      }

      console.log('METHODS • TimeLineView: drawRealtimeRule');
      let caption = this.currentTime.format('HH:mm:ss');
      this.todaysRule = {
        caption,
        xPos
      };
    },
    scrollToEnd() {
      this.$refs.timeline.scrollLeft = this.timelineViewport.width;
    },
    scrollToToday() {
      console.log(`METHODS • TimeLineView: scrollToToday`);
      this.scrollToDate(this.currentTime);
    },
    scrollToMedia(slugMediaName) {
      console.log(`METHODS • TimeLineView: scrollToMedia / slugMediaName: ${slugMediaName}`);
      let mediaToScrollTo = this.medias[slugMediaName];
      let mediaPosX = this.getMediaPosX(slugMediaName);

      mediaPosX = this.adjustPosXValueForScrollX(mediaPosX);
      this.scrollTimelineToXPos(mediaPosX);
    },
    scrollToDate(timestamp) {
      console.log(`METHODS • TimeLineView: scrollToDate / timestamp: ${timestamp}`);
      let xPos = this.getXPositionFromDate(timestamp, false);

      xPos = this.adjustPosXValueForScrollX(xPos);
      this.scrollTimelineToXPos(xPos);
    },
    adjustPosXValueForScrollX(xPos) {
      xPos -= this.timelineViewport.viewerWidth/2;
      xPos += this.timelineViewport.leftPadding;
      return xPos;
    },

    highlightMedia(slugMediaName) {
      this.highlightedMedia = slugMediaName;
    },
    goToPrevDay() {
      console.log(`METHODS • TimeLineView: goToPrevDay`);
      let twentyFourHoursInSeconds = 24 * 60 * 60;
      let twentyFourHoursInPixels = Math.floor(twentyFourHoursInSeconds/this.timelineViewport.scale);
      this.scrollTimelineToXPos(this.$refs.timeline.scrollLeft - twentyFourHoursInPixels);
    },
    goToNextDay() {
      console.log(`METHODS • TimeLineView: goToNextDay`);
      let twentyFourHoursInSeconds = 24 * 60 * 60;
      let twentyFourHoursInPixels = Math.floor(twentyFourHoursInSeconds/this.timelineViewport.scale);
      this.scrollTimelineToXPos(this.$refs.timeline.scrollLeft + twentyFourHoursInPixels);
    },
/*
    // TODO: recalc pos with this.timelineViewport.viewerWidth/2
    goToPrevScreen() {
      console.log(`METHODS • TimeLineView: goToPrevScreen`);
      let delta = this.$root.settings.has_sidebar_opened ? window.innerWidth - this.sidebarWidth : window.innerWidth;
      this.scrollTimelineToXPos(this.$refs.timeline.scrollLeft - delta );
    },
    goToNextScreen() {
      console.log(`METHODS • TimeLineView: goToNextScreen`);
      let delta = this.$root.settings.has_sidebar_opened ? window.innerWidth - this.sidebarWidth : window.innerWidth;
      this.scrollTimelineToXPos(this.$refs.timeline.scrollLeft + delta);
    },
*/
    scrollTimelineToXPos(xPos_new) {
      console.log(`METHODS • TimeLineView: scrollTimelineToXPos / xPos_new = ${xPos_new}`);

      xPos_new = xPos_new;
      if(this.currentScrollEvent !== undefined) {
        this.currentScrollEvent();
        return;
      }

      this.currentScrollEvent = this.$scrollTo('.m_timeline', 500, {
        container: this.$refs.timeline,
        offset: xPos_new,
        cancelable: true,
        easing: [0.45, 0.80, 0.58, 1.00],
        x: true,
        y: false,
        onDone: () => {
          console.log(`METHODS • TimeLineView: scrollTimelineToXPos / is done`);
          this.currentScrollEvent = undefined;
          // onScroll will update view
        },
        onCancel: () => {
          console.log(`METHODS • TimeLineView: scrollTimelineToXPos / was canceled`);
          this.currentScrollEvent = undefined;
        }
      });
    },
    toggleSidebar() {
      console.log('METHODS • TimeLineView: toggleSidebar');
      this.$root.settings.has_sidebar_opened = !this.$root.settings.has_sidebar_opened;
      this.$nextTick(() => {
        this.updateViewerWidth();
      });
    },
    setVisibleDay(xPos = this.timelineViewport.scrollLeft + this.timelineViewport.viewerWidth/2) {
      console.log('METHODS • TimeLineView: setVisibleDay');
      let dateFromPosX = this.getDateFromXPosition(xPos);
      dateFromPosX = Math.min(this.timelineViewport.end, Math.max(dateFromPosX, this.timelineViewport.start));
      if(dateFromPosX !== this.timelineViewport.visibleDay) {
        this.timelineViewport.visibleDay = dateFromPosX;
      }
    },
    showZoomZone(val) {
      this.zoomZone.display = true;
      this.zoomZone.width = Math.floor((val/this.timelineViewport.scale) * this.timelineViewport.viewerWidth);
      this.zoomZone.xPos = this.timelineViewport.scrollLeft + this.timelineViewport.viewerWidth/2 - this.zoomZone.width/2 - this.timelineViewport.leftPadding;
    },
    hideZoomZone() {
      this.zoomZone.display = false;
      this.zoomZone.width = 0;
      this.zoomZone.xPos = 0;
    },

    updateTimelineViewportScale(val) {
      this.timelineViewport.scale = Number(val);
    },
    zoomZoneStyle() {
      return {
        width: `${this.zoomZone.width}px`,
        transform: `translate(${this.zoomZone.xPos}px, 0px)`
      }
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
