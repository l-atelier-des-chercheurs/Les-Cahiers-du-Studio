<template>
  <div class="m_sidebar" ref="sidebar">

    <SidebarSection>
      <div slot="header" class="flex-vertically-centered">
        <h3 class="margin-none text-cap with-bullet">
          Informations du dossier&nbsp;
        </h3>
        <button v-if="folder.authorized" type="button" class="button-small border-circled button-thin button-wide padding-verysmall margin-none" @click="openEditFolderModal()">
          éditer
        </button>
      </div>
    </SidebarSection>

    <SidebarSection>
      <div slot="header">
        <h3 class="margin-none text-cap with-bullet">
          Calendrier&nbsp;
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
                'is--current' : daymeta.isCurrentDay,
                'has--noMedia' : !daymeta.numberOfMedias,
                'is--today': daymeta.isToday
              }"
              @click="scrollToDate(daymeta.timestamp)"
              >
              <button class="font-verylarge padding-none">
                {{ daymeta.dayNumber }}
                <div class="font-veryverysmall bottomIndicator">
                  {{ daymeta.numberOfMedias > 0 ? daymeta.numberOfMedias : '×' }}
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

      <table slot="body" class="table">

        <thead>
          <tr>
            <th>Nom du média</th>
            <th>
              <select v-model="secondColumn">
                <option v-for="mediaType in mediaKeys()">
                  {{ mediaType }}
                </option>
              </select>
            </th>
            <th>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(media, index) in medias"
            v-bind:key="index"
            @mouseover="highlightMedia(index)" @mouseleave="unHighlightMedia(index)"
            v-if="media.hasOwnProperty(secondColumn) && media[secondColumn] !== ''"
          >
            <td class="font-small">{{ index }}</td>
            <td class="font-small">{{ media[secondColumn] }}</td>
            <td>
              <button type="button" class="" @click="scrollToMedia(index)">
                &nbsp;↪&nbsp;
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </SidebarSection>

  </div>

</template>
<script>
import EventBus from '../event-bus';
import moment from 'moment';

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
    currentDay: Number,
    showEditFolderModal: false
  },
  data() {
    return {
      secondColumn: 'created'
    }
  },
  methods: {
    mediaKeys() {
      return Object.keys(locals.structure.media);
    },
    getCurrentDay() {
      return moment(this.currentDay).format('DD/MM/YYYY');
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
        let isCurrentDay = false;
        if(fullDate === this.getCurrentDay()) {
          isCurrentDay = true;
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
          isCurrentDay,
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
    }
  }

}
</script>

<style lang="sass">


</style>