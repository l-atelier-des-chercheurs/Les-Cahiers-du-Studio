<template>
  <div class="m_informations">
    <div class="m_informations--presentation">
      Cras mollis fermentum risus, imperdiet lacinia neque mollis a. Praesent
      eget quam metus. Integer pharetra, neque ac auctor suscipit, justo tortor
      hendrerit urna, tincidunt malesuada ligula risus in erat. Fusce volutpat
      nisi ipsum. Vestibulum varius lacus at ante scelerisque viverra. Quisque
      vulputate massa felis, non pulvinar ex sollicitudin id.
    </div>
    <div>
      <select v-model="currentLang">
        <option
          v-for="(name, code) in $root.lang.available"
          :value="code"
          :key="code"
          >{{ name }}</option
        >
      </select>
    </div>

    <div
      class="m_informations--buttons"
      v-if="!$root.current_author && $root.state.mode !== 'export_publication'"
    >
      <button type="button" @click="$root.showAuthorsListModal = true">
        {{ $t("login").toLowerCase() }}
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      currentLang: this.$root.lang.current,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    currentLang: function () {
      this.$root.updateLocalLang(this.currentLang);
    },
  },
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
.m_informations {
  position: relative;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  background-color: var(--color-noir);
  color: white;

  height: 100%;

  // padding-top: calc(var(--spacing) / 2);
  // padding-bottom: calc(var(--spacing) / 2);

  display: flex;
  flex-flow: column nowrap;

  button,
  input,
  select {
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
  align-items: center;

  padding: calc(var(--spacing) / 2);
  // background-color: white;

  button {
    display: block;
    margin: calc(var(--spacing) / 2);
    padding: calc(var(--spacing) / 2);
    background-color: white;
  }
}
</style>
