<template>
  <div
    class="m_navtimeline_wrapper"
  >
    <transition name="fade" :duration="350">
      <div
        v-if="$root.settings.is_loading_medias_for_folder"
        class="loader_folder flex-wrap flex-vertically-centered flex-horizontally-centered"
      >
        <span class="animated flash">
          {{ $t('loading') }}
        </span>
      </div>
    </transition>

    <!-- <pre>{{ sortedMedias }}</pre> -->

    <template v-if="$root.state.mode === 'export_web'">
      <button 
        type="button" class="folder_backbutton" @click="$root.closeFolder()"
        @mouseover="collapse_foldername = false"
        @mouseleave="collapse_foldername = true"
        :class="{ 'is--collapsed' : collapse_foldername }"
      >
        <span class="icon">←</span>
        <span class="project_name">{{ folder.name }}</span>
      </button>
    </template>
    <template v-else>
      <div class="folder_backbutton"
      >
        <span class="margin-sides-small padding-verysmall text-centered">{{ folder.name }}</span>
      </div>
    </template>

    <div class="m_navtimeline_wrapper--timeline_wrapper">

      <transition name="sidebar-animation" :duration="350">
        <Sidebar
          v-if="$root.settings.has_sidebar_opened"
          :folder="folder"
          :slugFolderName="slugFolderName"
          :timeline_start="timeline_start"
          :timeline_end="timeline_end"
          :visible_day="visible_day"
          :medias="medias"
          :sortedMedias="sortedMedias"
          :sort="sort"
          :filter="filter"
          :is_realtime="is_realtime"
          :read_only="read_only"
          :can_admin_folder="can_admin_folder"
          @modal_edit_folder="can_admin_folder ? show_edit_folder_modal = true : ''"
        >
        </Sidebar>
      </transition>

      <EditFolder
        v-if="show_edit_folder_modal"
        :folder="folder"
        :slugFolderName="slugFolderName"
        @close="show_edit_folder_modal = false"
        :folder_is_archived="folder_is_archived"
        :allAuthors="folder.authors"
      />

      <div class="m_sidebarToggleButton"
        :class="{ 'is--sidebarOpened' : $root.settings.has_sidebar_opened }"
      >
        <button type="button"
          @click.prevent="toggleSidebar()"
        >
          <span>
            {{ $t('options') }}<template v-if="$root.settings.has_sidebar_opened">&nbsp;×</template>
          </span>
          <!-- <template v-else>→</template> -->
        </button>
      </div>

      <div class="m_floater"
        @wheel="onMousewheel"
      >
        <div>
          {{ visible_day_human }}
        </div>
      </div>

      <div class="m_timeline"
        ref="timeline"
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
              :class="{ 'is--empty' : day.is_empty }"
            >
              <template v-if="!day.is_empty">
                <div class="m_timeline--container--dates--day--daylabel"
                >
                  <div class="m_timeline--container--dates--day--daylabel--container">
                    <span>
                      {{ day.label }}
                      <span v-if="day.number_of_medias > 0">{{ day.number_of_medias }}</span>
                      <span v-else></span>
                    </span>
                  </div>
                </div>

                <div v-for="segment in day.segments"
                  :key="segment.timestamp"
                  class="m_timeline--container--dates--day--mediasblock"
                  v-if="(!segment.hasOwnProperty('hidelabel') || !segment.hidelabel) || (segment.medias.length > 0)"
                >
                  <div class="m_timeline--container--dates--day--mediasblock--label"
                    v-if="!segment.hasOwnProperty('hidelabel') || !segment.hidelabel"
                  >
                    <div>
                      <button type="button" 
                        @click="openMediaModal(segment.marker_meta_slugMediaName)"
                        :style="`
                          --color-author: ${segment.color};
                          --label-color: ${segment.color === 'var(--color-noir)' ? 'var(--color-blanc)' : 'var(--color-noir)' };
                          `"
                        :data-has_author="!!segment.marker_author"
                      >
                        <span v-html="segment.label" />
                      </button>
                    </div>
                  </div>

                  <MediasBlock 
                    v-if="segment.medias.length > 0"
                    :medias="segment.medias"
                    :folder="folder"
                    :slugFolderName="slugFolderName"
                    :timeline_height="timeline_height"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>

        <div v-if="sort.current.field !== 'date_timeline'"
          class="m_filterIndicator">
          <div class="flex-wrap flex-vertically-centered flex-horizontally-start">
            <button type="button" 
              class="button-small flex-nogrow bg-transparent border-circled padding-verysmall margin-right-small" 
              v-html="'x'" 
              @click="setSort(sort.available[0]); setFilter('');"
            />
            <small>
              <div class="">
                <span v-html="$t('active_filter:')" />
                {{ ' ' }}
                <span v-html="sort.current.name" />
              </div>
              <div class="">
                <span v-html="$t('medias_shown:')" />
                <span v-html="this.sortedMedias.length + '/' + Object.keys(this.medias).length" />
              </div>
            </small>
          </div>
        </div>
      </div>
    </div>

    <AddMedias
      v-if="
        ((folder.password === 'has_pass' && can_admin_folder) || folder.password !== 'has_pass') && !folder_is_archived"
      :slugFolderName="slugFolderName"
      :folder="folder"
      :folder_is_archived="folder_is_archived"
      :is_realtime="is_realtime"
      :current_author="current_author"
      :read_only="!$root.state.connected"
    />

    <EditMedia
      v-if="show_media_modal_for"
      :slugFolderName="slugFolderName"
      :slugMediaName="show_media_modal_for"
      :media="medias[show_media_modal_for]"
      :folder="folder"
      :isRealtime="is_realtime"
      @close="show_media_modal_for = false"
      :read_only="!$root.state.connected || folder_is_archived"
      :allAuthors="folder.authors"
    />

    <!-- Ici la minimap -->

  </div>
</template>
<script>
import MediasBlock from './components/MediasBlock.vue';
import Sidebar from './components/Sidebar.vue';
import EditFolder from './components/modals/EditFolder.vue';
import AddMedias from './components/AddMedias.vue';
import { setTimeout } from 'timers';
import EditMedia from './components/modals/EditMedia.vue';

import debounce from 'debounce';

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object,
    read_only: Boolean
  },
  components: {
    MediasBlock,
    AddMedias,
    EditMedia,
    Sidebar,
    EditFolder,
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
      timeline_height: 0,
      collapse_foldername: false,

      show_media_modal_for: false,
      show_edit_folder_modal: false,   

      make_mediasblock_with: 'markers',
      
      filter: '',
      sort: {
        current: {},

        available: [
          {
            field: 'date_timeline',
            name: this.$t('date'),
            type: 'date',
            order: 'ascending'
          },
          {
            field: 'date_modified',
            name: this.$t('last_modified'),
            type: 'date',
            order: 'descending'
          },
          {
            field: 'caption',
            name: this.$t('caption'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'type',
            name: this.$t('type'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'color',
            name: this.$t('color'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'keywords',
            name: this.$t('keywords'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'authors',
            name: this.$t('author'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'public',
            name: this.$t('public'),
            type: 'bool',
            order: 'descending'
          },
          {
            field: 'content',
            name: this.$t('content'),
            type: 'alph',
            order: 'ascending'
          }
        ]
      }

    }
  },
  
  created() {
    this.sort.current = this.sort.available[0];
  },
  mounted() {
    this.$eventHub.$on('scrollToMedia', this.scrollToMedia);
    this.$eventHub.$on('scrollToDate', this.scrollToDate);
    this.$eventHub.$on('timeline.openMediaModal', this.openMediaModal);
    this.$eventHub.$on('setSort', this.setSort);
    this.$eventHub.$on('setFilter', this.setFilter);
    this.$eventHub.$on('timeline.scrollToToday', this.scrollToToday);
    this.$eventHub.$on('timeline.scrollToEnd', this.scrollToEnd);
    this.$eventHub.$on('editmediamodal.nextmedia', this.editModalNextMedia);
    this.$eventHub.$on('editmediamodal.previousmedia', this.editModalPreviousMedia);

    this.setTimelineHeight();

    this.onResize = debounce(this.onResize, 300);
    window.addEventListener('resize', this.onResize);

    setTimeout(() => { this.collapse_foldername = true }, 2000);
  },
  beforeDestroy() {
    this.$eventHub.$off('scrollToMedia', this.scrollToMedia);
    this.$eventHub.$off('scrollToDate', this.scrollToDate);
    this.$eventHub.$off('timeline.openMediaModal', this.openMediaModal);
    this.$eventHub.$off('setSort');
    this.$eventHub.$off('setFilter');
    this.$eventHub.$off('timeline.scrollToToday', this.scrollToToday);
    this.$eventHub.$off('timeline.scrollToEnd', this.scrollToEnd);
    this.$eventHub.$off('editmediamodal.nextmedia', this.editModalNextMedia);
    this.$eventHub.$off('editmediamodal.previousmedia', this.editModalPreviousMedia);

    window.removeEventListener('resize', this.onResize);

  },
  watch: {
    'translation': function() {
      this.$refs.timeline.scrollLeft = this.translation;

      if(!this.debounce_translation_fct) {
        this.debounce_translation_fct = setTimeout(() => {
          this.debounce_translation = this.translation;
          this.debounce_translation_fct = undefined;
        }, this.debounce_translation_delay);
      }
    }
  },
  computed: {
    can_admin_folder() {
      return this.$root.canAdminFolder({
        type: 'folders', 
        slugFolderName: this.slugFolderName
      })
    },
    folder_is_archived() {
      if(this.folder.hasOwnProperty('archived') && this.folder.archived) {
        return true;
      }
      if(this.$root.state.mode === 'export_web') {
        return true;
      }
      return false;
    },  
    folder_authors() {
      return this.folder.hasOwnProperty('authors') && this.folder.authors !== '' ? this.folder.authors : [];
    },
    current_author() {
      if(typeof this.folder_authors !== 'object') {
        return {};
      }
      return this.folder_authors.filter(c => c.name === this.$root.settings.current_author_name)[0];      
    },
    sortedMedias() {
      console.log('COMPUTED • TimeLineView: sortedMedias');
      var sortable = [];
      let current_sort = !!this.sort.current.type ? this.sort.current : this.sort.available[0];

      for (let slugMediaName in this.medias) {
        let mediaDataToOrderBy;
        const media = this.medias[slugMediaName];


        // legacy to account for medias without date_timeline but with date_created or created
        if(!media.hasOwnProperty(current_sort.field)) {
          if(current_sort.field === 'date_timeline') {
            if(media.hasOwnProperty('date_created')){
              this.medias[slugMediaName].date_timeline = media.date_created;
            } else if(media.hasOwnProperty('created')) {
              this.medias[slugMediaName].date_timeline = media.created;
            }
          } else {
            continue;
          }
        }

        if (current_sort.type === 'date') {
          const _date = this.$moment(
            media[current_sort.field],
            'YYYY-MM-DD HH:mm:ss'
          );
          if(_date.isValid()) {
            mediaDataToOrderBy = +_date;
          } else {
            mediaDataToOrderBy = false;
          }
        } else if (current_sort.type === 'alph') {
          mediaDataToOrderBy = media[
            current_sort.field
          ].toLowerCase();
        } else if (current_sort.type === 'alph') {
          mediaDataToOrderBy = media[
            current_sort.field
          ];
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

      if (current_sort.order === 'descending') {
        sortedSortable.reverse();
      }

      // array order is garanteed while objects properties aren’t,
      // that’s why we use an array here
      let sortedMedias = sortedSortable.reduce((result, d) => {
        let sortedMediaObj = this.medias[d.slugMediaName];
        sortedMediaObj.slugMediaName = d.slugMediaName;

        if (this.filter.length > 0) {
          // if there is a filter set, let’s only return medias whose mediaDataToOrderBy contain that string
          let originalContentFromMedia =
            sortedMediaObj[current_sort.field] + '';
          if (originalContentFromMedia.indexOf(this.filter) !== -1) {
            result.push(sortedMediaObj);
          }
        } else {
          result.push(sortedMediaObj);
        }

        return result;
      }, []);

      return sortedMedias;
    },
    groupedMedias() {
      console.log('COMPUTED • TimeLineView: groupedMedias');

      if(this.sortedMedias.length === 0) {
        return [];
      }

      // groupby day
      let mediaGroup = this.$_.groupBy(this.sortedMedias, (media) => {
        let date_to_reference_to = 0;
        if(media.hasOwnProperty('date_timeline')) {
          date_to_reference_to = media.date_timeline
        } else if(media.hasOwnProperty('date_created')) {
          date_to_reference_to = media.date_created
        } else if(media.hasOwnProperty('created')) {
          date_to_reference_to = media.created
        }

        const dateMoment = this.$moment(date_to_reference_to);
        return dateMoment.format('YYYY-MM-DD');
      });
      mediaGroup = this.$_.toPairs(mediaGroup); 

      if(this.make_mediasblock_with === 'hours') {
        mediaGroup = mediaGroup.map(([day, medias]) => {
          let medias_by_hours = this.$_.groupBy(medias, (media) => {
            let date_to_reference_to = 0;
            if(media.hasOwnProperty('date_timeline')) {
              date_to_reference_to = media.date_timeline
            } else if(media.hasOwnProperty('date_created')) {
              date_to_reference_to = media.date_created
            } else if(media.hasOwnProperty('created')) {
              date_to_reference_to = media.created
            }

            var dateMoment = this.$moment(date_to_reference_to);
            return dateMoment.format('HH') + ':00';
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
          medias_by_hours = Object.entries(medias_by_hours).reduce((acc, [hour, medias]) => {
            acc.push({
              label: hour,
              medias
            });
            return acc;
          }, []);
          // medias_by_hours = this.$_.toPairs(medias_by_hours); 
          // medias_by_hours = this.$_.sortBy(medias_by_hours);
          // medias_by_hours = medias_by_hours.reverse();

          return {
            day, 
            segments: medias_by_hours
          };   
        });
      } else if(this.make_mediasblock_with === 'markers') {
        mediaGroup = mediaGroup.map(([day, medias]) => {
          let medias_by_markers = medias.reduce((acc, media) => {
            // avancer dans l’array, en ajoutant dans un accumulator 
            if(media.type === 'marker') {
              const label = this.$moment(media.date_timeline).format('HH:mm') + '<br>' + (!!media.content ? media.content : ''); 
              const color = this.$root.mediaColorFromFirstAuthor(media, this.folder) ? this.$root.mediaColorFromFirstAuthor(media, this.folder) : 'var(--color-noir)';
              const marker_author = this.$root.mediaFirstAuthor(media, this.folder) ? this.$root.mediaFirstAuthor(media, this.folder).name : false;

              acc.push({
                label,
                color,
                timestamp: media.date_timeline,
                marker_meta_slugMediaName: media.slugMediaName,
                marker_author,
                medias: []
              })
            } else {
              acc[acc.length - 1].medias.push(media);
            }
            return acc;
          }, [{ label: '', medias: [], hidelabel: true }]);
          // {
          //   label: "Début des répétitions"
          //   medias: [
          //     {},
          //     {}
          //   ]           
          // };      
          return {
            day, 
            segments: medias_by_markers
          };             
        });
      }

      return mediaGroup;  
    },
    timeline_start() {
      if(this.sortedMedias.length > 0) {
        let index = 0;
        let ref_date = '';
        while(!this.$moment(this.sortedMedias[index].date_timeline, 'YYYY-MM-DD HH:mm:ss').isValid()) {
          index++;
          if(index == this.sortedMedias.length) {
            break;
          }
        }
        return +this.$moment(this.sortedMedias[index].date_timeline, 'YYYY-MM-DD HH:mm:ss');
      }
      return +this.$moment();

    },
    timeline_end() {
      if(this.sortedMedias.length > 0) {
        let index = 1;
        let ref_date = '';
        while(!this.$moment(this.sortedMedias[this.sortedMedias.length - index].date_timeline, 'YYYY-MM-DD HH:mm:ss').isValid()) {
          index++;
          if(index >= this.sortedMedias.length) {
            break;
          }
        }
        return +this.$moment(this.sortedMedias[this.sortedMedias.length - index].date_timeline, 'YYYY-MM-DD HH:mm:ss');
      }
      return +this.$moment();

      // const ts = this.folder.end;
      // const get_new_timeline_end = (ts) => {
      //   if (ts && this.$moment(ts, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
      //     // if end is in the future
      //     if (
      //       this.$moment(ts, 'YYYY-MM-DD HH:mm:ss', true).isAfter(this.$root.currentTime)
      //     ) {
      //       this.is_realtime = true;
      //       // return +this.$moment(ts, 'YYYY-MM-DD HH:mm:ss');
      //       // if end is is in the present or past
      //     } else {
      //       this.is_realtime = false;
      //       return +this.$moment(ts, 'YYYY-MM-DD HH:mm:ss');
      //     }
      //   } else {
      //     // there is no valid end, we set end to current time and set is_realtime
      //     this.is_realtime = true;
      //     return +this.$root.currentTime;
      //   }
      // }
      // const new_timeline_end = get_new_timeline_end(ts);
      // // if(new_timeline_end !== this.timeline_end) {
      // //   return new_timeline_end;
      // // }
      // return new_timeline_end;
    },
    full_date_interval() {
      // console.log('COMPUTED • TimeLineView: full_date_interval');
      // itérer dans toutes les dates, 
      // et construire un array de date qui ressemble à ça :

      // entre timeline_start et timeline_end
      let date_interval = [];

      let startDate = this.$moment(this.timeline_start).add(-1, 'days');
      const lastDate = this.$moment(this.timeline_end);

      let index = 0;

      while(startDate.add(1, 'days').diff(lastDate) <= 0) {
        let this_date = startDate.clone();
        let medias_for_date = [];

        const has_media_for_date = this.groupedMedias.filter(i => this.$moment(i.day).isSame(this_date, 'day'));

        if(has_media_for_date.length > 0) {
          medias_for_date = has_media_for_date[0].segments;
        }

        // const is_current_day = this.$moment(this.$root.currentTime_minute).isSame(this_date, 'day');
        // if(is_current_day) {
        //   medias_for_date.map(m => {
        //     if(m.label === this.$moment(this.$root.currentTime_minute).format('HH') + ':00') {
        //       m.is_current_hour = true;
        //     }
        //   });          
        // }

        const number_of_medias = Object.values(medias_for_date).reduce((acc, element) => acc + element.medias.length, 0);

        const format = index === 0 ? 
          'LLLL' : 
          this.$root.lang.current === 'fr' ? 
            'dddd D MMMM':
            'dddd, MMMM D';

        const label = this_date.format(format);

        let day = {
          label,
          timestamp: +this_date,
          number_of_medias,
          segments: medias_for_date
        }

        date_interval.push(day);

        if(index === 0) {
          startDate.startOf('day');
        }

        index++;
      }

      // days = days.map(d => d.format('L'));
      return date_interval;
    },
    date_interval() {
      // console.log('COMPUTED • TimeLineView: date_interval');

      var t0 = performance.now();
      
      // check if multiple days (3+) in a row are empty
      let date_interval = [];
      // let min_consecutive_empty_days = 3;

      date_interval = this.full_date_interval.reduce((acc, day, index) => {
        if(day.number_of_medias > 0 || acc.length === 0 || index === this.full_date_interval.length - 1) {
          acc.push(day);
        } else {
          // if last added day has 0
          // acc.push(day);
          const last_item = acc[acc.length - 1]; 
          if(day.number_of_medias === 0) {
            // check if last item is already a period
            // if(!last_item.hasOwnProperty('period') || !last_item.period) {
            day.is_empty = true;
            acc.push(day);
            // }
          } else {
            acc.push(day);
          }
        }
        return acc;
      }, []);
      
      var t1 = performance.now();
      console.log('COMPUTED • TimeLineView: date_interval took ' + (t1 - t0) + " milliseconds.");
      

      return date_interval;
      // return this.full_date_interval;
    },
    visible_day() {
      console.log('COMPUTED • TimeLineView: visible_day');
      
      // IMPORTANT : to make sure visible_day is called when this.translation changes
      this.debounce_translation;
      return this.findDayAtPosX(this.debounce_translation);
    },
    visible_day_human() {
      if(this.$root.lang.current === 'fr') {
        return this.$moment(this.visible_day).calendar(null,{
          lastDay : '[hier]',
          sameDay : '[aujourd’hui]',
          nextDay : '[demain]',
          lastWeek : 'dddd [dernier]',
          nextWeek : 'dddd [prochain]',
          sameElse : 'dddd D MMMM'
        });
      } else if(this.$root.lang.current === 'en') {
        return this.$moment(this.visible_day).calendar(null,{
          lastDay : '[yesterday]',
          sameDay : '[today]',
          nextDay : '[tomorrow]',
          lastWeek : '[last] dddd',
          nextWeek : '[next] dddd',
          sameElse : 'dddd, MMMM D'
        });
      }
    }
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

      if(new_translation !== this.translation) {
        this.translation = new_translation;
      }
    },
    onMouseUp(event) {
      console.log('METHODS • TimeLineView: onMouseUp');

      const el = this.$refs.timeline; 
      setTimeout(() => this.translation = el.scrollLeft, 300);
    }, 
    onResize() {
      console.log(`METHODS • TimeLineView: onResize`);
      this.setTimelineHeight();
    },
    setTimelineHeight() {
      console.log(`METHODS • TimeLineView: setTimelineHeight`);
      this.timeline_height = window.innerHeight;
    },
    scrollToToday() {
      this.scrollToDate(+this.$root.currentTime_day);
    },
    scrollToEnd() {
      const x = this.$refs.timeline.children[0].offsetWidth - this.$refs.timeline.offsetWidth;
      this.scrollTimelineToXPos(x);
    },
    findDayAtPosX(posX) {
      if(!this.$refs.hasOwnProperty('timeline_dates') || this.$refs.timeline_dates.children.length === 0) {
        return this.timeline_start;
      }
      const first_day = Array.from(this.$refs.timeline_dates.children).find(d => d.offsetLeft + d.offsetWidth > posX + this.$refs.timeline.offsetWidth/2 - 25);
      if(!!first_day && first_day.dataset.hasOwnProperty('timestamp')){
        return +this.$moment(Number(first_day.dataset.timestamp));
      }
      return +this.$moment();
    },
    findPosXForDate(day) {
      if(!this.$refs.hasOwnProperty('timeline_dates') || this.$refs.timeline_dates.children.length === 0) {
        return 0;
      }
      const first_day = Array.from(this.$refs.timeline_dates.children).find(d => d.dataset.hasOwnProperty('timestamp') && Number(d.dataset.timestamp) >= day);
      if(!!first_day){
        return first_day.offsetLeft;
      }
      return 0;
    },
    openMediaModal(slugMediaName) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • TimeLineView: openMediaModal for ' + slugMediaName);
      }

      if (!this.medias.hasOwnProperty(slugMediaName)) {
        if (this.$root.state.dev_mode === 'debug') {
          console.log(
            'METHODS • TimeLineView: openMediaModal / missing media in timeline'
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
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • TimeLineView: editModalNextMedia');
      }
      
      if(this.show_media_modal_for) {

        // find in sortedMedias where this.show_media_modal_for and get the next one
        const current_media_index = this.sortedMedias.findIndex(m => m.slugMediaName === this.show_media_modal_for);

        this.closeMediaModal();

        if(current_media_index < this.sortedMedias.length - 1) {
          const new_media = this.sortedMedias[current_media_index + 1];
          if(new_media.hasOwnProperty('slugMediaName')) {
            this.$nextTick(() => {
              this.openMediaModal(new_media.slugMediaName);
            });
          } 
        }
      }
    },
    editModalPreviousMedia() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • TimeLineView: editModalPreviousMedia');
      }

      if(this.show_media_modal_for) {

        // find in sortedMedias where this.show_media_modal_for and get the next one
        const current_media_index = this.sortedMedias.findIndex(m => m.slugMediaName === this.show_media_modal_for);

        this.closeMediaModal();

        if(current_media_index > 0) {
          const new_media = this.sortedMedias[current_media_index - 1];
          if(new_media.hasOwnProperty('slugMediaName')) {
            this.$nextTick(() => {
              this.openMediaModal(new_media.slugMediaName);
            });          
          } 
        }      
      }
    },

    toggleSidebar() {
      console.log('METHODS • TimeLineView: toggleSidebar');
      this.$root.settings.has_sidebar_opened = !this.$root.settings.has_sidebar_opened;
    },
    scrollToDate(timestamp) {
      console.log(
        `METHODS • TimeLineView: scrollToDate / timestamp: ${timestamp}`
      );
      const x = this.findPosXForDate(timestamp);
      this.scrollTimelineToXPos(x);
    },
    scrollToMedia(slugMediaName) {
      console.log(
        `METHODS • TimeLineView: scrollToMedia / slugMediaName: ${slugMediaName}`
      );

      const $medias = this.$refs.timeline.getElementsByClassName('mediaContainer');

      if($medias.length === 0) {
        return false;
      }

      const media_in_timeline = Array.from($medias).find(m => m.dataset.hasOwnProperty('slugmedianame') && m.dataset.slugmedianame === slugMediaName);
      const x = media_in_timeline.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.offsetLeft + media_in_timeline.parentElement.parentElement.parentElement.parentElement.parentElement.offsetLeft + media_in_timeline.parentElement.parentElement.offsetLeft;
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

      this.current_scroll_event = this.$scrollTo('.m_timeline', 500, {
        container: this.$refs.timeline,
        offset: xPos_new,
        cancelable: true,
        easing: [0.45, 0.8, 0.58, 1.0],
        x: true,
        y: false,
        onDone: () => {
          console.log(`METHODS • TimeLineView: scrollTimelineToXPos / is done`);
          this.current_scroll_event = undefined;
          // onScroll will update view
        },
        onCancel: () => {
          console.log(
            `METHODS • TimeLineView: scrollTimelineToXPos / was canceled`
          );
          this.current_scroll_event = undefined;
        }
      });
    },

    onTimelineScroll() {
      // console.log('METHODS • TimeLineView: onTimelineScroll');
      const el = this.$refs.timeline;
      this.translation = el.scrollLeft;
    },
    // prev / nav
    setSort(newSort) {
      console.log('METHODS • TimeLineView: setSort');
      this.sort.current = newSort;
    },
    setFilter(newFilter) {
      console.log('METHODS • TimeLineView: setFilter');
      this.filter = newFilter;
    },

  }
}
</script>
<style lang="less">

.m_timeline {

  padding-left: 0;

  --color-author: var(--color-noir);
  --label-color: white;

  --timeline-bg: #F1F2F0;
  --timeline-bg: #f8f8f8;
  
  // --rule-color: rgb(220,220,220);
  --rule-color: rgb(210,210,210);

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
  min-width: 100vw;

  margin: 0px 0px;
  padding: 16px 20vw;
  // border-right: 1px solid #000;
}

.m_timeline--container--dates--day {
  position: relative;
  height: 100%;
  // min-width: 250px;
  display: flex;
  align-items: center;
  margin: 0 20px;
  // background-color: var(--color-author);

  // border: 2px solid white;

  &:not(.is-empty) {
    margin-left: 10px;
  }

  &.is--empty {
    margin-right: 0;
  }
  &.is--empty + &.is--empty {
    // margin-left: 30px;
    margin: 0;
  }

  &:not(.is--empty) + &.is--empty {
    // border-left: 1px solid var(--rule-color);
    padding-left: 10px;
  }

  > .m_timeline--container--dates--day--daylabel {
    position: relative;
    height: 100%;
    width: 50px;
    margin-right: 30px;
    // margin: 0 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    --label-background: var(--timeline-bg);
    --label-color: black;

    &.is--current_day {
      span > span {
      }
    }

    .m_timeline--container--dates--day--daylabel--container {
      position: relative;
      transform: rotate(-90deg);
      // transform-origin: center center;
      
      > span {
        display: block;
        // min-width: 320px; 
        background-color: var(--label-background);
        color: var(--label-color);
        padding: 2px 8px;
        white-space: nowrap;

        span {
          display: inline-flex;
          align-items: center;
          justify-content: center;          
          background-color: var(--color-noir);
          border-radius: 50%;
          color: white;
          font-size:.7em;
          width: 2em;
          height: 2em;
          text-align: center;
          vertical-align: middle;
          // line-height: 2;
          font-weight: bold;

          &:empty {
            display: none;
            width: .5em;
            height: .5em;
          }
        }
      }

    }


    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(50% - 0px);
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

    &::before, &::after {
      // content: '';
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
    &::before {
      transform: rotate(225deg);
    }
    &::after {
      transform: rotate(45deg);
      // margin-left: -1px;
    }

    &:nth-of-type(2n + 0) {
      &::before {
        content: '';
      }
    }
    &:nth-of-type(2n + 1) {
      &::after {
        content: '';
        // border-color: blue !important;
      }
    }
    
  }
  .m_timeline--container--dates--day--mediasblock {
    position: relative;
    height: 100%;
    min-width: 88px;
    display: flex;
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

        transition: all .8s cubic-bezier(.25,.8,.25,1);  
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
          box-shadow: -.1em .2em 1em rgba(0,0,0,.2);
          padding: 4px 8px;
  
          -webkit-box-decoration-break: clone;
          -ms-box-decoration-break: clone;
          -o-box-decoration-break: clone;
          box-decoration-break: clone;

          pointer-events: auto;

        }
        &[data-has_author="true"] span::before {
          content:'• ';
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
  position: fixed;
  top: 20px;
  left: 20px;
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

  .project_name{
    padding: 4px 16px 4px 4px;
    text-transform: initial;
    max-width: 340px;

    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    transition: padding .4s ease-out;

    .is--collapsed& {
      padding-left: 0;
      padding-right: 0;
      max-width: 0px;
    }
  }
}

.m_floater {
  position: fixed;
  top: 20px;
  // bottom: 0px;
  width: 100%;
  z-index: 150;
  pointer-events: none;

  body.has_systembar & {
    top: 35px;
  }

  @media screen and (max-width: 50rem) {
    bottom: 0;
    font-size:.7em;
  }

  > * {
    margin: 0 auto;
    width: 250px;
    height: 40px;
    background-color: var(--color-noir);
    color: white;
    pointer-events: auto;
    border-radius: 20px;

    display: flex;
    align-content: center;
    justify-content: center;
    align-items: center;

    @media screen and (max-width: 50rem) {
      width: 100%;
      border-radius: 0;
      height: 20px;
    }
  }
}

</style>