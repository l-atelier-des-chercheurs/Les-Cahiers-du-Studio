<template>
  <div class="m_navtimeline_wrapper">
    <transition name="fade" :duration="350">
      <div
        v-if="$root.settings.is_loading_medias_for_folder"
        class="loader_folder flex-wrap flex-vertically-centered flex-horizontally-centered"
      >
        <span class="animated flash">{{ $t("loading") }}</span>
      </div>
    </transition>

    <!-- <pre>{{ sortedMedias }}</pre> -->
    <!-- <pre>{{ groupedMedias }}</pre> -->

    <div
      class="m_navtimeline_wrapper--timeline_wrapper"
      :class="{ 'is--showingAddmediaOptions': is_showing_addmedia_options }"
    >
      <div :style="{ cursor, userSelect }" class="vue-splitter-container clearfix">
        <Pane
          class="splitter-pane splitter-paneL"
          :class="{ 'is--dragged': is_dragged }"
          :split="split"
          :style="{ [type]: percent + '%' }"
        >
          <transition name="chatopen" :duration="350" mode="out-in">
            <Informations
              v-if="
                $root.settings.has_sidebar_opened &&
                $root.settings.sidebar_type === 'informations'
              "
            />

            <Sidebar
              v-else-if="
                $root.settings.has_sidebar_opened &&
                $root.settings.sidebar_type === 'options'
              "
              :folder="folder"
              :slugFolderName="slugFolderName"
              :timeline_start="timeline_interval.start"
              :timeline_end="timeline_interval.end"
              :visible_day="visible_day"
              :medias="medias"
              :sortedMedias="sortedMedias"
              :date_interval="date_interval"
              :sort="sort"
              :filter="filter"
              :is_realtime="is_realtime"
              :read_only="read_only"
              :can_edit_folder="can_edit_folder"
            />
            <WriteUp
              v-else-if="
                $root.settings.has_sidebar_opened &&
                $root.settings.sidebar_type === 'journal'
              "
              :slugFolderName="slugFolderName"
              :medias="medias"
              :read_only="read_only"
            />

            <Chats
              v-else-if="
                $root.settings.has_sidebar_opened &&
                $root.settings.sidebar_type === 'chats'
              "
            />
          </transition>

          <template v-if="$root.state.mode !== 'export_web'">
            <button
              type="button"
              class="folder_backbutton"
              @click="$root.closeFolder()"
              @mouseover="collapse_foldername = false"
              @mouseleave="collapse_foldername = true"
              :class="{
                'is--collapsed': collapse_foldername,
                'is--movedToRight': $root.settings.has_sidebar_opened,
              }"
            >
              <span class="icon">←</span>
              <span class="project_name">{{ folder.name }}</span>
            </button>
          </template>
          <template v-else>
            <div class="folder_backbutton">
              <span class="margin-sides-small padding-verysmall text-centered">{{ folder.name }}</span>
            </div>
          </template>

          <div
            class="m_verticalButtons"
            :class="{ 'is--sidebarOpened': $root.settings.has_sidebar_opened }"
          >
            <div class="m_verticalButtons--container">
              <button
                type="button"
                :class="{
                  'is--active': $root.settings.sidebar_type === tab.key,
                }"
                v-for="tab in tabs"
                :key="tab.key"
                @click.stop.prevent="toggleSidebar(tab.key)"
              >
                <span v-html="$t(tab.key)" />
              </button>
              <!-- 
              <button
                type="button"
                @click.stop.prevent="toggleSidebar('journal')"
              >
                <span
                  v-if="$root.settings.sidebar_type === 'journal'"
                  v-html="`×&nbsp;` + $t('journal')"
                />
                <span v-else v-html="$t('journal')" />
                <span v-if="number_of_writeups" class="_writeups_number">{{
                  number_of_writeups
                }}</span>
              </button>-->
            </div>
          </div>
        </Pane>

        <Resizer
          :class="{ 'is--dragged': is_dragged }"
          :className="className"
          :style="{ [resizeType]: percent + '%' }"
          :split="split"
          @mousedown.native="onMouseDown"
          @click.native="onClick"
        />

        <Pane
          class="splitter-pane splitter-paneR"
          :class="{ 'is--dragged': is_dragged }"
          :style="{ [type]: 100 - percent + '%' }"
          :split="split"
        >
          <AddMedias
            :slugFolderName="slugFolderName"
            :folder="folder"
            :is_realtime="is_realtime"
            :current_author="$root.current_author"
            :can_edit_folder="can_edit_folder"
            :read_only="!$root.state.connected"
            :rightmostMedia="rightmostMedia"
          />

          <div
            class="m_floater"
            @wheel="onMousewheel"
            :class="{ 'is--current_day': visible_day_is_today }"
          >
            <div>
              <span>
                <transition name="fade" :duration="450">
                  <button
                    type="button"
                    v-if="visible_day_is_before_or_after === 'after'"
                    class="_scrolltonow _scrolltonow_before"
                    @click="scrollToToday()"
                  >←&nbsp;{{ $t("today") }}</button>
                </transition>
                <transition name="fade" mode="out-in" :duration="150">
                  <span :key="visible_day_human">{{ visible_day_human }}</span>
                </transition>
                <transition name="fade" :duration="450">
                  <button
                    type="button"
                    class="_scrolltonow _scrolltonow_after"
                    v-if="visible_day_is_before_or_after === 'before'"
                    @click="scrollToToday()"
                  >{{ $t("today") }}&nbsp;→</button>
                </transition>
              </span>
            </div>
            <TimelinePlayer />

            <div v-if="!can_edit_folder">
              <button
                type="button"
                @click="toggleSidebar('options')"
                :class="{ 'is--active': show_access_controller }"
              >
                <!-- @click="show_access_controller = !show_access_controller" -->
                {{ $t("edit_timeline") }}
              </button>
              <!-- <div v-if="show_access_controller">
                <AccessController
                  :folder="folder"
                  :context="'full'"
                  :type="'folders'"
                  @closeFolder="$root.closeFolder()"
                />
              </div>-->
            </div>
          </div>

          <div
            class="m_timeline"
            ref="timeline"
            :style="timeline_width"
            @wheel="onMousewheel"
            @mouseup.self="onMouseUp"
            @scroll="onTimelineScroll"
          >
            <!-- v-dragscroll -->
            <div class="m_timeline--container">
              <div class="m_timeline--container--dates" ref="timeline_dates">
                <div
                  v-for="day in date_interval"
                  :key="day.label"
                  :data-timestamp="day.timestamp"
                  class="m_timeline--container--dates--day"
                  :class="{
                    'is--empty': day.is_empty,
                    'is--current_day': day.is_current_day,
                    'is--folded': folded_days.includes(day.timestamp),
                  }"
                >
                  <template v-if="day.hasOwnProperty('is_empty_period')">
                    <div
                      class="m_timeline--container--dates--day--emptinessPeriodLabel"
                      v-html="day.is_empty_period"
                    />
                  </template>
                  <template v-else-if="day.hasOwnProperty('is_empty')"></template>
                  <template v-else>
                    <div class="m_timeline--container--dates--day--daylabel">
                      <div class="m_timeline--container--dates--day--daylabel--container">
                        <button
                          type="button"
                          :disabled="!day.segments || day.segments.length === 0"
                          @click="toggleDayFolding(day.timestamp)"
                        >
                          {{ day.label }}
                          <span
                            v-if="day.number_of_medias > 0"
                          >{{ day.number_of_medias }}</span>
                          <div class="_unfold_button" v-if="folded_days.includes(day.timestamp)">
                            <span>{{ $t("unfold") }}</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <template v-if="!folded_days.includes(day.timestamp)">
                      <div
                        v-for="segment in day.segments"
                        :key="segment.timestamp"
                        class="m_timeline--container--dates--day--mediasblock"
                        :class="{ 'has--label' : !segment.hidelabel }"
                      >
                        <template
                          v-if="
                            !segment.hasOwnProperty('hidelabel') ||
                            !segment.hidelabel ||
                            segment.medias.length > 0
                          "
                        >
                          <div
                            class="m_timeline--container--dates--day--mediasblock--label"
                            v-if="
                              !segment.hasOwnProperty('hidelabel') ||
                              !segment.hidelabel
                            "
                          >
                            <div>
                              <button
                                type="button"
                                @click="
                                  openMediaModal(
                                    segment.marker_meta_slugMediaName
                                  )
                                "
                                :style="`
                              --color-author: ${segment.color};
                              --label-color: ${
                                segment.color === 'var(--color-noir)'
                                  ? 'var(--color-blanc)'
                                  : 'var(--color-noir)'
                              };
                              `"
                                :data-has_author="!!segment.marker_author"
                              >
                                <span v-text="segment.label" />
                              </button>
                            </div>
                          </div>

                          <MediasBlock
                            v-if="segment.medias.length > 0"
                            :key="segment.timestamp"
                            :medias="segment.medias"
                            :folder="folder"
                            :slugFolderName="slugFolderName"
                            :timeline_height="timeline_height"
                          />
                        </template>
                      </div>
                    </template>
                  </template>
                </div>
              </div>
            </div>

            <div v-if="sort.current.field !== 'date_timeline'" class="m_filterIndicator">
              <div class="flex-wrap flex-vertically-centered flex-horizontally-start">
                <button
                  type="button"
                  class="button-small flex-nogrow bg-transparent border-circled padding-verysmall margin-right-small"
                  v-html="'x'"
                  @click="
                    setSort(sort.available[0]);
                    setFilter('');
                  "
                />
                <small>
                  <div class>
                    <span v-html="$t('active_filter:')" />
                    {{ " " }}
                    <span v-html="sort.current.name" />
                  </div>
                  <div class>
                    <span v-html="$t('medias_shown:')" />
                    <span
                      v-html="
                        this.sortedMedias.length +
                        '/' +
                        Object.keys(this.medias).length
                      "
                    />
                  </div>
                </small>
              </div>
            </div>
          </div>
        </Pane>
      </div>
    </div>

    <EditMedia
      v-if="show_media_modal_for"
      :slugFolderName="slugFolderName"
      :slugMediaName="show_media_modal_for"
      :media="medias[show_media_modal_for]"
      :folder="folder"
      :isRealtime="is_realtime"
      @close="show_media_modal_for = false"
      :read_only="!$root.state.connected || !can_edit_folder"
      :allAuthors="Array.isArray(folder.authors) ? folder.authors : []"
    />
    <EditFolder
      v-if="show_edit_folder_modal"
      :folder="folder"
      :slugFolderName="slugFolderName"
      @close="show_edit_folder_modal = false"
      :read_only="read_only"
      :allAuthors="folder.authors"
    />

    <!-- Ici la minimap -->
  </div>
</template>
<script>
import MediasBlock from "./components/MediasBlock.vue";
import Sidebar from "./components/Sidebar.vue";
import Informations from "./components/Informations.vue";
import EditFolder from "./components/modals/EditFolder.vue";
import AddMedias from "./components/AddMedias.vue";
import { setTimeout } from "timers";
import EditMedia from "./components/modals/EditMedia.vue";
import WriteUp from "./components/WriteUp.vue";
import Resizer from "./components/splitpane/Resizer.vue";
import Pane from "./components/splitpane/Pane.vue";
import TimelinePlayer from "./components/subcomponents/TimelinePlayer.vue";
import AccessController from "./components/subcomponents/AccessController.vue";
import Chats from "./components/chat/Chats.vue";

import debounce from "debounce";

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object,
    read_only: Boolean,
  },
  components: {
    WriteUp,
    MediasBlock,
    AddMedias,
    EditMedia,
    Sidebar,
    Informations,
    EditFolder,
    Resizer,
    Pane,
    TimelinePlayer,
    AccessController,
    Chats,
  },
  data() {
    return {
      translation: 0,
      // translation but refreshed at specific interval
      debounce_translation: 0,
      // -
      debounce_translation_delay: 100,
      debounce_translation_fct: undefined,
      current_scroll_event: undefined,

      is_realtime: false,
      timeline_height: window.innerHeight,
      collapse_foldername: false,

      show_media_modal_for: false,
      show_edit_folder_modal: false,
      is_showing_addmedia_options: false,

      convert_empty_days_to_periods: true,
      show_access_controller: false,

      minPercent: 0,
      split: "vertical",
      is_dragged: false,
      drag_offset: 0,
      hasMoved: false,
      height: null,
      percent: 0,
      type: "width",
      resizeType: "left",

      make_mediasblock_with: "markers",

      tabs: [
        {
          key: "informations",
        },
        {
          key: "options",
        },
        {
          key: "chats",
        },
        {
          key: "journal",
        },
      ],

      filter: "",
      sort: {
        current: {},

        available: [
          {
            field: "date_timeline",
            name: this.$t("date"),
            type: "date",
            order: "ascending",
          },
          {
            field: "date_modified",
            name: this.$t("last_modified"),
            type: "date",
            order: "descending",
          },
          {
            field: "caption",
            name: this.$t("caption"),
            type: "alph",
            order: "ascending",
          },
          {
            field: "type",
            name: this.$t("type"),
            type: "alph",
            order: "ascending",
          },
          // {
          //   field: "color",
          //   name: this.$t("color"),
          //   type: "alph",
          //   order: "ascending"
          // },
          {
            field: "keywords",
            name: this.$t("keywords"),
            type: "array",
            field_name: "title",
            order: "ascending",
          },
          {
            field: "authors",
            name: this.$t("author"),
            type: "array",
            field_name: "name",
            order: "ascending",
          },
          {
            field: "public",
            name: this.$t("public"),
            type: "bool",
            order: "descending",
          },
          {
            field: "content",
            name: this.$t("content"),
            type: "alph",
            order: "ascending",
          },
        ],
      },

      folded_days: [],
    };
  },

  created() {
    this.sort.current = this.sort.available[0];
  },
  mounted() {
    console.log("MOUNTED • TimeLineView");

    this.$root.settings.sidebar_type = "informations";
    this.$root.settings.has_sidebar_opened = true;

    this.$eventHub.$on("scrollToMedia", this.scrollToMedia);
    this.$eventHub.$on("scrollToDate", this.scrollToDate);
    this.$eventHub.$on("timeline.openMediaModal", this.openMediaModal);
    this.$eventHub.$on("setSort", this.setSort);
    this.$eventHub.$on("setFilter", this.setFilter);
    this.$eventHub.$on("timeline.scrollToToday", this.scrollToToday);
    this.$eventHub.$on("timeline.scrollToEnd", this.scrollToEnd);
    this.$eventHub.$on("showEditFolderModal", this.startEditModal);
    this.$eventHub.$on("editmediamodal.nextmedia", this.editModalNextMedia);
    this.$eventHub.$on(
      "editmediamodal.previousmedia",
      this.editModalPreviousMedia
    );
    this.$eventHub.$on("showingAddmediaOptions", this.showingAddmediaOptions);
    this.$eventHub.$on("hidingAddmediaOptions", this.hidingAddmediaOptions);

    this.setTimelineHeight();

    this.$eventHub.$once("socketio.folders.medias_listed", () => {
      setTimeout(() => {
        this.scrollToToday();
      }, 600);
    });

    this.$eventHub.$emit("scrollToDate", +new Date());

    this.onResize = debounce(this.onResize, 300);
    window.addEventListener("resize", this.onResize);

    if (this.$root.state.mode === "export_web") {
      this.percent = 50;
      this.$root.settings.has_sidebar_opened = true;
      this.$root.settings.sidebar_type = "journal";
    }

    setTimeout(() => {
      this.collapse_foldername = true;
    }, 2000);
  },
  beforeDestroy() {
    console.log("BEFOREDESTROY • TimeLineView");

    this.$eventHub.$off("scrollToMedia", this.scrollToMedia);
    this.$eventHub.$off("scrollToDate", this.scrollToDate);
    this.$eventHub.$off("timeline.openMediaModal", this.openMediaModal);
    this.$eventHub.$off("setSort");
    this.$eventHub.$off("setFilter");
    this.$eventHub.$off("timeline.scrollToToday", this.scrollToToday);
    this.$eventHub.$off("timeline.scrollToEnd", this.scrollToEnd);
    this.$eventHub.$off("showEditFolderModal", this.startEditModal);
    this.$eventHub.$off("editmediamodal.nextmedia", this.editModalNextMedia);
    this.$eventHub.$off(
      "editmediamodal.previousmedia",
      this.editModalPreviousMedia
    );
    this.$eventHub.$off("showingAddmediaOptions", this.showingAddmediaOptions);
    this.$eventHub.$off("hidingAddmdiaOptions", this.hidingAddmediaOptions);

    window.removeEventListener("resize", this.onResize);

    this.$root.settings.has_sidebar_opened = false;
  },
  watch: {
    translation: function () {
      this.$refs.timeline.scrollLeft = this.translation;

      if (!this.debounce_translation_fct) {
        this.debounce_translation_fct = setTimeout(() => {
          this.debounce_translation = this.translation;
          this.debounce_translation_fct = undefined;
        }, this.debounce_translation_delay);
      }
    },
    "$root.settings.sidebar_type": function () {
      if (this.$root.settings.sidebar_type === "") this.percent = 0;
      else this.percent = 30;
    },
  },
  computed: {
    number_of_writeups() {
      if (typeof this.medias === "object")
        return Object.values(this.medias).filter(
          (media) => media.hasOwnProperty("type") && media.type === "writeup"
        ).length;
      return false;
    },
    can_edit_folder() {
      return this.$root.canEditFolder({
        type: "folders",
        slugFolderName: this.slugFolderName,
      });
    },
    can_see_folder() {
      return this.$root.canSeeFolder({
        type: "folders",
        slugFolderName: this.slugFolderName,
      });
    },
    folder_authors() {
      return this.folder.hasOwnProperty("authors") && this.folder.authors !== ""
        ? this.folder.authors
        : [];
    },
    sortedMedias() {
      console.log("COMPUTED • TimeLineView: sortedMedias");
      var sortable = [];
      let current_sort = !!this.sort.current.type
        ? this.sort.current
        : this.sort.available[0];

      for (let slugMediaName in this.medias) {
        let mediaDataToOrderBy;
        const media = this.medias[slugMediaName];

        if (media.hasOwnProperty("type") && media.type === "writeup") {
          continue;
        }

        // if media is missing the
        if (!media.hasOwnProperty(current_sort.field)) {
          // legacy to account for medias without date_timeline but with date_created or created
          if (current_sort.field === "date_timeline") {
            if (media.hasOwnProperty("date_created")) {
              this.medias[slugMediaName].date_timeline = media.date_created;
            } else if (media.hasOwnProperty("created")) {
              this.medias[slugMediaName].date_timeline = media.created;
            }
          } else {
            continue;
          }
        }

        if (current_sort.type === "date") {
          const _date = this.$moment(
            media[current_sort.field],
            "YYYY-MM-DD HH:mm:ss"
          );
          if (_date.isValid()) {
            mediaDataToOrderBy = +_date;
          } else {
            mediaDataToOrderBy = false;
          }
        } else if (current_sort.type === "alph") {
          mediaDataToOrderBy = media[current_sort.field].toLowerCase();
        } else if (current_sort.type === "array") {
          let media_prop = media[current_sort.field];
          if (typeof media_prop === "string") {
            media_prop = [{ [current_sort.field_name]: media_prop }];
          }
          mediaDataToOrderBy = media_prop.map(
            (a) => a[current_sort.field_name]
          );
        }

        sortable.push({
          slugMediaName,
          mediaDataToOrderBy,
        });
      }
      let sortedSortable = sortable.sort((a, b) => {
        if (a.mediaDataToOrderBy < b.mediaDataToOrderBy) {
          return -1;
        }
        if (a.mediaDataToOrderBy > b.mediaDataToOrderBy) {
          return 1;
        }

        return 0;
      });

      if (current_sort.order === "descending") {
        sortedSortable.reverse();
      }

      // array order is garanteed while objects properties aren’t,
      // that’s why we use an array here
      let sortedMedias = sortedSortable.reduce((result, d) => {
        let sortedMediaObj = this.medias[d.slugMediaName];
        sortedMediaObj.slugMediaName = d.slugMediaName;

        if (this.filter.length > 0) {
          // if there is a filter set, let’s only return medias whose mediaDataToOrderBy contain that string
          if (current_sort.type === "array") {
            let media_prop = sortedMediaObj[current_sort.field];
            if (typeof media_prop === "string") {
              media_prop = [{ [current_sort.field_name]: media_prop }];
            }

            let originalContentFromMedia = media_prop.map(
              (a) => a[current_sort.field_name]
            );

            // search even for part of the word — problem: looking for Marie and not Marie-Claire wouldn’t be possible
            // myArr.findIndex(v ==> v.contains("oran"));

            if (originalContentFromMedia.includes(this.filter)) {
              result.push(sortedMediaObj);
            }
          } else {
            let originalContentFromMedia =
              sortedMediaObj[current_sort.field] + "";
            if (originalContentFromMedia.indexOf(this.filter) !== -1) {
              result.push(sortedMediaObj);
            }
          }
        } else {
          result.push(sortedMediaObj);
        }

        return result;
      }, []);
      return sortedMedias;
    },
    groupedMedias() {
      console.log("COMPUTED • TimeLineView: groupedMedias");

      var t0 = performance.now();

      if (this.sortedMedias.length === 0) {
        return [];
      }

      // groupby day
      let mediaGroup = this.$_.groupBy(this.sortedMedias, (media) => {
        let date_to_reference_to = 0;
        if (media.hasOwnProperty("date_timeline")) {
          date_to_reference_to = media.date_timeline;
        } else if (media.hasOwnProperty("date_created")) {
          date_to_reference_to = media.date_created;
        } else if (media.hasOwnProperty("created")) {
          date_to_reference_to = media.created;
        }

        const dateMoment = this.$moment(date_to_reference_to);
        return dateMoment.format("YYYY-MM-DD");
      });
      mediaGroup = this.$_.toPairs(mediaGroup);

      if (this.make_mediasblock_with === "hours") {
        mediaGroup = mediaGroup.map(([day, medias]) => {
          let medias_by_hours = this.$_.groupBy(medias, (media) => {
            let date_to_reference_to = 0;
            if (media.hasOwnProperty("date_timeline")) {
              date_to_reference_to = media.date_timeline;
            } else if (media.hasOwnProperty("date_created")) {
              date_to_reference_to = media.date_created;
            } else if (media.hasOwnProperty("created")) {
              date_to_reference_to = media.created;
            }

            var dateMoment = this.$moment(date_to_reference_to);
            return dateMoment.format("HH") + ":00";
          });

          // from
          // {
          //   "10:00": [
          //     {},
          //     {}
          //   ]
          // };
          // to
          // {
          //   label: "11:00"
          //   medias: [
          //     {},
          //     {}
          //   ]
          // };
          medias_by_hours = Object.entries(medias_by_hours).reduce(
            (acc, [hour, medias]) => {
              acc.push({
                label: hour,
                medias,
              });
              return acc;
            },
            []
          );
          // medias_by_hours = this.$_.toPairs(medias_by_hours);
          // medias_by_hours = this.$_.sortBy(medias_by_hours);
          // medias_by_hours = medias_by_hours.reverse();

          return {
            day,
            segments: medias_by_hours,
          };
        });
      } else if (this.make_mediasblock_with === "markers") {
        mediaGroup = mediaGroup.map(([day, medias]) => {
          let medias_by_markers = medias.reduce(
            (acc, media) => {
              // avancer dans l’array, en ajoutant dans un accumulator
              if (media.type === "marker") {
                const label =
                  this.$moment(media.date_timeline).format("HH:mm") +
                  "\n" +
                  (!!media.content ? media.content : "");
                const color = this.$root.mediaColorFromFirstAuthor(
                  media,
                  this.folder
                )
                  ? this.$root.mediaColorFromFirstAuthor(media, this.folder)
                  : "var(--color-noir)";
                const marker_author = this.$root.mediaFirstAuthor(
                  media,
                  this.folder
                )
                  ? this.$root.mediaFirstAuthor(media, this.folder).name
                  : false;

                acc.push({
                  label,
                  color,
                  timestamp: media.date_timeline,
                  marker_meta_slugMediaName: media.slugMediaName,
                  marker_author,
                  medias: [],
                });
              } else {
                acc[acc.length - 1].medias.push(media);
              }
              return acc;
            },
            [{ label: "", medias: [], hidelabel: true }]
          );
          // {
          //   label: "Début des répétitions"
          //   medias: [
          //     {},
          //     {}
          //   ]
          // };
          return {
            day,
            segments: medias_by_markers,
          };
        });
      }

      var t1 = performance.now();
      console.log(
        "COMPUTED • TimeLineView: groupedMedias took " +
          (t1 - t0) +
          " milliseconds."
      );

      return mediaGroup;
    },
    timeline_interval() {
      let temp_start = +this.$moment();
      let temp_end = +this.$moment();

      this.sortedMedias.map((m) => {
        if (this.$moment(m.date_timeline, "YYYY-MM-DD HH:mm:ss").isValid()) {
          const media_date = +this.$moment(
            m.date_timeline,
            "YYYY-MM-DD HH:mm:ss"
          );
          if (media_date < temp_start) {
            temp_start = media_date;
          }
          if (media_date > temp_end) {
            temp_end = media_date;
          }
        }
      });

      return {
        start: temp_start,
        end: temp_end,
      };
    },
    full_date_interval() {
      // console.log('COMPUTED • TimeLineView: full_date_interval');
      // itérer dans toutes les dates,
      // et construire un array de date
      let full_date_interval = [];

      let startDate = this.$moment(this.timeline_interval.start);
      const lastDate = this.$moment(this.timeline_interval.end);

      let index = 0;

      while (startDate.diff(lastDate) <= 0) {
        let this_date = startDate.clone();
        let medias_for_date = [];

        const has_media_for_date = this.groupedMedias.filter((i) =>
          this.$moment(i.day).isSame(this_date, "day")
        );

        if (has_media_for_date.length > 0) {
          medias_for_date = has_media_for_date[0].segments;
        }

        const is_current_day =
          this.$root.current_time.days &&
          this.$root.current_time.days.isSame(this_date, "day");

        const number_of_medias = Object.values(medias_for_date).reduce(
          (acc, element) => acc + element.medias.length,
          0
        );

        const format =
          index === 0
            ? "LLLL"
            : this.$root.lang.current === "fr"
            ? "dddd D MMMM Y"
            : "dddd, MMMM D Y";

        let day = {
          label: this_date.format(format),
          timestamp: +this_date,
          is_current_day,
          number_of_medias,
          segments: medias_for_date,
        };

        full_date_interval.push(day);

        if (index === 0) startDate.startOf("day");

        startDate.add(1, "days");

        index++;
      }

      // days = days.map(d => d.format('L'));
      return full_date_interval;
    },
    date_interval() {
      // console.log('COMPUTED • TimeLineView: date_interval');

      var t0 = performance.now();

      // check if multiple days (3+) in a row are empty
      let date_interval = [];
      // let min_consecutive_empty_days = 3;

      date_interval = this.full_date_interval.reduce((acc, day, index) => {
        if (
          day.number_of_medias > 0 ||
          acc.length === 0 ||
          index === this.full_date_interval.length - 1
        ) {
          acc.push(day);
        } else {
          // if last added day has 0
          // acc.push(day);
          if (day.number_of_medias === 0 && day.segments.length === 0) {
            day.is_empty = true;

            if (!this.convert_empty_days_to_periods) {
              acc.push(day);
            } else {
              const x = 8;

              // if has more than X days since beginning, and if the last X days are empty
              if (acc.length > x && !acc.slice(-x).some((d) => !d.is_empty)) {
                const last_item = acc[acc.length - 1];

                if (!last_item.hasOwnProperty("is_empty_period")) {
                  day.is_empty_period = this.$t("one_week_later");
                  acc.push(day);
                } else {
                  const duration = this.$moment.duration(
                    day.timestamp - last_item.timestamp + 86400000 * x
                  );

                  if (duration.asWeeks() === 1) {
                    last_item.is_empty_period = this.$t("one_week_later");
                  } else {
                    if (duration.asWeeks() < 4) {
                      last_item.is_empty_period =
                        `${Math.round(duration.asWeeks())}` +
                        this.$t("weeks_later");
                    } else if (duration.asMonths() < 12) {
                      last_item.is_empty_period =
                        `${Math.round(duration.asMonths())}` +
                        this.$t("months_later");
                    } else {
                      last_item.is_empty_period =
                        `${Math.round(duration.asYears())}` +
                        this.$t("years_later");
                    }
                  }
                }
              } else {
                acc.push(day);
              }
            }
          } else {
            acc.push(day);
          }
        }
        return acc;
      }, []);

      var t1 = performance.now();
      console.log(
        "COMPUTED • TimeLineView: date_interval took " +
          (t1 - t0) +
          " milliseconds."
      );

      return date_interval;
      // return this.full_date_interval;
    },
    visible_day() {
      console.log("COMPUTED • TimeLineView: visible_day");

      // IMPORTANT : to make sure visible_day is called when this.translation changes
      this.debounce_translation;
      return this.findDayAtPosX(this.debounce_translation);
    },
    visible_day_is_today() {
      if (
        this.$moment(this.$root.current_time.days).isSame(
          this.visible_day,
          "day"
        )
      )
        return true;
      return false;
    },
    visible_day_is_before_or_after() {
      const now = this.$moment(this.$root.current_time.days);
      if (now.isSame(this.visible_day, "day")) return false;
      if (now.isBefore(this.visible_day, "day")) return "after";
      return "before";
    },
    visible_day_human() {
      if (this.$root.lang.current === "fr") {
        return this.$moment(this.visible_day).calendar(null, {
          lastDay: "[hier]",
          sameDay: "[aujourd’hui]",
          nextDay: "[demain]",
          lastWeek: "dddd [dernier]",
          nextWeek: "dddd [prochain]",
          sameElse: "dddd D MMMM Y",
        });
      } else if (this.$root.lang.current === "en") {
        return this.$moment(this.visible_day).calendar(null, {
          lastDay: "[yesterday]",
          sameDay: "[today]",
          nextDay: "[tomorrow]",
          lastWeek: "[last] dddd",
          nextWeek: "[next] dddd",
          sameElse: "dddd, MMMM D Y",
        });
      }
    },
  },
  methods: {
    onMousewheel(event) {
      // console.log('METHODS • TimeLineView: onMousewheel');

      event.preventDefault();

      let new_translation = this.translation;
      new_translation += event.deltaX;
      new_translation += event.deltaY;

      const el = this.$refs.timeline;

      const timeline_width = el.children[0].offsetWidth - el.offsetWidth;

      new_translation = Math.max(new_translation, 0);
      new_translation = Math.min(new_translation, timeline_width);

      if (new_translation !== this.translation) {
        this.translation = new_translation;
      }
    },
    onMouseUp(event) {
      console.log("METHODS • TimeLineView: onMouseUp");

      const el = this.$refs.timeline;
      setTimeout(() => (this.translation = el.scrollLeft), 300);
    },
    onResize() {
      console.log(`METHODS • TimeLineView: onResize`);
      this.setTimelineHeight();
    },
    setTimelineHeight() {
      console.log(`METHODS • TimeLineView: setTimelineHeight`);
      if (this.timeline_height !== window.innerHeight) {
        this.timeline_height = window.innerHeight;
      }
    },
    scrollToToday() {
      this.scrollToDate(+this.$root.current_time.days);
    },
    scrollToEnd() {
      const x =
        this.$refs.timeline.children[0].offsetWidth -
        this.$refs.timeline.offsetWidth;
      this.scrollTimelineToXPos(x);
    },
    toggleDayFolding(timestamp) {
      if (this.folded_days.includes(timestamp))
        this.folded_days = this.folded_days.filter((t) => t !== timestamp);
      else this.folded_days.push(timestamp);
    },
    showingAddmediaOptions() {
      this.is_showing_addmedia_options = true;
    },
    hidingAddmediaOptions() {
      this.is_showing_addmedia_options = false;
    },
    findDayAtPosX(posX) {
      if (
        !this.$refs.hasOwnProperty("timeline_dates") ||
        this.$refs.timeline_dates.children.length === 0
      )
        return this.timeline_interval.start;

      const first_day = Array.from(this.$refs.timeline_dates.children).find(
        (d) =>
          d.offsetLeft + d.offsetWidth >=
          posX + this.$refs.timeline.offsetWidth / 2
      );
      if (!!first_day && first_day.dataset.hasOwnProperty("timestamp")) {
        return +this.$moment(Number(first_day.dataset.timestamp));
      }

      return this.timeline_interval.end;
    },
    startEditModal() {
      if (this.can_see_folder) {
        this.show_edit_folder_modal = true;
      }
    },
    findPosXForDate(day) {
      if (
        !this.$refs.hasOwnProperty("timeline_dates") ||
        this.$refs.timeline_dates.children.length === 0
      ) {
        return 0;
      }
      const first_day = Array.from(this.$refs.timeline_dates.children).find(
        (d) =>
          d.dataset.hasOwnProperty("timestamp") &&
          Number(d.dataset.timestamp) >= day
      );
      if (!!first_day) {
        return first_day.offsetLeft;
      }
      return 0;
    },
    openMediaModal(slugMediaName) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          "METHODS • TimeLineView: openMediaModal for " + slugMediaName
        );
      }

      if (!this.medias.hasOwnProperty(slugMediaName)) {
        if (this.$root.state.dev_mode === "debug") {
          console.log(
            "METHODS • TimeLineView: openMediaModal / missing media in timeline"
          );
        }
      } else {
        this.show_media_modal_for = slugMediaName;
      }
    },
    closeMediaModal() {
      this.show_media_modal_for = false;
    },
    editModalNextMedia() {
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • TimeLineView: editModalNextMedia");
      }

      if (this.show_media_modal_for) {
        // find in sortedMedias where this.show_media_modal_for and get the next one
        const current_media_index = this.sortedMedias.findIndex(
          (m) => m.slugMediaName === this.show_media_modal_for
        );

        this.closeMediaModal();

        if (current_media_index < this.sortedMedias.length - 1) {
          const new_media = this.sortedMedias[current_media_index + 1];
          if (new_media.hasOwnProperty("slugMediaName")) {
            this.$nextTick(() => {
              this.openMediaModal(new_media.slugMediaName);
            });
          }
        }
      }
    },
    editModalPreviousMedia() {
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • TimeLineView: editModalPreviousMedia");
      }

      if (this.show_media_modal_for) {
        // find in sortedMedias where this.show_media_modal_for and get the next one
        const current_media_index = this.sortedMedias.findIndex(
          (m) => m.slugMediaName === this.show_media_modal_for
        );

        this.closeMediaModal();

        if (current_media_index > 0) {
          const new_media = this.sortedMedias[current_media_index - 1];
          if (new_media.hasOwnProperty("slugMediaName")) {
            this.$nextTick(() => {
              this.openMediaModal(new_media.slugMediaName);
            });
          }
        }
      }
    },

    toggleSidebar(type) {
      console.log(`METHODS • TimeLineView: toggleSidebar / ${type}`);
      if (this.$root.settings.sidebar_type === type) {
        this.$root.settings.has_sidebar_opened = false;
        this.$root.settings.sidebar_type = "";
      } else {
        this.$root.settings.has_sidebar_opened = true;
        this.$root.settings.sidebar_type = type;
      }
    },
    scrollToDate(timestamp) {
      console.log(
        `METHODS • TimeLineView: scrollToDate / timestamp: ${timestamp}`
      );
      const x = this.findPosXForDate(timestamp);
      this.scrollTimelineToXPos(x + 20);
    },
    scrollToMedia(slugMediaName) {
      console.log(
        `METHODS • TimeLineView: scrollToMedia / slugMediaName: ${slugMediaName}`
      );

      const $medias = this.$refs.timeline.getElementsByClassName(
        "mediaContainer"
      );

      if ($medias.length === 0) return false;

      const media_in_timeline = Array.from($medias).find(
        (m) =>
          m.dataset.hasOwnProperty("slugmedianame") &&
          m.dataset.slugmedianame === slugMediaName
      );

      if (!media_in_timeline) {
        console.log(
          `METHODS • TimeLineView: scrollToMedia / media_in_timeline wasn’t found`
        );
        return false;
      }

      const x =
        media_in_timeline.parentElement.parentElement.parentElement
          .parentElement.parentElement.parentElement.offsetLeft +
        media_in_timeline.parentElement.parentElement.parentElement
          .parentElement.parentElement.offsetLeft +
        media_in_timeline.parentElement.parentElement.offsetLeft;

      // const x = media_in_timeline.getBoundingClientRect().x;

      this.scrollTimelineToXPos(x);
    },
    scrollTimelineToXPos(xPos_new) {
      console.log(
        `METHODS • TimeLineView: scrollTimelineToXPos / xPos_new = ${xPos_new}`
      );

      if (this.current_scroll_event !== undefined) {
        this.current_scroll_event();
        return;
      }

      // xPos_new -= 50;
      xPos_new -= this.$refs.timeline.offsetWidth / 2;

      this.current_scroll_event = this.$scrollTo(
        ".m_timeline--container",
        500,
        {
          container: this.$refs.timeline,
          offset: xPos_new,
          cancelable: true,
          easing: [0.45, 0.8, 0.58, 1.0],
          x: true,
          y: false,
          onDone: () => {
            console.log(
              `METHODS • TimeLineView: scrollTimelineToXPos / is done`
            );
            this.current_scroll_event = undefined;
            // onScroll will update view
          },
          onCancel: () => {
            console.log(
              `METHODS • TimeLineView: scrollTimelineToXPos / was canceled`
            );
            this.current_scroll_event = undefined;
          },
        }
      );
    },

    onTimelineScroll() {
      // console.log('METHODS • TimeLineView: onTimelineScroll');
      const el = this.$refs.timeline;
      this.translation = el.scrollLeft;
    },
    // prev / nav
    setSort(newSort) {
      console.log("METHODS • TimeLineView: setSort");
      this.sort.current = newSort;
    },
    setFilter(newFilter) {
      console.log("METHODS • TimeLineView: setFilter");
      this.filter = newFilter;
    },

    dragPubliPanel(event, type) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • App: dragPubliPanel with type = ${type} and is_dragged = ${this.is_dragged}`
        );
      }

      this.drag_offset = -event.target.offsetWidth + event.offsetX;
      if (!this.drag_offset) {
        this.drag_offset = 0;
      }

      if (type === "mouse") {
        window.addEventListener("mousemove", this.dragMove);
        window.addEventListener("mouseup", this.dragUp);
      } else if (type === "touch") {
        window.addEventListener("touchmove", this.dragMove);
        window.addEventListener("touchend", this.dragUp);
      }
    },
    dragMove(event) {
      console.log("METHODS • App: dragMove");

      if (!this.is_dragged) {
        this.is_dragged = true;
      } else {
        let pageX = !!event.pageX ? event.pageX : event.touches[0].pageX;
        pageX = pageX - this.drag_offset;

        const percent =
          Math.floor((pageX / this.$root.settings.windowWidth) * 10000) / 100;

        if (percent > this.minPercent && percent < 100 - this.minPercent) {
          this.percent = percent;
        }

        this.$emit("resize");
        this.hasMoved = true;
      }
    },
    dragUp(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • App: dragUp with is_dragged = ${this.is_dragged}`
        );
      }
      window.removeEventListener("mousemove", this.dragMove);
      window.removeEventListener("mouseup", this.dragUp);
      window.removeEventListener("touchmove", this.dragMove);
      window.removeEventListener("touchend", this.dragUp);

      if (this.is_dragged) {
        this.is_dragged = false;

        if (this.percent >= 70) {
          this.percent = 70;
          // this.$root.closePubliPanel();
          // return;
        }

        // if(this.$root.settings.show_publi_panel === false) {
        //   this.$root.openPubliPanel();
        // }
        if (this.percent <= 10) {
          this.percent = 0;
        }
      } else {
        // if(!this.$root.settings.show_publi_panel) {
        //   this.percent = 50;
        //   this.$root.openPubliPanel();
        // } else {
        //   this.percent = 100;
        //   this.$root.closePubliPanel();
        // }
      }

      return false;
    },
  },
};
</script>
<style lang="less">
.m_timeline {
  padding-left: 0;

  --color-author: var(--color-noir);
  --label-color: white;

  --timeline-bg: #f1f2f0;
  --timeline-bg: #f8f8f8;

  // --rule-color: rgb(220,220,220);
  --rule-color: rgb(210, 210, 210);

  --grid-color: var(--rule-color);
  --grid-opacity: 1;

  user-select: none;

  // background-color: #ddd;

  // background-color: #000;

  // TODO
  // pour un futur mode nuit
  // --color-author: #000;
  // --label-color: white;

  // --timeline-bg: #F1F2F0;
  // --timeline-bg: #222;
  // --rule-color: #fff;
}

.m_timeline--container {
  min-width: max-content;
  height: 100%;
  height: ~"calc(100% - 20px)";
  display: flex;
}

.m_timeline--container--dates {
  display: flex;
  height: 100%;
  position: relative;
  // min-width: 100vw;

  margin: 0px 0px;
  padding: 16px 45vw;
  // border-right: 1px solid #000;
}

.m_timeline--container--dates--day {
  position: relative;
  height: 100%;
  // min-width: 250px;
  display: flex;
  // align-items: center;
  margin: 0;
  // background-color: var(--color-author);

  // border: 2px solid white;

  &:not(.is--empty) {
    margin-left: 10px;
    margin-right: 20px;
  }

  &.is--empty {
    margin-right: -1px;
    z-index: -1;
  }
  &.is--empty + &.is--empty {
    // margin-left: 30px;
    // margin: 0;
  }

  &:not(.is--empty) + &.is--empty {
    // border-left: 1px solid var(--rule-color);
    padding-left: 10px;
  }

  &.is--folded {
    --rule-color: var(--color-noir);
    .m_timeline--container--dates--day--daylabel--container {
      > button {
        border: 1px solid var(--color-noir);
      }
      ._unfold_button {
        span {
          color: white;
          background-color: var(--color-noir);
        }
      }
    }
  }

  &.is--current_day {
    .m_timeline--container--dates--day--daylabel {
      // --label-background: var(--color-rouge_vif);
      --label-color: white;
      --label-color: var(--color-rouge_vif);
      // --rule-color: var(--color-rouge_vif);
    }
  }

  > .m_timeline--container--dates--day--emptinessPeriodLabel {
    font-size: 80%;
    color: #999;
    padding: var(--spacing-medium) var(--spacing-small);
  }

  > .m_timeline--container--dates--day--daylabel {
    position: relative;
    // height: 100%;
    width: 50px;
    margin-right: 30px;
    // margin: 0 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    --label-background: var(--timeline-bg);
    --label-color: black;

    .m_timeline--container--dates--day--daylabel--container {
      position: relative;
      transform: rotate(-90deg);
      // transform-origin: center center;

      > button {
        display: block;
        // min-width: 320px;
        background-color: var(--label-background);
        color: var(--label-color);
        border-radius: 1.1em;
        padding: 4px 12px 4px;
        // padding-right: 8px;
        white-space: nowrap;

        &:hover:not([disabled]) {
          background-color: var(--color-noir);
          color: white;
        }
        &[disabled] {
          opacity: 1;
          cursor: initial;
        }

        > span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-noir);
          border-radius: 50%;
          color: white;
          font-size: 0.7em;
          width: 2em;
          height: 2em;
          text-align: center;
          vertical-align: middle;
          // line-height: 2;
          font-weight: bold;

          transform: rotate(90deg);

          &:empty {
            display: none;
            width: 0.5em;
            height: 0.5em;
          }
        }

        ._unfold_button {
          position: absolute;

          top: 100%;
          left: 0;
          text-align: center;
          width: 100%;
          margin: 0 auto;
          margin-top: 2px;
          font-size: 0.7em;

          span {
            padding: 4px 18px;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
          }
        }
      }
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(50% - 1px);
      width: 0;
      border-left: 1px solid var(--rule-color);
      z-index: 0;
    }
  }

  &.is--empty {
    min-width: 0;
    height: 100%;
    display: flex;
    align-items: center;

    // @t-bandwidth: 0.4%;
    // background: linear-gradient(to top left,
    //          rgba(0,0,0,0) 0%,
    //          rgba(0,0,0,0) ~"calc(50% - @{t-bandwidth})",
    //          var(--rule-color) 50%,
    //          rgba(0,0,0,0) ~"calc(50% + @{t-bandwidth})",
    //          rgba(0,0,0,0) 100%);

    &::before {
      content: "";
      display: block;
      border: 1px solid transparent;

      border-top-color: var(--rule-color);
      border-left-color: var(--rule-color);

      border-radius: 50%;
      width: 20px;
      height: 20px;

      // background-color: red;

      transform-origin: center center;
    }

    &:nth-of-type(2n + 0) {
      &::before {
        transform: rotate(45deg);
      }
    }
    &:nth-of-type(2n + 1) {
      &::before {
        transform: rotate(225deg);
      }
    }

    // & + &.is--empty + &.is--empty + &.is--empty + &.is--empty {
    //   &::before {
    //     width: 14px;
    //     height: 14px;
    //   }
    //   + .is--empty + .is--empty + .is--empty + .is--empty {
    //     &::before {
    //       width: 10px;
    //       height: 10px;
    //     }
    //     + .is--empty + .is--empty + .is--empty + .is--empty {
    //       &::before {
    //         width: 6px;
    //         height: 6px;
    //       }
    //       + .is--empty + .is--empty + .is--empty + .is--empty {
    //         &::before {
    //           width: 3px;
    //           height: 3px;
    //         }
    //       }
    //     }
    //   }
    // }
    // &:nth-last-of-type(2) {
    //   &::before {
    //     width: 15px;
    //     height: 15px;
    //   }
    // }
  }
  .m_timeline--container--dates--day--mediasblock {
    position: relative;
    height: 100%;
    display: flex;

    &.has--label {
      min-width: 176px;
    }
  }

  .m_timeline--container--dates--day--mediasblock--label {
    position: relative;
    width: 25ch;
    height: 100%;
    top: 0;
    padding: 0;
    margin-right: -25ch;
    background-color: transparent;
    // padding: 24px;
    display: flex;
    align-items: center;

    z-index: 100;
    line-height: 1.4;
    pointer-events: none;

    div {
      display: block;
      transform: rotate(-15deg) translateX(-20px);
      transform-origin: left center;
      font-style: italic;

      button {
        padding: 0;
        background-color: transparent;
        appearance: none;
        border: 0;
        text-transform: initial;
        text-align: left;

        transition: all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
        transform-origin: center bottom;

        &:hover {
          transform: scale(1.05);
          // box-shadow: 0 2px 10px rgba(0,0,0,0.19), 0 6px 26px rgba(0,0,0,0.03);
        }

        span {
          border-radius: 0;

          display: inline;
          background-color: var(--color-noir);
          color: white;
          // background-color: var(--color-author);
          // color: var(--label-color);
          box-shadow: -0.1em 0.2em 1em rgba(0, 0, 0, 0.2);
          padding: 4px 8px;
          white-space: pre-line;

          -webkit-box-decoration-break: clone;
          -ms-box-decoration-break: clone;
          -o-box-decoration-break: clone;
          box-decoration-break: clone;

          pointer-events: auto;
        }
        &[data-has_author="true"] span::before {
          content: "• ";
          color: var(--color-author);
          position: relative;
        }
      }
    }

    // &::before {
    //   content: '';
    //   position: absolute;
    //   top: 0;
    //   bottom: 0;
    //   left: 0%;
    //   border-left: 1px solid var(--label-color);
    //   z-index: -1;
    // }
  }
}

.folder_backbutton {
  position: absolute;
  top: 20px;
  left: ~"calc(100% + 40px)";
  z-index: 10000;
  border-radius: 22px;

  padding: 0;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;

  border: 2px solid var(--color-noir);
  color: white;
  background-color: var(--color-noir);

  body.has_systembar & {
    top: 35px;
  }

  &.is--movedToRight {
    // left: var(--sidebar-width);
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
    border-radius: 22px;

    color: white;
    // border: 2px solid white;
    background-color: var(--color-noir);

    font-size: 1.5em;
  }

  .project_name {
    padding: 4px 16px 4px 4px;
    text-transform: initial;
    max-width: 340px;

    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    transition: padding 0.4s ease-out;

    .is--collapsed& {
      padding-left: 0;
      padding-right: 0;
      max-width: 0px;
    }
  }

  &.is--moved_to_right {
    // left: 340px;
  }
}

.m_floater {
  position: absolute;
  top: auto;
  bottom: 40px;
  width: 100%;
  z-index: 150;
  // font-size: 0.85em;
  line-height: 1.25;
  text-align: center;

  pointer-events: none;

  --label-background: var(--color-noir);

  body.has_systembar & {
    // top: 35px;
  }

  &.is--current_day {
    --label-background: var(--color-rouge_vif);
  }

  @media screen and (max-width: 50rem) {
    top: auto !important;
    bottom: 20px;
    font-size: 0.7em;
  }

  > * {
    display: block;
    margin: 5px auto;
    // max-width: auto;

    > * {
      position: relative;
      display: inline-flex;
      min-height: 40px;
      background-color: var(--label-background);
      color: white;
      pointer-events: auto;
      border-radius: 20px;
      padding: 0 20px;

      align-items: center;
      align-content: center;
      justify-content: center;

      transition: background-color 0.4s ease-out;

      @media screen and (max-width: 50rem) {
        width: 100%;
        max-width: none;
        border-radius: 0;
        min-height: 20px;
      }
    }
  }

  ._scrolltonow {
    position: absolute;
    z-index: -1;
    color: var(--color-rouge_vif);
    background-color: transparent;
    border-radius: 20px;
    border: 1px solid currentColor;
    background-color: white;
    background-color: var(--timeline-bg);
    border-radius: 20px;
    min-height: 40px;

    font-size: 0.75em;
  }

  ._scrolltonow_before {
    right: 100%;
    padding: 0 25px 0 10px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    margin-right: -20px;
  }
  ._scrolltonow_after {
    left: 100%;
    padding: 0 10px 0 25px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    margin-left: -20px;
  }
}

._writeups_number {
  display: inline-block;
  width: 1.3em;
  height: 1.3em;
  // background-color: black;
  // color: black;
  border-radius: 50%;
  border: 1px solid #555;
  // font-size: 70%;
}

.m_floater .m_accessController {
  margin-top: var(--spacing-verysmall);
  margin-bottom: var(--spacing-verysmall);
}
</style>
