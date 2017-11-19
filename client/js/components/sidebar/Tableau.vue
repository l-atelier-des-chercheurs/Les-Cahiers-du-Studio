<template>
  <div class="m_sidebarList"
    :class="`m_sidebarList_${display}`"
    >
    <table class="margin-none"
      :class="{ 'table-hoverable' : display === 'table' }"
      >
      <thead>
        <tr>
          <th class="font-small padding-medium">
            Aperçu
          </th>
          <th>
            <select v-model="currentSort">
              <option v-for="option in sort.available" :value="option">
                {{ option.name }}
              </option>
            </select>
          </th>
          <th v-if="display === 'table'">
          </th>
        </tr>
        <tr>
          <th class="font-small padding-medium">Filtre</th>
          <th>
            <input type="text" v-model="currentFilter" debounce="5000">
          </th>
          <th v-if="display === 'table'">
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
          :class="[{ 'is--outOfScope' : mediaIsOutOfScope(media) }, 'color-' + media.color ]"
          :title="media.slugMediaName"
          >

          <template v-if="display === 'table'">
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
          </template>


          <template v-else-if="display === 'mediasList'">
            <td class="bg-transparent" colspan="2">
              <MediaContent
                v-model="media.content"
                class="margin-medium"
                :context="'MediasList'"
                :slugMediaName="media.slugMediaName"
                :slugFolderName="slugFolderName"
                :media="media"
                >
              </MediaContent>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import MediaContent from '../subcomponents/MediaContent.vue';

import EventBus from '../../event-bus';
import moment from 'moment';
import _ from 'underscore';

export default {
  components: {
    MediaContent
  },
  props: {
    display: String,
    filter: String,
    sort: Object,
    slugFolderName: String,
    sortedMedias: Array,
    timelineInfos: Object,
  },
  data() {
    return {
      currentSort: this.sort.current,
      currentFilter: this.filter
    }
  },
  mounted: function() {
  },

  computed: {
  },
  watch: {
    'currentSort': function() {
      EventBus.$emit('setSort', this.currentSort);
    },
    'currentFilter': function() {
      EventBus.$emit('setFilter', this.currentFilter);
    }
  },
  methods: {
    highlightMedia(slugMediaName) {
      if(this.display !== 'table') return false;
      EventBus.$emit('highlightMedia', slugMediaName);
    },
    unHighlightMedia(slugMediaName) {
      if(this.display !== 'table') return false;
      EventBus.$emit('highlightMedia', '');
    },
    scrollToMedia(slugMediaName) {
      if(this.display !== 'table') return false;
      EventBus.$emit('scrollToMedia', slugMediaName);
    },
    openMediaModal(slugMediaName) {
      EventBus.$emit('timeline.openMediaModal', slugMediaName);
    },
    mediaIsOutOfScope(media) {
      if(moment(media.created).isBefore(this.timelineInfos.start) || moment(media.created).isAfter(this.timelineInfos.end)) {
        return true;
      }
      return false;
    },
    linkToThumb(media) {
      let thumbSize = 50;
      let pathToSmallestThumb = _.findWhere(media.thumbs, { size: thumbSize }).path;
      return pathToSmallestThumb !== undefined ? pathToSmallestThumb : '';
    },
  }
}
</script>