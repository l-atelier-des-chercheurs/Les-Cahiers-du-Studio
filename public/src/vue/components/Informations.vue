<template>
  <div class="m_informations">
    <button
      type="button"
      class="button-nostyle _close_button"
      @click="$emit('close')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 48 48"
      >
        <line x1="24" y1="24" x2="34.67" y2="34.67" />
        <line x1="24" y1="24" x2="34.67" y2="13.33" />
      </svg>
    </button>
    <div class="m_informations--presentation">
      <svg
        version="1.1"
        class="_logo"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        width="960px"
        height="277.15px"
        viewBox="0 0 960 277.15"
        style="enable-background: new 0 0 960 277.15;"
        xml:space="preserve"
      >
        <path
          class="st0"
          d="M405.03,177.2V51.59h-34.05v121.06c0,50.58-17.19,74.03-63.31,74.06c-46.12-0.03-63.31-23.48-63.31-74.06V51.59
	h-34.62v125.6c0,57.67,29.78,99.8,97.87,99.8C377.09,277,405.03,233.89,405.03,177.2z"
        />
        <g>
          <rect x="848.36" y="0.17" class="st0" width="111.64" height="29.85" />
          <rect
            x="848.36"
            y="244.56"
            class="st0"
            width="111.64"
            height="30.09"
          />
          <polygon
            class="st0"
            points="827.5,146.65 918.77,146.65 918.77,116.5 827.5,116.5 827.5,51.59 793.08,51.59 793.08,223.2 
		827.5,223.2 	"
          />
        </g>
        <path
          class="st0"
          d="M690.31,72.36c0-47.78-35.89-72.21-85.46-72.21h-30.18v29.9h21.84c45.53,0,59.49,21.86,59.49,46.24
	c0,24.71-19.22,41.54-31.24,47.11H552.9V51.59h-34.47V223.2h34.47v-69.7h57.66l53.36,121.16h40.89l-58.63-128.06
	C673.6,128.27,690.31,107.63,690.31,72.36z"
        />
        <g>
          <path class="st0" d="M55.81,244.67v30.15h102.51v-30.15H55.81z" />
          <rect y="51.59" class="st0" width="34.31" height="171.61" />
        </g>
      </svg>

      <div class="m_informations--presentation--text">
        <h1>Plate-forme de découverte et de partage …</h1>

        <p>
          Cras mollis fermentum risus, imperdiet lacinia neque mollis a.
          Praesent eget quam metus. Integer pharetra, neque ac auctor suscipit,
          justo tortor hendrerit urna, tincidunt malesuada ligula risus in erat.
          Fusce volutpat nisi ipsum. Vestibulum varius lacus at ante scelerisque
          viverra. Quisque vulputate massa felis, non pulvinar ex sollicitudin
          id.
        </p>
      </div>

      <div>
        <label>
          <h3 class="margin-none text-cap with-bullet">{{ $t("lang") }}</h3>
        </label>
        <select v-model="currentLang">
          <option
            v-for="(name, code) in $root.lang.available"
            :value="code"
            :key="code"
            >{{ name }}</option
          >
        </select>
      </div>

      <h2>
        Comment utiliser cet outil ?
      </h2>

      <ol class="margin-sides-medium">
        <li>Premier point</li>
        <li>
          Deuxième point
        </li>
        <li>Troisième point</li>
      </ol>

      <p>
        Utilisation des données et responsable de publication
      </p>
      <p>
        <small
          >Besoin d’aide, des questions ? Envoyez un email à
          <a href="mailto:info@delure.org" target="_blank">info@delure.org </a>
        </small>
        <small>Crédits et technologies utilisées… </small>
      </p>
    </div>

    <div class="m_informations--buttons" v-if="!$root.current_author">
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
  background-color: var(--color-yellow);
  color: white;

  font-size: 1.1em;
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

.m_informations--presentation--text {
  text-align: center;
}

.m_informations--buttons {
  flex: 0 0 auto;

  display: flex;
  flex-flow: column nowrap;
  align-items: center;

  padding: calc(var(--spacing) / 4);
  align-items: center;
  border-top: 2px solid rgba(0, 0, 0, 0.05);
  // background-color: #999;
  button {
    display: block;
    margin: calc(var(--spacing) / 2);
    background-color: var(--color-bleu_vif);
    color: currentColor;
    max-width: 23ch;
    padding: 5px 50px;
    min-height: 50px;
    border-radius: 25px;
    text-transform: uppercase;
    font-size: 1.5em;
  }
}

._logo {
  fill: white;
  max-width: 20ch;
  max-height: 14ch;
  margin: 0 auto;
}
._close_button {
  stroke: white;
  stroke-width: 2px;
  width: 44px;
  position: absolute;
  top: 0;
  right: 0;
}

ol {
  max-width: 350px;
  counter-reset: counter;
  list-style: none;
  padding-left: 0;
}
ol li {
  display: flex;
  align-items: center;
  margin: 0 0 1rem 0;
  counter-increment: counter;
  position: relative;
}
ol li::before {
  flex: 0 0 auto;
  content: "0" counter(counter);
  // color: #fcd000;
  font-size: 1rem;
  // font-weight: bold;
  // position: absolute;
  --size: 32px;
  // left: calc(-1 * var(--size) - 10px);
  // line-height: var(--size);
  width: var(--size);
  height: var(--size);
  // display: flex;
  align-items: center;
  // justify-content: center;
  line-height: 1.8;
  font-variant-numeric: tabular-nums;
  // top: 0;
  // transform: rotate(-10deg);
  background: var(--color-bleu_vif);
  border-radius: 50%;
  text-align: center;

  margin-right: 4px;
}
</style>
