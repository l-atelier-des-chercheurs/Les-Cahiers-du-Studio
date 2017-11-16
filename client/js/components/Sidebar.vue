<template>
  <div class="m_sidebar padding-bottom-medium" ref="sidebar">

    <SidebarSection>
      <div slot="header" class="flex-vertically-centered">
        <h3 class="margin-none text-cap with-bullet">
          Informations du dossier&nbsp;
          <button
            v-if="folder.authorized"
            type="button"
            class="button-small border-circled button-thin button-wide padding-verysmall margin-none"
            @click="openEditFolderModal()"
            >
            éditer
          </button>
        </h3>
      </div>

      <div slot="body" class="">
        <p class="font-small">
          Les contenus de ce dossier sont enregistrés dans
          <template v-if="$root.store.is_electron">
            <a :href="folder.fullFolderPath" @click.prevent="openInFinder(folder.fullFolderPath)">
              {{ folder.fullFolderPath.replace(/\//g, '\/\u200B') }}
            </a>
          </template>

          <template v-else>
            {{ folder.fullFolderPath.replace(/\//g, '\/\u200B') }}
          </template>
        </p>
      </div>
    </SidebarSection>

    <SidebarSection>
      <div slot="header">
        <h3 class="margin-none text-cap with-bullet">
          Calendrier&nbsp;
          <button
            v-if="isRealtime"
            type="button"
            class="button-small border-circled button-thin button-wide padding-verysmall margin-none c-rouge_vif"
            @click="scrollToToday()"
            >
            en ce moment →
          </button>
        </h3>
      </div>

      <div slot="body" class="m_calendar">
        <div
          v-for="(days, month) in folderDays()"
          class="m_calendar--month"
        >
          <h3 class="margin-bottom-none text-ital font-small">
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
          Liste&nbsp;
        </h3>
      </div>

      <div slot="body" class="margin-sides-negative-medium">
        <table class="m_sidebarList table-hoverable margin-none">
          <thead>
            <tr>
              <th class="font-small padding-medium">Aperçu</th>
<!--              <th class="font-small padding-medium">Nom du fichier</th> -->
              <th>
                <select v-model="sort.current">
                  <option v-for="option in sort.available" :value="option">
                    {{ option.name }}
                  </option>
                </select>
              </th>
              <th>
              </th>
            </tr>
            <tr>
              <th class="font-small padding-medium">Recherche</th>
              <th>
                <input type="text" v-model="filter">
              </th>
              <th>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-if="media.hasOwnProperty(sort.current.field) && media[sort.current.field] !== ''"
              v-for="media in sortedMedias"
              :key="media.slugMediaName"
              @mouseover="highlightMedia(media.slugMediaName)"
              @mouseleave="unHighlightMedia(media.slugMediaName)"
              @click.stop="scrollToMedia(media.slugMediaName)"
              class="m_sidebarList--media"
              :class="{ 'is--outOfScope' : mediaIsOutOfScope(media) }"
              :title="media.slugMediaName"
              >
              <td class="padding-small">
                <template v-if="media.type === 'image'">
                  <img :src="linkToThumb(media)">
                </template>
              </td>
              <td class="font-small padding-small">{{ media[sort.current.field] }}</td>
              <td class="font-small padding-small">
                <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall flex-wrap flex-vertically-centered c-noir"
                  @click.stop="openMediaModal(media.slugMediaName)"
                  >
                  Ouvrir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SidebarSection>

  </div>

</template>
<script>
import EventBus from '../event-bus';
import moment from 'moment';
import _ from 'underscore';

import Informations from './sidebar/Informations.vue';
import Calendrier from './sidebar/Calendrier.vue';
import Tableau from './sidebar/Tableau.vue';
import SidebarSection from './sidebar/SidebarSection.vue';

// from https://stackoverflow.com/questions/23795522/how-to-enumerate-dates-between-two-dates-in-moment
var enumerateDaysBetweenDates = function(startDate, endDate) {
  var dates = [];

  var currDate = moment(startDate).startOf('day').subtract(1, 'days');
  var lastDate = moment(endDate).startOf('day').add(1, 'days');

  while(currDate.add(1, 'days').diff(lastDate) < 0) {
    dates.push(currDate.clone().toDate());
  }

  return dates;
};

export default {
  components: {
    SidebarSection
  },
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object,
    timelineInfos: Object,
    visibleDay: Number,
    isRealtime: {
      type: Boolean,
      default: false,
    },
    showEditFolderModal: false
  },
  data() {
    return {
      filter: '',
      sort: {
        current: {
          field: 'created',
          name: 'Date de création',
          type: 'date',
          order: 'ascending',
        },

        available: [
          {
            field: 'created',
            name: 'Date de création',
            type: 'date',
            order: 'ascending',
          },
          {
            field: 'modified',
            name: 'Date de modification',
            type: 'date',
            order: 'descending',
          },
          {
            field: 'type',
            name: 'Type',
            type: 'alph',
            order: 'ascending',
          },
          {
            field: 'color',
            name: 'Couleur',
            type: 'alph',
            order: 'ascending',
          },
          {
            field: 'authors',
            name: 'Auteurs',
            type: 'alph',
            order: 'ascending',
          },
          {
            field: 'public',
            name: 'Public',
            type: 'alph',
            order: 'descending',
          },
          {
            field: 'content',
            name: 'Contenu',
            type: 'alph',
            order: 'ascending',
          },
        ]
      },
    }
  },
  computed: {
    sortedMedias() {
      var sortable = [];
      for (let slugMediaName in this.medias) {
        let mediaDataToOrderBy;

        if (this.sort.current.type ==='date') {
          mediaDataToOrderBy = + new Date(this.medias[slugMediaName][this.sort.current.field]);
        } else if (this.sort.current.type ==='alph') {
          mediaDataToOrderBy = this.medias[slugMediaName][this.sort.current.field];
        }

        sortable.push({ slugMediaName: slugMediaName, mediaDataToOrderBy: mediaDataToOrderBy });
      }
      let sortedSortable = sortable.sort(function(a, b) {
        let valA = a.mediaDataToOrderBy;
        let valB = b.mediaDataToOrderBy;
        if(typeof a.mediaDataToOrderBy === 'string' && typeof b.mediaDataToOrderBy === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) { return -1; }
        if (valA > valB) { return 1; }
        return 0;
      });
      if(this.sort.current.order === 'descending') {
        sortedSortable.reverse();
      }

      // array order is garanteed while objects properties aren’t,
      // that’s why we use an array here
      let sortedMedias = sortedSortable.reduce((result, d) => {
        let sortedMediaObj = this.medias[d.slugMediaName];
        sortedMediaObj.slugMediaName = d.slugMediaName;

        if(this.filter.length > 0) {
          // if there is a filter set, let’s only return medias whose mediaDataToOrderBy contain that string
          let originalContentFromMedia = sortedMediaObj[this.sort.current.field] + '';
          if(originalContentFromMedia.indexOf(this.filter) !== -1) {
            result.push(sortedMediaObj);
          }
        } else {
          result.push(sortedMediaObj);
        }

        return result;
      }, []);
      return sortedMedias;
    },
  },

  methods: {
    openInFinder(thisPath) {
      const shell = window.require('electron').shell;
      event.preventDefault();
      shell.showItemInFolder(thisPath);
    },
    getVisibleDay() {
      return moment(this.visibleDay).format('DD/MM/YYYY');
    },
    scrollToMedia(slugMediaName) {
      EventBus.$emit('scrollToMedia', slugMediaName);
    },
    scrollToDate(timestamp) {
      EventBus.$emit('scrollToDate', timestamp);
    },
    highlightMedia(slugMediaName) {
      EventBus.$emit('highlightMedia', slugMediaName);
    },
    unHighlightMedia(slugMediaName) {
      EventBus.$emit('highlightMedia', '');
    },
    openMediaModal(slugMediaName) {
      EventBus.$emit('timeline.openMediaModal', slugMediaName);
    },
    linkToThumb(media) {
      let thumbSize = 50;
      let pathToSmallestThumb = _.findWhere(media.thumbs, { size: thumbSize }).path;
      return pathToSmallestThumb !== undefined ? pathToSmallestThumb : '';
    },
    mediaIsOutOfScope(media) {
      if(moment(media.created).isBefore(this.timelineInfos.start) || moment(media.created).isAfter(this.timelineInfos.end)) {
        return true;
      }
      return false;
    },
    folderDays() {
      console.log('METHODS • sidebar: getting folderDays');
      const allDays = enumerateDaysBetweenDates(this.timelineInfos.start, this.timelineInfos.end);
      if(allDays.length === 0) { return; }

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
        let monthName = moment(cur).format('MMMM');
        let day = moment(cur).date();

        let fullDate = moment(cur).format('DD/MM/YYYY');
        let isVisibleDay = false;
        if(fullDate === this.getVisibleDay()) {
          isVisibleDay = true;
        }
        let isToday = false;
        let todaysDate = moment().format('DD/MM/YYYY');
        if(todaysDate === fullDate) {
          isToday = true;
        }

        let dayData = {
          "dayNumber": day,
          "numberOfMedias": this.getNumberOfMediasCreatedOnThisDate(cur),
          "timestamp": moment(cur),
          isVisibleDay,
          isToday
        };

        if(typeof acc[monthName] === 'undefined') {
          acc[monthName] = [];
        }
        acc[monthName].push(dayData);
        return acc;
      }, {});

      return dayGroupedByMonth;
    },

    getNumberOfMediasCreatedOnThisDate(date) {
      if(Object.keys(this.medias).length === 0) {
        return 0;
      }

      const total = Object.entries(this.medias).reduce((acc, pair) => {
        const [key, value] = pair;
        let created_day = moment(value.created);
        if(created_day.isSame(date, 'day')) {
          acc++;
        }

        return acc;
      }, 0);

      return total;
    },

    openEditFolderModal() {
      EventBus.$emit('showEditFolderModal');
    },

    scrollToToday() {
      EventBus.$emit('timeline.scrollToToday');
    }
  }

}
</script>

<style lang="sass">


</style>