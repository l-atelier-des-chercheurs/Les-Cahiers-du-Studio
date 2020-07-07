<template>
  <div class="m_informations">
    <div class="m_informations--presentation">
      Cras mollis fermentum risus, imperdiet lacinia neque mollis a. Praesent
      eget quam metus. Integer pharetra, neque ac auctor suscipit, justo tortor
      hendrerit urna, tincidunt malesuada ligula risus in erat. Fusce volutpat
      nisi ipsum. Vestibulum varius lacus at ante scelerisque viverra. Quisque
      vulputate massa felis, non pulvinar ex sollicitudin id.
    </div>
    <div class="m_informations--buttons" v-if="!$root.current_author">
      <button
        type="button"
        @click="$root.showAuthorsListModal = true"
      >{{ $t("login").toLowerCase() }}</button>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
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
.m_informations {
  position: relative;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  background-color: var(--color-yellow);
  color: white;

  height: 100%;

  // padding-top: calc(var(--spacing) / 2);
  // padding-bottom: calc(var(--spacing) / 2);

  display: flex;
  flex-flow: column nowrap;

  button {
    color: var(--color-noir);
  }
}

.m_informations--presentation {
  overflow-y: auto;
  padding: var(--spacing);
  flex: 1 1 auto;
}

.m_informations--buttons {
  flex: 0 0 auto;

  display: flex;
  flex-flow: column nowrap;

  padding: calc(var(--spacing) / 2);
  background-color: #999;

  button {
    display: block;
    margin: calc(var(--spacing) / 2);
  }
}
</style>
