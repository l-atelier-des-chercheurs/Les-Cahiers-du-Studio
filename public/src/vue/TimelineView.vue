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
              <div class="m_timeline--container--dates--day--indicators">{{ day.label }}</div>
              <div class="m_verticalmedias">
                <div 
                  v-for="media in day.medias"
                  :key="media.slugMediaName"
                >
                  {{ media.date_created }}
                  <MediaContent
                    v-model="media.content"
                    :slugFolderName="slugFolderName"
                    :slugMediaName="media.slugMediaName"
                    :media="media"
                    :context="'preview'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- <div 
      v-for="media in sortedMedias"
      :key="media.slugMediaName"
      class="m_verticalmedias"
        :style="`margin-left: ${Math.random() * 80}vw`"
    >
      <MediaContent
        v-model="media.content"
        :slugFolderName="slugFolderName"
        :slugMediaName="media.slugMediaName"
        :media="media"
        :context="'preview'"
      />
    </div> -->

    <!-- Ici le bouton +

    Ici la minimap

    Ici le bouton retour et l’indication du nom de la timeline

    Ici les médias -->

  </div>
</template>
<script>
import MediaContent from './components/subcomponents/MediaContent.vue';

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object,
    read_only: Boolean
  },
  components: {
    MediaContent
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
      let mediaGroup = this.$_.groupBy(this.sortedMedias, (media) => {
          if(media.hasOwnProperty('date_created')) {
            var dateMoment = this.$moment(media.date_created);
            return dateMoment.format('YYYY-MM-DD');
          }
        });
      
      mediaGroup = this.$_.toPairs(mediaGroup); 
      mediaGroup = this.$_.sortBy(mediaGroup);
      mediaGroup = mediaGroup.reverse();
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

        let entry = {
          label: this_date.format('L'),
          medias: medias_for_date
        }

        // add hours with medias 
        
        // add medias inside hours

        date_interval.push(entry);
      }

      // days = days.map(d => d.format('L'));

      return date_interval;
    }
  },
  methods: {
  }
}
</script>
<style scoped lang="scss">

.m_timeline {
  height: 100vh;
  padding-left: 0;
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

  border: 2px solid white;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    width: 100%;
    padding-bottom: 5px;
    border-top: 2px solid lighten(black, 92%);
    z-index: -1;
  }

  > .m_timeline--container--dates--day--indicators {
    position: relative;
    background-color: #F1F2F0;
    align-self: center;
    justify-self: center;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      border-left: 2px solid lighten(black, 92%);
    }
  }

  .m_verticalmedias {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    height: 100%;

    > * {
      width: 150px;
      background-color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,.33);
      border-radius: 4px;

    }

  }
}

</style>