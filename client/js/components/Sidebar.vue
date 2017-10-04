<template>
  <div class="m_sidebar" ref="sidebar">
    <div class="intro">
      <h3>
        Nombre de médias&nbsp;: {{ Object.keys(medias).length }}
      </h3>
      <h3>
        Liste&nbsp;:
      </h3>
    </div>

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

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object
  },
  data() {
    return {
      secondColumn: 'created'
    }
  },
  methods: {
    mediaKeys: function() {
      return Object.keys(locals.structure.media);
    },
    scrollToMedia: function(slugMediaName) {
      EventBus.$emit('scrollToMedia', slugMediaName);
    },
    highlightMedia: function(slugMediaName) {
      EventBus.$emit('highlightMedia', slugMediaName);
    },
    unHighlightMedia: function(slugMediaName) {
      EventBus.$emit('highlightMedia', '');
    }
  }

}
</script>

<style lang="sass">


</style>