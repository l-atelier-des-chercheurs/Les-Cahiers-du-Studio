<template>
  <div class="m_sidebar" ref="sidebar">
    <SidebarSection v-if="$root.state.mode !== 'export_web'">
      <div slot="header" class="flex-vertically-centered">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t("folder_information") }}
          <button
            v-if="can_admin_folder"
            type="button"
            class="button-small border-circled button-thin button-wide padding-verysmall margin-none"
            @click="editFolder"
            :disabled="read_only"
          >
            {{ $t("edit") }}
          </button>
        </h3>
      </div>

      <div slot="body">
        <div class="margin-bottom-small">
          <span class="switch">
            <input
              type="checkbox"
              class="switch"
              id="placemediaoncreated"
              v-model="$root.settings.setDateTimelineToDateCreated"
            />
            <label for="placemediaoncreated">{{
              $t("on_import_place_media_on_the_date_they_were_created")
            }}</label>
          </span>
        </div>
      </div>
    </SidebarSection>

    <SidebarSection>
      <div slot="header">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t("share") }}
        </h3>
      </div>
      <div slot="body">
        <CreateQRCode :slugFolderName="slugFolderName" />
        <p class="font-small" v-if="$root.state.is_electron">
          {{ $t("contents_are_stored") }}
          <template>
            <a
              :href="folder.fullFolderPath"
              @click.prevent="openInFinder(folder.fullFolderPath)"
              >{{ folder.fullFolderPath.replace(/\//g, "\/\u200B") }}</a
            >
          </template>
        </p>
      </div>
    </SidebarSection>

    <SidebarSection>
      <div slot="header">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t("lang") }}
        </h3>
      </div>
      <div slot="body">
        <select v-model="currentLang">
          <option
            v-for="(name, code) in $root.lang.available"
            :value="code"
            :key="code"
            >{{ name }}</option
          >
        </select>
      </div>
    </SidebarSection>

    <SidebarSection v-if="$root.state.mode !== 'export_web'">
      <div slot="header">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t("keyboard_shortcuts") }}
          <button
            type="button"
            class="button-small border-circled button-thin button-wide padding-verysmall margin-none"
            @click="showKeyboardShortcutsList = true"
            :disabled="read_only"
          >
            {{ $t("open") }}
          </button>
        </h3>
      </div>
    </SidebarSection>

    <KeyboardShortcuts
      v-if="showKeyboardShortcutsList === true"
      :folder="folder"
      @close="showKeyboardShortcutsList = false"
    ></KeyboardShortcuts>

    <SidebarSection v-if="$root.state.mode !== 'export_web'">
      <div slot="header" class="flex-vertically-centered">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t("export_folder") }}
          <button
            type="button"
            class="button-small border-circled button-thin button-wide padding-verysmall margin-none"
            @click="showExportTimelineModal = true"
            :disabled="read_only"
          >
            {{ $t("open") }}
          </button>
        </h3>
      </div>
    </SidebarSection>

    <ExportTimeline
      v-if="showExportTimelineModal === true"
      :slugFolderName="slugFolderName"
      @close="showExportTimelineModal = false"
    ></ExportTimeline>

    <SidebarSection>
      <div slot="header">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t("calendar") }}
          <button
            v-if="is_realtime"
            type="button"
            class="button-small border-circled button-thin button-wide padding-verysmall margin-none c-rouge_vif"
            @click="scrollToToday()"
          >
            {{ $t("now") }}
          </button>
        </h3>
      </div>

      <div slot="body" class="m_calendar">
        <div v-if="!calendar">{{ $t("no_medias_sent_yet") }}</div>
        <div
          v-else
          v-for="(days, month) in calendar"
          class="m_calendar--month"
          :key="month"
        >
          <h3 class="margin-bottom-small text-ital font-small">{{ month }}</h3>
          <div class="m_calendar--days">
            <div
              v-for="(daymeta, index) in days"
              class="m_calendar--days--day padding-sides-verysmall padding-bottom-small"
              :class="{
                'has--noMedia': !daymeta.numberOfMedias,
                'is--visibleDay': isVisibleDay(daymeta.timestamp),
                'is--today': isDayToday(daymeta.timestamp)
              }"
              @click="scrollToDate(daymeta.timestamp)"
              :key="index"
            >
              <button class="font-verylarge padding-none">
                {{ daymeta.dayNumber }}
                <div class="font-veryverysmall bottomIndicator">
                  {{
                    daymeta.numberOfMedias > 0 ? daymeta.numberOfMedias : "."
                  }}
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
          {{ $t("list") }}
          <button
            type="button"
            class="button-small border-circled button-thin button-wide padding-verysmall margin-none"
            @click="showMediasListModal = true"
          >
            {{ $t("fullscreen") }}
          </button>
        </h3>
      </div>

      <div slot="body" class="margin-sides-negative-medium">
        <Tableau
          :display="'table'"
          :filter="filter"
          :sort="sort"
          :sortedMedias="sortedMedias"
          :slugFolderName="slugFolderName"
          :timeline_start="timeline_start"
          :timeline_end="timeline_end"
        ></Tableau>
      </div>
    </SidebarSection>

    <MediasList
      v-if="showMediasListModal"
      :filter="filter"
      :sort="sort"
      :sortedMedias="sortedMedias"
      :slugFolderName="slugFolderName"
      :timeline_start="timeline_start"
      :timeline_end="timeline_end"
      @close="showMediasListModal = false"
    />

    <div class="c-gris font-small margin-medium">
      <p>
        <em>Les Cahiers du Studio</em>
        version {{ $root.state.appVersion }}
      </p>
      <p v-html="$t('credits')"></p>
    </div>
  </div>
