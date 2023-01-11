<template>
  <div class="m_filterIndicator" v-if="show_indicator">
    <button type="button" class="_disableFilters" @click="disableAllFilters()">
      ×
    </button>
    <small>
      <div class>
        <span v-html="$t('active_filter:')" />
        {{ " " }}

        <template v-if="$root.settings.media_keyword_filter">
          <button type="button">
            {{ $t("keywords") }} = {{ $root.settings.media_keyword_filter }}
          </button>
        </template>
        <template v-if="$root.settings.media_author_filter">
          <button type="button">
            {{ $t("author") }} = {{ $root.settings.media_author_filter }}
          </button>
        </template>
        <template v-if="$root.settings.media_timeline_interval_filter.start">
          <button type="button">
            {{ $t("interval") }} =
            {{
              $root.humanTime({
                timestamp: $root.settings.media_timeline_interval_filter.start,
              })
            }}
            <template v-if="$root.settings.media_timeline_interval_filter.end">
              <br />
              {{
                $root.humanTime({
                  timestamp: $root.settings.media_timeline_interval_filter.end,
                })
              }}
            </template>
          </button>
        </template>
        <template v-if="$root.settings.media_public_filter">
          {{ $t("show_only_public") }}
        </template>
      </div>
      <div class>
        <span v-html="$t('medias_shown:')" />
        <span
          v-html="sortedMedias.length + '/' + Object.keys(this.medias).length"
        />
      </div>
    </small>
  </div>
</template>
<script>
export default {
  props: {
    medias: Object,
    sortedMedias: Array,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    show_indicator() {
      return (
        this.$root.settings.media_keyword_filter ||
        this.$root.settings.media_author_filter ||
        this.$root.settings.media_timeline_interval_filter.start ||
        this.$root.settings.media_public_filter
      );
    },
  },
  methods: {
    disableAllFilters() {
      this.$root.settings.media_keyword_filter =
        this.$root.settings.media_author_filter =
        this.$root.settings.media_timeline_interval_filter.start =
        this.$root.settings.media_timeline_interval_filter.end =
          false;
      this.$root.settings.media_public_filter = false;
    },
  },
};
</script>
<style lang="scss" scoped></style>
