<template>
  <div class="m_sidebar" ref="sidebar">

    <SidebarSection v-if="$root.state.mode !== 'export'">
      <div slot="header" class="flex-vertically-centered">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t('folder_information') }}
          <button
            v-if="folder.authorized"
            type="button"
            class="button-small border-circled button-thin button-wide padding-verysmall margin-none"
            @click="openEditFolderModal()"
            :disabled="read_only"
          >
            {{ $t('edit') }}
          </button>
        </h3>
      </div>

      <div slot="body">
        <p class="font-small">
          <span v-html="$t('toconnectwithanotherdevicetothisfolder')"></span>

          <a v-for="(ip, index) in $root.state.localNetworkInfos.ip"
            :href="getURLToApp(ip, $root.state.localNetworkInfos.port)"
            class="js--openInBrowser qrSnippet button button-circled margin-vert-medium border-circled button-inline padding-small"
            target="_blank"
            :key="index"
            >
            <div class="qrSnippet--text">
              {{ getURLToApp(ip, $root.state.localNetworkInfos.port) }}
            </div>
            <div class="qrSnippet--motif">
              <qrcode :value="getURLToApp(ip, $root.state.localNetworkInfos.port)" :options="{ size: 100 }"></qrcode>
            </div>
          </a>
        </p>
        <p class="font-small" v-if="$root.state.is_electron">
          {{ $t('contents_are_stored') }}
          <template>
            <a :href="folder.fullFolderPath" @click.prevent="openInFinder(folder.fullFolderPath)">
              {{ folder.fullFolderPath.replace(/\//g, '\/\u200B') }}
            </a>
          </template>
        </p>
      </div>
    </SidebarSection>

    <SidebarSection>
      <div slot="header">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t('lang') }}
        </h3>
      </div>
      <div slot="body">
        <select v-model="currentLang">
          <option v-for="(name, code) in $root.lang.available" :value="code" :key="code">
            {{ name }}
          </option>
        </select>
      </div>
    </SidebarSection>
    
    <SidebarSection v-if="$root.state.mode !== 'export'">
      <div slot="header">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t('keyboard_shortcuts') }}
          <button
            type="button"
            class="button-small border-circled button-thin button-wide padding-verysmall margin-none"
            @click="showKeyboardShortcutsList = true"
            :disabled="read_only"            
          >
            {{ $t('open') }}
          </button>
        </h3>
      </div>
    </SidebarSection>
        
    <KeyboardShortcuts
      v-if="showKeyboardShortcutsList === true"
      @close="showKeyboardShortcutsList = false"
    >
    </KeyboardShortcuts>

    <SidebarSection v-if="$root.state.mode !== 'export'">
      <div slot="header" class="flex-vertically-centered">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t('export_folder') }}
          <button
            type="button"
            class="button-small border-circled button-thin button-wide padding-verysmall margin-none"
            @click="showExportTimelineModal = true"
            :disabled="read_only"            
          >
            {{ $t('open') }}
          </button>
        </h3>
      </div>
    </SidebarSection>

    <ExportTimeline
      v-if="showExportTimelineModal === true"
      :folder="folder"
      @close="showExportTimelineModal = false"
    >
    </ExportTimeline>

    <SidebarSection>
      <div slot="header">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t('calendar') }}
          <button
            v-if="isRealtime"
            type="button"
            class="button-small border-circled button-thin button-wide padding-verysmall margin-none c-rouge_vif"
            @click="scrollToToday()"
            >
            {{ $t('now') }}
          </button>
        </h3>
      </div>

      <div slot="body" class="m_calendar">
        <div
        v-for="(days, month) in folderDays()"
        class="m_calendar--month"
        :key="month"
        >
          <h3 class="margin-bottom-small text-ital font-small">
            {{ month }}
          </h3>
          <div class="m_calendar--days">
            <div
            v-for="(daymeta, index) in days"
            class="m_calendar--days--day padding-sides-verysmall padding-bottom-small"
            :class="{
              'is--visibleDay' : daymeta.isVisibleDay,
              'has--noMedia' : !daymeta.numberOfMedias,
              'is--today': daymeta.isToday
            }"
            @click="scrollToDate(daymeta.timestamp)"
            :key="index"
            >
              <button class="font-verylarge padding-none">
                {{ daymeta.dayNumber }}
                <div class="font-veryverysmall bottomIndicator">
                  {{ daymeta.numberOfMedias > 0 ? daymeta.numberOfMedias : '.' }}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarSection>

    <SidebarSection>
      <div slot="header">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t('list') }}
          <button
            type="button"
            class="button-small border-circled button-thin button-wide padding-verysmall margin-none"
            @click="openListMediasModal()"
          >
            {{ $t('fullscreen') }}
          </button>
        </h3>
      </div>

      <div slot="body" class="margin-sides-negative-medium">
        <Tableau
          v-if="showMediasList === false"
          :display="'table'"
          :filter="filter"
          :sort="sort"
          :sortedMedias="sortedMedias"
          :slugFolderName="slugFolderName"
          :timelineInfos="timelineInfos"
          >
        </Tableau>
      </div>
    </SidebarSection>

    <MediasList
      v-if="showMediasList === true"
      :filter="filter"
      :sort="sort"
      :sortedMedias="sortedMedias"
      :slugFolderName="slugFolderName"
      :timelineInfos="timelineInfos"
      @close="closeListMediasModal()"
    >
    </MediasList>

    <div class="c-gris font-small margin-medium">
      <p><em>Les Cahiers du Studio</em> version {{ $root.state.appVersion }}</p>
      <p v-html="$t('credits')"></p>
    </div>

  </div>

