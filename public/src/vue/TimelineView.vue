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
    <!-- {{ timeline_start }}<br>
    {{ timeline_end }}<br> -->
    <!-- translation : {{ translation }} -->

      <div class="m_timeline"
        ref="timeline"
      >
        <div class="m_timeline--container">

          <div class="m_timeline--container--dates">
            <div 
              v-for="day in date_interval" 
              :key="day.label"
              class="m_timeline--container--dates--day"
            >
              <div class="m_timeline--container--dates--day--daylabel"><span>{{ day.label }}</span></div>
              <div v-for="(medias, hour) in day.hours"
                :key="hour"
                class="m_timeline--container--dates--day--hours"
              >
                <div class="m_timeline--container--dates--day--hours--hourlabel"><span>{{ hour }}</span></div>

                <MediasBlock 
                  :medias="medias"
                  :folder="folder"
                  :slugFolderName="slugFolderName"
                />

              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Ici le bouton +

    Ici la minimap

    Ici le bouton retour et l’indication du nom de la timeline

    Ici les médias -->

  </div>
</template>
<script>
import MediasBlock from './components/MediasBlock.vue';

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object,
    read_only: Boolean
  },
  components: {
    MediasBlock
  },
  data() {
    return {

      translation: 0,

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

    const el = this.$refs.timeline;
    // function scrollHorizontally(e) {
    //   e = window.event || e;
    //   e.preventDefault();
    //   el.scrollLeft -= (e.wheelDelta || -e.detail);
    // }
    // function init() {
    //   if (!el) {
    //     return;
    //   }

    //   if (el.addEventListener) {
    //     el.addEventListener('mousewheel', scrollHorizontally, false);
    //     el.addEventListener('DOMMouseScroll', scrollHorizontally, false);
    //   } else {
    //     el.attachEvent('onmousewheel', scrollHorizontally);
    //   }
    // }
    // init();

    var isFirefox = !1;
    var onScroll = (c) => {
      c.preventDefault();
      isFirefox ? 
        this.translation += 2 * c.detail : 
        (this.translation += c.deltaX, this.translation += c.deltaY)
        ;

      const timeline_width = el.children[0].offsetWidth - window.innerWidth;

      this.translation = Math.max(this.translation, 0);
      this.translation = Math.min(this.translation, timeline_width);

      el.scrollLeft = this.translation;
    };

    var mousewheelevt = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel"
      , isFirefox = /Firefox/i.test(navigator.userAgent) ? !0 : !1;
    document.attachEvent ? document.attachEvent("on" + mousewheelevt, onScroll) : document.addEventListener && document.addEventListener(mousewheelevt, onScroll, !1);

  },
  beforeDestroy() {
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
      console.log('METHODS • TimeLineView: sortedMedias');
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
      console.log('METHODS • TimeLineView: groupedMedias');

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
        // media_by_hours = this.$_.toPairs(media_by_hours); 
        // media_by_hours = this.$_.sortBy(media_by_hours);
        // media_by_hours = media_by_hours.reverse();

        return [day, media_by_hours];   
      });
      // groupby hour in day
      return mediaGroup;  
    },
    timeline_start() {
      const ts = this.folder.start;
      if (ts && this.$moment(ts, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
        return this.$moment(ts, 'YYYY-MM-DD HH:mm:ss');
      } else {
        console.log(`WARNING: no timeline start. This can’t work.`);
        throw `Missing timeline start`;
      }
      return false;
    },
    timeline_end() {
      const ts = this.folder.end;
      if (ts && this.$moment(ts, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
        // if end is in the future
        if (
          this.$moment(ts, 'YYYY-MM-DD HH:mm:ss', true).isAfter(this.$moment())
        ) {
          this.isRealtime = true;
          return this.$moment(ts, 'YYYY-MM-DD HH:mm:ss');
          // if end is is in the present or past
        } else {
          this.isRealtime = false;
          return this.$moment(ts, 'YYYY-MM-DD HH:mm:ss');
        }
      } else {
        // there is no valid end, we set end to current time and set realtime
        this.isRealtime = true;
        return this.$root.currentTime;
      }
    },

    date_interval() {
      // itérer dans toutes les dates, 
      // et construire un array de date qui ressemble à ça :

      // entre timeline_start et timeline_end
      let date_interval = [];

      let currDate = this.$moment(this.timeline_start).startOf('day');
      const lastDate = this.$moment(this.timeline_end).startOf('day');

      while(currDate.add(1, 'days').diff(lastDate) < 0) {
        let this_date = currDate.clone();
        let medias_for_date = [];

        const has_media_for_date = this.groupedMedias.filter(i => this.$moment(i[0]).isSame(this_date, 'day'));

        if(has_media_for_date.length > 0) {
          medias_for_date = has_media_for_date[0][1];
        }

        let day = {
          label: this_date.format('dddd, MMMM D'),
          hours: medias_for_date
        }

        date_interval.push(day);
      }

      // days = days.map(d => d.format('L'));

      return date_interval;
    }
  },
  methods: {
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
  --rule-color: #000;

  background-color: var(--timeline-bg);
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

}

.m_timeline--container--dates--day {
  position: relative;
  height: 100%;
  min-width: 250px;
  display: flex;
  align-items: center;
  // background-color: var(--label-backgroundcolor);

  // border: 2px solid white;

  > .m_timeline--container--dates--day--daylabel {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;

    span {
      background-color: var(--timeline-bg);
      color: #000;
      padding: 2px 8px;
      transform: rotate(-90deg);
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

  .m_timeline--container--dates--day--hours {
    position: relative;
    height: 100%;
  }

  .m_timeline--container--dates--day--hours--hourlabel {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    display: flex;
    align-items: center;
    z-index: 1;
    pointer-events: none;



    span {
      display: block;
      // width: 100%;
      background-color: var(--label-backgroundcolor);
      color: var(--label-color);
      padding: 2px 8px;

      transform: rotate(-15deg);
      transform-origin: left top;
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

  .m_verticalmedias {
    // display: flex;
    // flex-flow: row wrap;
    // align-items: flex-start;
    // height: 100%;

    > * {
      // width: 250px;
      // background-color: white;
      // box-shadow: 0 2px 8px rgba(0,0,0,.33);
      // border-radius: 4px;

    }

  }
}

.folder_backbutton {
  position: fixed;
  top:30px;
  left: 30px;
  z-index: 100000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  background-color: black;
}

</style>