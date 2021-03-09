<template>
  <div
    class="m_metaField"
    @click="show_detail = !show_detail"
    v-if="date && is_valid"
  >
    <i>{{ $t(title) }}</i>
    <div>
      <template v-if="!show_detail"
        >{{ $root.formatDateToHuman(date) }}
      </template>
      <template v-else>{{ $root.formatDateToPrecise(date) }}</template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    date: String,
    show_detail_initially: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      show_detail: this.show_detail_initially,
      is_valid: this.$moment(this.date).isValid(),
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
<style lang="scss"></style>
