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

    <button type="button" class="folder_backbutton" @click="$root.closeFolder()" v-html="'←'" />

    <div class="m_navtimeline_wrapper--timeline_wrapper">

      <br><br><br>
    <!-- timeline_start = {{ timeline_start }}<br>
    timeline_end = {{ timeline_end }}<br>
    is_realtime = {{ is_realtime }}
    currentTime_minute = {{ $root.currentTime_minute }} -->

      <div class="m_timeline"
        ref="timeline"
        @mousewheel="onMousewheel"
        @mouseup.self="onMouseUp"
      >
        <div class="m_timeline--container">

          <div class="m_timeline--container--dates">
            <div 
              v-for="day in date_interval" 
              :key="day.label"
              class="m_timeline--container--dates--day"
            >
              <template v-if="!day.hasOwnProperty('period') || day.period === false">
                <div class="m_timeline--container--dates--day--daylabel"
                  :class="{ 'is--current_day' : day.is_current_day }"
                >
                  <div class="m_timeline--container--dates--day--daylabel--container">
                    <span>
                      {{ day.label }}
                      <span v-if="day.number_of_medias > 0">{{ day.number_of_medias }}</span>
                      <span v-else></span>
                    </span>
                  </div>
                </div>

                <div v-for="hour in day.hours"
                  :key="hour.label"
                  class="m_timeline--container--dates--day--hours"
                >
                  <div class="m_timeline--container--dates--day--hours--hourlabel"
                    :class="{ 
                      'is--current_hour' : hour.hasOwnProperty('is_current_hour') && hour.is_current_hour
                    }"
                  >
                    <span>{{ hour.label }}</span>
                  </div>

                  <MediasBlock 
                    :medias="hour.medias"
                    :folder="folder"
                    :slugFolderName="slugFolderName"
                  />
                </div>
              </template>
              <template v-else>
                <div class="m_timeline--container--dates--day--empty font-verylarge">
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

    </div>

    <AddMedias
      v-if="
        ((folder.password === 'has_pass' && can_admin_folder) || folder.password !== 'has_pass') && $root.state.connected"
      :slugFolderName="slugFolderName"
      :read_only="read_only"
      :is_realtime="is_realtime"
    />

    <EditMedia
      v-if="show_media_modal_for"
      :slugFolderName="slugFolderName"
      :slugMediaName="show_media_modal_for"
      :media="medias[show_media_modal_for]"
      :isRealtime="is_realtime"
      @close="show_media_modal_for = false"
      :read_only="read_only"
      :allAuthors="folder.authors"
      :color="getMediaColorFromFirstAuthor(medias[show_media_modal_for].authors)"
    >
    </EditMedia>

    <!-- Ici la minimap -->

    <!-- l’indication du nom de la timeline -->

  </div>
