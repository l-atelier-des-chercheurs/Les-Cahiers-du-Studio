<template>
  <div class="m_authorField">
    <button
      v-for="author in allAuthorsExceptWhenReadOnly"
      type="button"
      :key="author.name"
      :class="{ 'is--active': authors.filter(a => a.name === author.name).length > 0 }"
      @click="!read_only ? toggleAuthorName(author.name) : ''"
      :disabled="read_only"
    >
      <span :style="`color: ${author.color}`">•</span>
      {{ author.name }}
    </button>
    <!-- <VueTagsInput
      v-model="tag"
      :placeholder="$t('add_authors')"
      :autocomplete-items="filteredKeyword"
      :tags="tags"
      @tags-changed="newTags => editTags(newTags)"
    />-->
  </div>
</template>
<script>
export default {
  props: {
    currentAuthors: [Array, String],
    allAuthors: Array,
    read_only: {
      type: Boolean,
      default: false
    }
  },
  components: {},
  data() {
    return {
      authors: Array.isArray(this.currentAuthors) ? this.currentAuthors : []
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},

  watch: {},
  computed: {
    allAuthorsExceptWhenReadOnly() {
      if (this.read_only) {
        return this.allAuthors.filter(a =>
          this.authors.map(a => a.name).includes(a.name)
        );
      } else {
        return this.allAuthors;
      }
    }
  },
  methods: {
    toggleAuthorName: function(authorName) {
      // authorName is already in authors, then remove it
      if (this.authors.filter(a => a.name === authorName).length > 0) {
        this.authors = this.authors.filter(a => a.name !== authorName);
      } else {
        this.authors.push({
          name: authorName
        });
      }
      debugger;
      this.$emit("authorsChanged", this.authors);
    }
  }
};
</script>
<style>
</style>