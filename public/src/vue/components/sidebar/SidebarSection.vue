<template>
  <section class="border border-bottom-dashed padding-medium">
    <header class="_sidebarSectionHeader">
      <slot name="header"></slot>
      <button
        type="button"
        class="button-verysmall border-circled button-thin button-wide padding-verysmall margin-none"
        v-if="!!$slots['body']"
        :class="{ 'is--active': is_open }"
        @click="is_open = !is_open"
        v-html="is_open ? $t('close') : $t('open')"
      />
    </header>

    <div class="margin-top-small" v-if="!!$slots['body'] && is_open">
      <slot name="body"></slot>
    </div>
  </section>
</template>
<script>
export default {
  props: {
    open_by_default: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      is_open: this.open_by_default ? true : false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._sidebarSectionHeader {
  display: flex;
  flex-flow: row wrap;

  > *:first-child {
    flex: 1 1 auto;
  }

  button {
    flex: 0 0 auto;
  }
}
</style>