</template>
<script>
import MediasBlock from './components/MediasBlock.vue';
import AddMedias from './components/AddMedias.vue';
import { setTimeout } from 'timers';
import EditMedia from './components/modals/EditMedia.vue';

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
    EditMedia
  },
  data() {
    return {

      translation: 0,
      is_realtime: false,

      show_media_modal_for: false,

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
  },
  mounted() {
    this.$eventHub.$on('timeline.openMediaModal', this.openMediaModal);

  },
  beforeDestroy() {
    this.$eventHub.$off('timeline.openMediaModal', this.openMediaModal);
  },
  watch: {
  },
  computed: {
    can_admin_folder() {
      return this.$root.canAdminFolder({
        type: 'folders', 
        slugFolderName: this.slugFolderName
      })
    },
    sortedMedias() {
      console.log('COMPUTED • TimeLineView: sortedMedias');
      var sortable = [];
      let current_sort = !!this.sort.current.type ? this.sort.current : this.sort.available[0];

      for (let slugMediaName in this.medias) {
        let mediaDataToOrderBy;

        if(!this.medias[slugMediaName].hasOwnProperty(current_sort.field)) {
          continue;
        }

        let _timestamp = +this.$moment(
          this.medias[slugMediaName]['date_timeline'],
          'YYYY-MM-DD HH:mm:ss'
        );

        if (current_sort.type === 'date') {
          mediaDataToOrderBy = +this.$moment(
            this.medias[slugMediaName][current_sort.field],
            'YYYY-MM-DD HH:mm:ss'
          );
        } else if (current_sort.type === 'alph') {
          mediaDataToOrderBy = this.medias[slugMediaName][
            current_sort.field
          ].toLowerCase();
        } else if (current_sort.type === 'alph') {
          mediaDataToOrderBy = this.medias[slugMediaName][
            current_sort.field
          ];
        }
        
        sortable.push({
          slugMediaName,
          mediaDataToOrderBy,
          _timestamp
        });
      }

      let sortedSortable = sortable.sort((a, b) => {
        if (a.mediaDataToOrderBy < b.mediaDataToOrderBy) {
          return -1;
        }
        if (a.mediaDataToOrderBy > b.mediaDataToOrderBy) {
          return 1;
        }
        if (a.mediaDataToOrderBy === b.mediaDataToOrderBy) {
          if(a._timestamp < b._timestamp) {
            return -1;
          }
          if(a._timestamp >= b._timestamp) {
            return 1;
          }
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

      // groupby day
      let mediaGroup = this.$_.groupBy(this.sortedMedias, (media) => {
        if(media.hasOwnProperty('date_timeline')) {
          var dateMoment = this.$moment(media.date_timeline);
          return dateMoment.format('YYYY-MM-DD');
        }
      });
      mediaGroup = this.$_.toPairs(mediaGroup); 

      mediaGroup = mediaGroup.map(([day, medias]) => {
        let media_by_hours = this.$_.groupBy(medias, (media) => {
          if(media.hasOwnProperty('date_timeline')) {
            var dateMoment = this.$moment(media.date_timeline);
            return dateMoment.format('HH') + ':00';
          }
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
        //   "10:00": {
        //     medias: [
        //       {},
        //       {}
        //     ]
        //   }           
        // };        

        media_by_hours = Object.entries(media_by_hours).reduce((acc, [hour, medias]) => {
          acc.push({
            label: hour,
            medias
          });
          return acc;
        }, []);
        // media_by_hours = this.$_.toPairs(media_by_hours); 
        // media_by_hours = this.$_.sortBy(media_by_hours);
        // media_by_hours = media_by_hours.reverse();
        return {
          day, 
          hours: media_by_hours
        };   
      });
        
      return mediaGroup;  
    },
    timeline_start() {
      const ts = this.folder.start;
      if (ts && this.$moment(ts, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
        return +this.$moment(ts, 'YYYY-MM-DD HH:mm:ss');
      } else {
        console.log(`WARNING: no timeline start. This can’t work.`);
        throw `Missing timeline start`;
      }
      return false;
    },
    timeline_end() {
      const ts = this.folder.end;

      const get_new_timeline_end = (ts) => {
        if (ts && this.$moment(ts, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
          // if end is in the future
          if (
            this.$moment(ts, 'YYYY-MM-DD HH:mm:ss', true).isAfter(this.$root.currentTime)
          ) {
            this.is_realtime = true;
            return +this.$moment(ts, 'YYYY-MM-DD HH:mm:ss');
            // if end is is in the present or past
          } else {
            this.is_realtime = false;
            return +this.$moment(ts, 'YYYY-MM-DD HH:mm:ss');
          }
        } else {
          // there is no valid end, we set end to current time and set is_realtime
          this.is_realtime = true;
          return +this.$root.currentTime;
        }
      }
      const new_timeline_end = get_new_timeline_end(ts);
      // if(new_timeline_end !== this.timeline_end) {
      //   return new_timeline_end;
      // }
      return new_timeline_end;
    },
    full_date_interval() {
      // console.log('COMPUTED • TimeLineView: full_date_interval');
      // itérer dans toutes les dates, 
      // et construire un array de date qui ressemble à ça :

      // entre timeline_start et timeline_end
      let date_interval = [];

      let currDate = this.$moment(this.timeline_start).add(-1, 'days');
      const lastDate = this.$moment(this.timeline_end);

      while(currDate.add(1, 'days').diff(lastDate) < 0) {
        let this_date = currDate.clone();
        let medias_for_date = [];

        const has_media_for_date = this.groupedMedias.filter(i => this.$moment(i.day).isSame(this_date, 'day'));

        if(has_media_for_date.length > 0) {
          medias_for_date = has_media_for_date[0].hours;
        }

        const is_current_day = this.$moment(this.$root.currentTime_minute).isSame(this_date, 'day');
        if(is_current_day) {
          medias_for_date.map(m => {
            if(m.label === this.$moment(this.$root.currentTime_minute).format('HH') + ':00') {
              m.is_current_hour = true;
            }
          });          
        }

        const number_of_medias = Object.values(medias_for_date).reduce((acc, element) => acc + element.medias.length, 0);
        let day = {
          label: this_date.format('dddd, MMMM D'),
          number_of_medias,
          is_current_day,
          hours: medias_for_date
        }

        date_interval.push(day);
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
        if(day.number_of_medias > 0 || acc.length === 0 || index === this.full_date_interval.length - 1 || day.is_current_day) {
          acc.push(day);
        } else {
          // if last added day has 0
          // acc.push(day);
          const last_item = acc[acc.length - 1]; 
          if(last_item.number_of_medias === 0) {
            // check if last item is already a period
            if(!last_item.hasOwnProperty('period') || !last_item.period) {
              day.period = true;
              acc.push(day);
            }
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
    }
  },
  methods: {
    onMousewheel(event) {
      console.log('METHODS • TimeLineView: onMousewheel');

      event.preventDefault();
      this.translation += event.deltaX; 
      this.translation += event.deltaY;

      const el = this.$refs.timeline;

      const timeline_width = el.children[0].offsetWidth - window.innerWidth;

      this.translation = Math.max(this.translation, 0);
      this.translation = Math.min(this.translation, timeline_width);

      el.scrollLeft = this.translation;
    },
    onMouseUp(event) {
      console.log('METHODS • TimeLineView: onMouseUp');

      const el = this.$refs.timeline; 
      setTimeout(() => this.translation = el.scrollLeft, 300);
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
    // prev / nav



    getMediaColorFromFirstAuthor(media_authors) {
      if(typeof media_authors !== 'object' 
      || media_authors.length == 0
      || typeof this.folder.authors !== 'object'
      || this.folder.authors.length == 0
      ) {
        return '';
      }

      const full_authors_info = this.folder.authors.filter(a => a.name === media_authors[0].name);
      if(full_authors_info.length == 0) {
        return '';
      }

      return full_authors_info[0].color;
    },
  }
}
</script>
<style lang="scss">

.m_timeline {
  height: 100vh;
  padding-left: 0;

  --label-backgroundcolor: #000;
  --label-color: white;

  --timeline-bg: #F1F2F0;
  --timeline-bg: #f8f8f8;
  --rule-color: rgb(220,220,220);

  --grid-color: var(--rule-color);
  --grid-opacity: 1;

  // background-color: #ddd;

  // background-color: #000;

  // TODO
  // pour un futur mode nuit
  // --label-backgroundcolor: #000;
  // --label-color: white;

  // --timeline-bg: #F1F2F0;
  // --timeline-bg: #222;
  // --rule-color: #fff;


}

.m_timeline--container {
  min-width: max-content;  
  height: 100%;
  display: flex;
}

.m_timeline--container--dates {
  display: flex;
  height: 100%;
  position: relative;

  margin: 0px 50px;
  padding: 16px 120px;
  // border-right: 1px solid #000;
}

.m_timeline--container--dates--day {
  position: relative;
  height: 100%;
  // min-width: 250px;
  display: flex;
  align-items: center;
  // background-color: var(--label-backgroundcolor);

  // border: 2px solid white;

  > .m_timeline--container--dates--day--daylabel {
    position: relative;
    height: 100%;
    width: 50px;
    margin: 0 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    --label-background: var(--timeline-bg);
    --label-color: black;

    &.is--current_day {
      --label-color: #ff3b4c;
    }

    .m_timeline--container--dates--day--daylabel--container {
      position: relative;
      transform: rotate(-90deg);
      // transform-origin: center center;
      
      display: flex;
      align-items: center;
      justify-content: center;

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
          background-color: #000;
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

  > .m_timeline--container--dates--day--empty {
    min-width: 140px;
    height: 100%;
    background: linear-gradient(to top left,
             rgba(0,0,0,0) 0%,
             rgba(0,0,0,0) calc(50% - .9px),
             var(--rule-color) 50%,
             rgba(0,0,0,0) calc(50% + .9px),
             rgba(0,0,0,0) 100%),
  }

  .m_timeline--container--dates--day--hours {
    position: relative;
    height: 100%;
    min-width: 88px;
    display: flex;
  }

  .m_timeline--container--dates--day--hours--hourlabel {
    position: relative;
    width: 44px;
    width: 0;
    height: 100%;
    top: 0;
    // padding: 24px;
    display: flex;
    align-items: center;
    z-index: 100;
    pointer-events: none;

    &.is--current_hour {
      --label-backgroundcolor: #ff3b4c;
    }

    span {
      display: block;
      background-color: var(--label-backgroundcolor);
      color: var(--label-color);
      padding: 2px 8px;

      transform: rotate(-15deg) translateX(-20px);
      transform-origin: center center;
      font-style: italic;    
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
  top:20px;
  left: 20px;
  z-index: 100000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  background-color: black;
}

</style>