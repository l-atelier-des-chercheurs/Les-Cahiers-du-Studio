<template>
  <div class="m_filtersview">
    <section class="bg-noir_light c-blanc padding-medium">
      <header class="margin-vert-small">
        <div class="flex-vertically-centered">
          <h3 class="margin-none text-cap with-bullet">{{ $t("filters") }}</h3>
        </div>
      </header>
      <div class="margin-vert-small">
        <div>
          {{ $t("keywords") }}
        </div>
        <div v-if="all_keywords.length === 0">
          <i>{{ $t("none").toLowerCase() }}</i>
        </div>
        <div v-else class="m_keywordField">
          <button
            type="button"
            v-for="{ term, count } in all_keywords"
            :key="term"
            class="tag"
            :class="{
              'is--active': term === selected_keyword,
            }"
            @click="toggleKeyword(term)"
          >
            {{ term }}
            <span class="_tagCounter">{{ count }}</span>
          </button>
        </div>
      </div>
      <div class="margin-vert-small">
        <div>
          {{ $t("author") }}
        </div>

        <div v-if="!all_authors || all_authors.length === 0">
          <i>{{ $t("none").toLowerCase() }}</i>
        </div>
        <div v-else class="m_authorField">
          <button
            type="button"
            v-for="{ term: author_slug, count } in all_authors"
            v-if="$root.getAuthor(author_slug)"
            :key="author_slug"
            class="tag"
            :class="{
              'is--unselectable': author_slug !== selected_author,
              'is--active': author_slug === selected_author,
              'is--loggedInAuthor':
                $root.current_author &&
                $root.current_author.slugFolderName === author_slug,
            }"
            @click="toggleAuthor(author_slug)"
          >
            {{ $root.getAuthor(author_slug).name }}
            <span class="_tagCounter">{{ count }}</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
import AuthorsInput from "./subcomponents/AuthorsInput.vue";

export default {
  props: {
    medias: Array,
  },
  components: {
    AuthorsInput,
  },
  data() {
    return {
      selected_keyword: false,
      selected_author: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    selected_keyword: {
      handler() {
        this.$root.settings.media_keyword_filter = this.selected_keyword;
      },
      immediate: true,
    },
    selected_author: {
      handler() {
        this.$root.settings.media_author_filter = this.selected_author;
      },
      immediate: true,
    },
  },
  computed: {
    all_keywords() {
      return this.getAllAndCount({
        medias: this.medias,
        type: "keywords",
        prop_name: "title",
      });
    },
    all_authors() {
      return this.getAllAndCount({
        medias: this.medias,
        type: "authors",
        prop_name: "slugFolderName",
      });
    },
  },
  methods: {
    toggleKeyword(kw) {
      this.selected_keyword = this.selected_keyword === kw ? false : kw;
    },
    toggleAuthor(a) {
      this.selected_author = this.selected_author === a ? false : a;
    },
    getAllAndCount({ medias, type, prop_name }) {
      const kw_sorted = Object.values(medias).reduce((acc, m) => {
        if (m[type] && m[type].length > 0) {
          m[type].map(({ [prop_name]: val }) => {
            if (!val) return;
            const fit = acc.find((i) => i.term === val);
            if (fit) {
              fit.count = fit.count + 1;
            } else {
              acc.push({
                term: val,
                count: 1,
              });
            }
          });
        }
        return acc;
      }, []);

      return kw_sorted;
    },
  },
};
</script>
<style lang="scss" scoped>
.m_filtersview {
  position: relative;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  overflow-y: auto;
  // width: 100%;
  // height: 100%;

  // z-index: 100000;
  // top: 0;
  // right: 0;
  // max-width: 440px;
  // flex: 0 0 420px;

  height: 100%;
  overflow: auto;
  background-color: var(--c-noir);
  color: white;
  // box-shadow: -0.1em 0.2em 1em rgba(0, 0, 0, 0.2);

  // background-color: white;
  // border: 4px solid var(--c-noir);
  // margin: 2em;
  // padding: 1em;
  // padding-top: calc(var(--spacing) / 2);
  // padding-bottom: calc(var(--spacing) / 2);

  // border-radius: 8px;

  display: flex;
  flex-flow: column nowrap;

  button,
  label {
    color: var(--c-noir);
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
  position: absolute;

  svg {
    display: block;
    width: 33px;
    height: 33px;
    stroke: white;
  }
}

.m_filtersview--topbar {
  // padding-left: calc(var(--spacing) / 2);
  // padding-right: calc(var(--spacing) / 2);
  margin-bottom: 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}

.m_keywordField {
  display: flex;
  // padding-left: calc(var(--spacing) / 2);
  // padding-right: calc(var(--spacing) / 2);
}

._tagCounter {
  background: white;
  // margin: 0.5em;
  margin-left: 0.5em;
  // padding: 0.5em;
  min-width: 1.5em;
  height: 1.5em;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
