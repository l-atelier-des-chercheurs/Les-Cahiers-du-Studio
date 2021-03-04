<template>
  <div class="m_sidebar" ref="sidebar">
    <div class="margin-sides-small">
      <select class="_langSelector" v-model="currentLang">
        <option
          v-for="(name, code) in $root.lang.available"
          :value="code"
          :key="code"
        >
          {{ name }}
        </option>
      </select>
    </div>

    <SidebarSection
      v-if="$root.state.mode !== 'export_web'"
      :open_by_default="true"
    >
      <!-- <div class="border border-bottom-dashed padding-medium"> -->
      <div slot="header" class="flex-vertically-centered">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t("folder_information") }}
        </h3>
      </div>

      <div slot="body">
        <div class="margin-bottom-small">
          <div class="m_folder" v-if="!show_informations">
            <h2
              data-v-2dc30bca=""
              class="m_folder--title margin-none padding-medium bg-noir c-blanc font-large"
            >
              {{ folder.name }}
            </h2>
          </div>
          <Folder
            v-else
            :slugFolderName="folder.slugFolderName"
            :folder="folder"
            :read_only="read_only"
            :context="'full'"
          />
          <button
            type="button"
            class="buttonLink"
            style="margin-left: auto; margin-right: 0"
            @click="show_informations = !show_informations"
          >
            {{ $t("more_informations") }}
          </button>
        </div>

        <!-- <div class="" v-if="can_edit_folder">
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
        </div> -->
        <!-- </div> -->

        <!-- <SidebarSection :open_by_default="true"> -->
        <!-- <div slot="header"> -->
        <h3 class="margin-none">
          <small>{{ $t("presentation") }}</small>
        </h3>
        <!-- </div> -->
        <!-- <div slot="body"> -->
        <div class="_introduction">
          <template v-if="!introduction_media">
            <button type="button" @click="createIntroduction">
              {{ $t("create_introduction") }}
            </button>
          </template>
          <template v-else>
            <template v-if="!edit_introduction">
              <div
                class="mediaWriteupContent"
                v-html="introduction_media.content"
              />
            </template>
            <template v-else>
              <CollaborativeEditor
                :slugFolderName="slugFolderName"
                :enable_collaboration="true"
                :media="introduction_media"
                :spellcheck="spellcheck"
                @connectionStateChanged="
                  (_connection_state) => (connection_state = _connection_state)
                "
                ref="textField"
                :read_only="read_only"
              />
            </template>

            <div class="_editButton">
              <button
                type="button"
                class="button-verysmall border-circled button-thin button-wide padding-verysmall margin-none"
                @click="edit_introduction = !edit_introduction"
                v-html="
                  !edit_introduction
                    ? $t('edit_introduction_text')
                    : $t('submit')
                "
              />
            </div>
          </template>
        </div>
      </div>
    </SidebarSection>

    <SidebarSection>
      <div slot="header">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t("access_with_other_devices") }}
        </h3>
      </div>
      <div slot="body">
        <CreateQRCode :slugFolderName="slugFolderName" />
        <!-- <p class="font-small" v-if="$root.state.is_electron">
          {{ $t("contents_are_stored") }}
          <template>
            <a
              :href="folder.fullFolderPath"
              @click.prevent="openInFinder(folder.fullFolderPath)"
              >{{ folder.fullFolderPath.replace(/\//g, "\/\u200B") }}</a
            >
          </template>
        </p>-->
      </div>
    </SidebarSection>

    <SidebarSection v-if="$root.state.mode !== 'export_web' && can_edit_folder">
      <div slot="header">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t("keyboard_shortcuts") }}
          <button
            type="button"
            class="button-verysmall border-circled button-thin button-wide padding-verysmall margin-none"
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

    <SidebarSection v-if="$root.state.mode !== 'export_web' && can_edit_folder">
      <div slot="header" class="flex-vertically-centered">
        <h3 class="margin-none text-cap with-bullet">
          {{ $t("export_folder") }}
          <button
            type="button"
            class="button-verysmall border-circled button-thin button-wide padding-verysmall margin-none"
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
            type="button"
            class="button-verysmall border-circled button-thin button-wide padding-verysmall margin-none c-rouge_vif"
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
          <h3 class="">
            {{ month }}
          </h3>
          <div class="m_calendar--days">
            <div
              v-for="(daymeta, index) in days"
              class="m_calendar--days--day padding-sides-verysmall padding-bottom-small"
              :class="{
                'has--noMedia': !daymeta.numberOfMedias,
                'is--visibleDay': isVisibleDay(daymeta.timestamp),
                'is--today': isDayToday(daymeta.timestamp),
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
            class="button-verysmall border-circled button-thin button-wide padding-verysmall margin-none"
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
import Folder from "./Folder.vue";
import Calendrier from "./sidebar/Calendrier.vue";
import Tableau from "./sidebar/Tableau.vue";
import SidebarSection from "./sidebar/SidebarSection.vue";
import MediasList from "./modals/MediasList.vue";
import KeyboardShortcuts from "./modals/KeyboardShortcuts.vue";
import ExportTimeline from "./modals/ExportTimeline.vue";
import qrcode from "@xkeshi/vue-qrcode";
import alertify from "alertify.js";
import CreateQRCode from "./qr/CreateQRCode.vue";
import AccessController from "./subcomponents/AccessController.vue";
import CollaborativeEditor from "./subcomponents/CollaborativeEditor.vue";

export default {
  components: {
    Folder,
    SidebarSection,
    Tableau,
    MediasList,
    KeyboardShortcuts,
    ExportTimeline,
    CreateQRCode,
    AccessController,
    CollaborativeEditor,
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
    can_edit_folder: Boolean,
    introduction_media: Object,
    read_only: Boolean,
  },
  data() {
    return {
      showMediasListModal: false,
      showKeyboardShortcutsList: false,
      showWriteupModal: false,
      showExportTimelineModal: false,
      currentLang: this.$root.lang.current,
      edit_introduction: false,
      show_informations: false,
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
        (d) => d.number_of_medias
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
          timestamp: date.timestamp,
        };

        acc[monthYearName].push(dayData);
        return acc;

        // let monthYearName = this.$moment(cur).format("MMMM Y");
      }, {});
    },
  },

  watch: {
    currentLang: function () {
      this.$root.updateLocalLang(this.currentLang);
    },
  },

  methods: {
    editFolder() {
      this.$eventHub.$emit("showEditFolderModal");
    },
    // from https://stackoverflow.com/questions/23795522/how-to-enumerate-dates-between-two-dates-in-moment
    enumerateDaysBetweenDates(startDate, endDate) {
      var dates = [];

      var currDate = this.$moment(startDate).startOf("day").subtract(1, "days");
      var lastDate = this.$moment(endDate).startOf("day").add(1, "days");

      while (currDate.add(1, "days").diff(lastDate) < 0) {
        dates.push(currDate.clone().toDate());
      }

      return dates;
    },
    createIntroduction() {
      this.$root
        .createMedia({
          slugFolderName: this.slugFolderName,
          type: "folders",
          additionalMeta: {
            type: "introduction",
          },
        })
        .then(() => {
          this.edit_introduction = true;
        });
    },

    isDayToday(timestamp) {
      if (this.$moment(this.$root.current_time.days).isSame(timestamp, "day")) {
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
    },
    removeFolder() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveFolder"),
          () => {
            this.$root.removeFolder({
              type: "folders",
              slugFolderName: this.slugFolderName,
            });
            this.$root.closeFolder();
          },
          () => {}
        );
    },
  },
};
</script>

<style lang="scss" scoped>
._langSelector {
  margin: 0 auto;
  margin-top: calc(var(--spacing) / 2);
  margin-right: 0;
  background-color: transparent;
  color: var(--color-noir);
  background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='41px' height='26px' viewBox='0 0 41 26' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cdefs%3E%3C/defs%3E%3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cpolygon id='Path-3' fill='%23222222' points='0 5.38215461 19.9830489 25.3652035 40.1398855 5.20836689 34.9315186 0 19.8691842 15.0623344 4.83971338 0.0328636246'%3E%3C/polygon%3E%3C/g%3E%3C/svg%3E%0A");
}
.m_folder {
  // border: 2px solid currentColor;
}
._editButton {
  margin-top: var(--spacing);
  text-align: center;
}
</style>
<style lang="scss">
._introduction .m_collaborativeEditor {
  .ql-toolbar.ql-snow {
    position: sticky;
    top: 0;
  }
  .ql-editor {
    height: auto;
    overflow: visible;
  }
}
</style>
