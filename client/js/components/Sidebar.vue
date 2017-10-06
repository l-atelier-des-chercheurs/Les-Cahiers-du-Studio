<template>
  <div class="m_sidebar" ref="sidebar">
    <div class="intro margin-small">
      <h3>
        Nombre de médias&nbsp;: {{ Object.keys(medias).length }}
      </h3>
    </div>

    <h3 class="margin-small">Calendrier&nbsp;:</h3>
    <div
      v-for="(days, month) in folderDays()"
      class="m_calendar"
    >
      <h3 class="margin-small margin-bottom-none">
        {{ month }}
      </h3>
      <div class="m_calendar--days">
        <button
          v-for="(daymeta, index) in days"
          class="m_calendar--days--day button-small"
          @click="scrollToDate(daymeta.timestamp)"
        >
          {{ daymeta.dayNumber }}<br>
          {{ daymeta.numberOfMedias }}
        </button>
      </div>
    </div>

    <h3>Liste&nbsp;:</h3>
    <table class="table-striped table-hoverable">
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
            Go
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(media, index) in medias"
          v-bind:key="index"
          @mouseover="highlightMedia(index)" @mouseleave="unHighlightMedia(index)"
        >
          <td class="font-small">{{ index }}</td>
          <td class="font-small">{{ media[secondColumn] }}</td>
          <td>
            <button type="button" class="button_small" @click="scrollToMedia(index)">
              &nbsp;↪&nbsp;
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <ul>
      <li
      >
      </li>
    </ul>

  </div>
</template>
<script>
import EventBus from '../event-bus';
import moment from 'moment';


// from https://stackoverflow.com/questions/23795522/how-to-enumerate-dates-between-two-dates-in-moment
var enumerateDaysBetweenDates = function(startDate, endDate) {
  var dates = [];

  var currDate = moment(startDate).startOf('day').subtract(1, 'days');
  var lastDate = moment(endDate).startOf('day').add(1, 'days');

  while(currDate.add(1, 'days').diff(lastDate) < 0) {
      console.log(currDate.toDate());
      dates.push(currDate.clone().toDate());
  }

  return dates;
};

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object,
    timelineInfos: Object
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
      console.log('methods : getting folderDays');
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
        let dayData = {
          "dayNumber": day,
          "numberOfMedias": this.getNumberOfMediasCreatedOnThisDate(cur),
          "timestamp": moment(cur)
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
    }
  }

}
</script>

<style lang="sass">


</style>