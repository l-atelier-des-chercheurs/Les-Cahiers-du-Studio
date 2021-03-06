<template>
  <div class="m_sidebarList" :class="`m_sidebarList_${display}`">
    <table
      class="margin-none border-none"
      :class="{ 'table-hoverable': display === 'table' }"
    >
      <thead>
        <tr>
          <th class="font-small padding-medium">{{ $t("preview") }}</th>
          <th>
            <select v-model="currentSort">
              <option
                v-for="option in sort.available"
                :value="option"
                :key="option.name"
                >{{ option.name }}</option
              >
            </select>
          </th>
          <th v-if="display === 'table'"></th>
        </tr>
        <tr>
          <th class="font-small padding-medium">{{ $t("filter") }}</th>
          <th>
            <input type="text" v-model="currentFilter" />
          </th>
          <th v-if="display === 'table'"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="media in sortedMedias"
          :key="media.slugMediaName"
          @mouseover="highlightMedia(media.slugMediaName)"
          @mouseleave="unHighlightMedia(media.slugMediaName)"
          @click.stop="scrollToMedia(media.slugMediaName)"
          class="m_sidebarList--media"
          :class="[
            { 'is--outOfScope': mediaIsOutOfScope(media) },
            'color-' + media.color
          ]"
          :title="media.slugMediaName"
        >
          <template v-if="display === 'table'">
            <td class="padding-small">
              <MediaContent
                v-model="media.content"
                :context="'preview'"
                :preview_size="50"
                :slugFolderName="slugFolderName"
                :slugMediaName="media.slugMediaName"
                :media="media"
                :read_only="read_only"
              />
            </td>
            <td class="font-small padding-small">
              {{ media_data_to_show(media) }}
            </td>
            <td class="font-small padding-small">
              <button
                type="button"
                class="border-circled button-thin button-wide padding-verysmall margin-verysmall flex-wrap flex-vertically-centered c-noir"
                @click.stop="openMediaModal(media.slugMediaName)"
              >
                {{ $t("open") }}
              </button>
            </td>
          </template>

          <template v-else-if="display === 'mediasList'">
            <td class="bg-transparent" colspan="2">
              <MediaContent
                v-model="media.content"
                class="margin-medium"
                :context="'MediasList'"
                :slugFolderName="slugFolderName"
                :element_width_for_sizes="1080"
                :slugMediaName="media.slugMediaName"
                :media="media"
              ></MediaContent>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import MediaContent from "../subcomponents/MediaContent.vue";
import _ from "underscore";

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
    timeline_start: Number,
    timeline_end: Number
  },
  data() {
    return {
      currentSort: this.sort.current,
      currentFilter: this.filter
    };
  },
  mounted: function() {},
  computed: {},
  watch: {
    currentSort: function() {
      this.$eventHub.$emit("setSort", this.currentSort);
    },
    currentFilter: function() {
      this.$eventHub.$emit("setFilter", this.currentFilter);
    },
    "sort.current": function() {
      this.currentSort = this.sort.current;
    },
    filter: function() {
      this.currentFilter = this.filter;
    }
  },
  methods: {
    media_data_to_show(media) {
      if (
        this.sort.current.type === "array" &&
        media.hasOwnProperty(this.sort.current.field)
      ) {
        let media_prop = media[this.sort.current.field];
        if (typeof media_prop === "string") {
          media_prop = [{ [this.sort.current.field_name]: media_prop }];
        }

        const array_items = media_prop.map(
          a => a[this.sort.current.field_name]
        );
        return array_items.join(", ");
      }
      return media[this.sort.current.field];
    },

    highlightMedia(slugMediaName) {
      if (this.display !== "table") return false;
      this.$eventHub.$emit("highlightMedia", slugMediaName);
    },
    unHighlightMedia(slugMediaName) {
      if (this.display !== "table") return false;
      this.$eventHub.$emit("highlightMedia", "");
    },
    scrollToMedia(slugMediaName) {
      if (this.display !== "table") return false;
      this.$eventHub.$emit("scrollToMedia", slugMediaName);
    },
    openMediaModal(slugMediaName) {
      this.$eventHub.$emit("timeline.openMediaModal", slugMediaName);
    },
    mediaIsOutOfScope(media) {
      if (
        this.$moment(media.date_timeline).isBefore(this.timeline_start) ||
        this.$moment(media.date_timeline).isAfter(this.timeline_end)
      ) {
        return true;
      }
      return false;
    }
  }
};
</script>
