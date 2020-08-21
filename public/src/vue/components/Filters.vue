<template>
  <div class="m_filtersview">
    <div class="m_filtersview--topbar">
      <div class="m_actionbar">
        <div class="m_actionbar--buttonBar"></div>
        <div class="m_actionbar--text">{{ $t("filters_instructions") }}</div>
      </div>

      <button
        class="button-round _closeChatButton padding-verysmall"
        @click="$root.closeSidebar()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 48 48"
        >
          <line x1="13.33" y1="13.33" x2="34.67" y2="34.67" />
          <line x1="13.33" y1="34.67" x2="34.67" y2="13.33" />
        </svg>
      </button>
    </div>

    <div class="m_keywordField">
      <div class="">
        <!-- <label>{{ $t("all_tags") }}</label> -->
        <div>
          <button
            type="button"
            v-for="keyword in all_keywords"
            :key="keyword.text"
            class="tag"
            :class="{
              'is--unselectable': keyword.text !== selected_keyword,
            }"
            @click="toggleKeyword(keyword.text)"
          >
            {{ keyword.text }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    medias: Array,
  },
  components: {},
  data() {
    return {
      selected_keyword: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    selected_keyword: {
      handler() {
        this.$root.media_keyword_filter = this.selected_keyword;
      },
      immediate: true,
    },
  },
  computed: {
    all_keywords() {
      return this.$root.allKeywords;
    },
    // allKeywordsExceptCurrent() {
    //   return .filter(
    //     (i) => !this.tags.find((t) => t.text === i.text)
    //   );
    // },
  },
  methods: {
    toggleKeyword(kw) {
      if (this.selected_keyword === kw) this.selected_keyword = false;
      else this.selected_keyword = kw;
    },
  },
};
</script>
<style lang="scss" scoped>
.m_filtersview {
  position: relative;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  // width: 100%;
  // height: 100%;

  // z-index: 100000;
  // top: 0;
  // right: 0;
  // max-width: 440px;
  // flex: 0 0 420px;

  height: 100%;
  background-color: var(--color-noir);
  color: white;
  // box-shadow: -0.1em 0.2em 1em rgba(0, 0, 0, 0.2);

  // background-color: white;
  border: 4px solid var(--color-noir);
  // margin: 2em;
  // padding: 1em;
  padding-top: calc(var(--spacing) / 2);
  padding-bottom: calc(var(--spacing) / 2);

  // border-radius: 8px;

  display: flex;
  flex-flow: column nowrap;

  button,
  label {
    color: var(--color-noir);
  }
}

._closeChatButton {
  flex: 0 0 auto;
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 0;
  width: 33px;
  height: 33px;

  svg {
    display: block;
    width: 33px;
    height: 33px;
    stroke: white;
  }
}

.m_filtersview--topbar {
  padding-left: calc(var(--spacing) / 2);
  padding-right: calc(var(--spacing) / 2);
  margin-bottom: 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}

.m_keywordField {
  padding-left: calc(var(--spacing) / 2);
  padding-right: calc(var(--spacing) / 2);
}
</style>