</template>
<script>
import Informations from "./sidebar/Informations.vue";
import Calendrier from "./sidebar/Calendrier.vue";
import Tableau from "./sidebar/Tableau.vue";
import SidebarSection from "./sidebar/SidebarSection.vue";
import MediasList from "./modals/MediasList.vue";
import KeyboardShortcuts from "./modals/KeyboardShortcuts.vue";
import ExportTimeline from "./modals/ExportTimeline.vue";
import qrcode from "@xkeshi/vue-qrcode";
import alertify from "alertify.js";
import CreateQRCode from "./qr/CreateQRCode.vue";

export default {
  components: {
    SidebarSection,
    Tableau,
    MediasList,
    KeyboardShortcuts,
    ExportTimeline,
    CreateQRCode
  },
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object,
    sortedMedias: Array,
    date_interval: Array,
    timeline_start: Number,
    timeline_end: Number,
    visible_day: Number,
    sort: Object,
    filter: String,
    can_admin_folder: Boolean,
    is_realtime: {
      type: Boolean,
      default: false
    },
    read_only: Boolean
  },
  data() {
    return {
      showMediasListModal: false,
      showKeyboardShortcutsList: false,
      showWriteupModal: false,
      showExportTimelineModal: false,
      currentLang: this.$root.lang.current
    };
  },
  mounted() {},
  beforeDestroy() {},
  computed: {
    // all_days() {
    //   const t0 = performance.now();

    //   const all_days = this.enumerateDaysBetweenDates(
    //     this.timeline_start,
    //     this.timeline_end
    //   );
    //   if (all_days.length === 0) {
    //     return [];
    //   }

    //   const t1 = performance.now();
    //   console.log(
    //     "COMPUTED • Sidebar: all_days took " + (t1 - t0) + " milliseconds."
    //   );

    //   return all_days;
    // },
    calendar() {
      console.log("COMPUTED • Sidebar: calendar");

      const dates_with_medias = this.date_interval.filter(
        d => d.number_of_medias
      );

      return dates_with_medias.reduce((acc, date) => {
        const monthYearName = this.$moment(date.timestamp).format("MMMM Y");

        if (!acc.hasOwnProperty(monthYearName)) {
          acc[monthYearName] = [];
        }
        let day = this.$moment(date.timestamp).date();

        let dayData = {
          dayNumber: day,
          numberOfMedias: date.number_of_medias,
          timestamp: date.timestamp
        };

        acc[monthYearName].push(dayData);
        return acc;

        // let monthYearName = this.$moment(cur).format("MMMM Y");
      }, {});
    }
  },

  watch: {
    currentLang: function() {
      this.$root.updateLocalLang(this.currentLang);
    }
  },

  methods: {
    editFolder() {
      this.$eventHub.$emit("showEditFolderModal");
    },
    // from https://stackoverflow.com/questions/23795522/how-to-enumerate-dates-between-two-dates-in-moment
    enumerateDaysBetweenDates(startDate, endDate) {
      var dates = [];

      var currDate = this.$moment(startDate)
        .startOf("day")
        .subtract(1, "days");
      var lastDate = this.$moment(endDate)
        .startOf("day")
        .add(1, "days");

      while (currDate.add(1, "days").diff(lastDate) < 0) {
        dates.push(currDate.clone().toDate());
      }

      return dates;
    },

    isDayToday(timestamp) {
      if (this.$moment(this.$root.currentTime_day).isSame(timestamp, "day")) {
        return true;
      }
      return false;
    },

    isVisibleDay(timestamp) {
      if (this.$moment(this.visible_day).isSame(timestamp, "day")) {
        return true;
      }
      return false;
    },

    getURLToApp(ip, port) {
      return `${this.$root.state.protocol}://${ip}:${port}/${this.slugFolderName}`;
    },
    openInFinder(thisPath) {
      const shell = window.require("electron").shell;
      event.preventDefault();
      shell.showItemInFolder(thisPath);
    },
    scrollToDate(timestamp) {
      this.$eventHub.$emit("scrollToDate", timestamp);
    },

    getNumberOfMediasCreatedOnThisDate(date) {
      if (Object.keys(this.medias).length === 0) {
        return 0;
      }

      const total = Object.entries(this.medias).reduce((acc, pair) => {
        const [key, value] = pair;

        let date_to_reference_to = 0;
        if (value.hasOwnProperty("date_timeline")) {
          date_to_reference_to = value.date_timeline;
        } else if (value.hasOwnProperty("date_created")) {
          date_to_reference_to = value.date_created;
        }

        let created_day = this.$moment(date_to_reference_to);
        if (created_day.isSame(date, "day")) {
          acc++;
        }
        return acc;
      }, 0);

      return total;
    },

    scrollToToday() {
      this.$eventHub.$emit("timeline.scrollToToday");
    }
  }
};
</script>

<style lang="sass"></style>