</template>
<script>
import Informations from './sidebar/Informations.vue';
import Calendrier from './sidebar/Calendrier.vue';
import Tableau from './sidebar/Tableau.vue';
import SidebarSection from './sidebar/SidebarSection.vue';
import MediasList from './modals/MediasList.vue';
import KeyboardShortcuts from './modals/KeyboardShortcuts.vue';
import ExportTimeline from './modals/ExportTimeline.vue';
import qrcode from '@xkeshi/vue-qrcode';
import alertify from 'alertify.js';

export default {
  components: {
    SidebarSection,
    Tableau,
    MediasList,
    KeyboardShortcuts,
    ExportTimeline,
    qrcode
  },
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object,
    sortedMedias: Array,
    timelineInfos: Object,
    visibleDay: Number,
    sort: Object,
    filter: String,
    isRealtime: {
      type: Boolean,
      default: false
    },
    showEditFolderModal: {
      type: Boolean,
      default: false
    },
    read_only: Boolean
  },
  data() {
    return {
      showMediasList: false,
      showKeyboardShortcutsList: false,
      showExportTimelineModal: false,
      currentLang: this.$root.lang.current,

    };
  },
  mounted() {
  },
  beforeDestroy() {
  },
  computed: {
  },

  watch: {
    currentLang: function() {
      this.$root.updateLocalLang(this.currentLang);
    }
  },

  methods: {
    // from https://stackoverflow.com/questions/23795522/how-to-enumerate-dates-between-two-dates-in-moment
    enumerateDaysBetweenDates(startDate, endDate) {
      var dates = [];

      var currDate = this.$moment(startDate)
        .startOf('day')
        .subtract(1, 'days');
      var lastDate = this.$moment(endDate)
        .startOf('day')
        .add(1, 'days');

      while (currDate.add(1, 'days').diff(lastDate) < 0) {
        dates.push(currDate.clone().toDate());
      }

      return dates;
    },

    getURLToApp(ip, port) {
      return `${this.$root.state.protocol}://${ip}:${port}/${
        this.slugFolderName
      }`;
    },
    openInFinder(thisPath) {
      const shell = window.require('electron').shell;
      event.preventDefault();
      shell.showItemInFolder(thisPath);
    },
    getVisibleDay() {
      return this.$moment(this.visibleDay).format('DD/MM/YYYY');
    },
    scrollToDate(timestamp) {
      this.$eventHub.$emit('scrollToDate', timestamp);
    },
    openListMediasModal() {
      this.showMediasList = true;
    },
    closeListMediasModal() {
      this.showMediasList = false;
    },
    folderDays() {
      console.log('METHODS • sidebar: getting folderDays');
      const allDays = this.enumerateDaysBetweenDates(
        this.timelineInfos.start,
        this.timelineInfos.end
      );
      if (allDays.length === 0) {
        return;
      }

      /*
      {
        "septembre": {
          21: {
            medias: 12
          },
          22: {
          },
        }
      */

      var dayGroupedByMonth = allDays.reduce((acc, cur, i) => {
        let monthName = this.$moment(cur).format('MMMM');
        let day = this.$moment(cur).date();

        let fullDate = this.$moment(cur).format('DD/MM/YYYY');
        let isVisibleDay = false;
        if (fullDate === this.getVisibleDay()) {
          isVisibleDay = true;
        }
        let isToday = false;
        let todaysDate = this.$moment().format('DD/MM/YYYY');
        if (todaysDate === fullDate) {
          isToday = true;
        }

        let dayData = {
          dayNumber: day,
          numberOfMedias: this.getNumberOfMediasCreatedOnThisDate(cur),
          timestamp: this.$moment(cur),
          isVisibleDay,
          isToday
        };

        if (typeof acc[monthName] === 'undefined') {
          acc[monthName] = [];
        }
        acc[monthName].push(dayData);
        return acc;
      }, {});

      return dayGroupedByMonth;
    },

    getNumberOfMediasCreatedOnThisDate(date) {
      if (Object.keys(this.medias).length === 0) {
        return 0;
      }

      const total = Object.entries(this.medias).reduce((acc, pair) => {
        const [key, value] = pair;
        let created_day = this.$moment(value.date_timeline);
        if (created_day.isSame(date, 'day')) {
          acc++;
        }
        return acc;
      }, 0);

      return total;
    },

    openEditFolderModal() {
      this.$eventHub.$emit('showEditFolderModal');
    },

    scrollToToday() {
      this.$eventHub.$emit('timeline.scrollToToday');
    }    
  }
};
</script>

<style lang="sass">


</style>