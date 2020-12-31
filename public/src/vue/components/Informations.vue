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
      <div v-if="false">
        <label>
          <!-- <h3 class="margin-none text-cap with-bullet">{{ $t("lang") }}</h3> -->
          <select v-model="currentLang" style="max-width: 11ch">
            <option
              v-for="(name, code) in $root.lang.available"
              :value="code"
              :key="code"
            >
              {{ name }}
            </option>
          </select>
        </label>
      </div>

      <div class="m_informations--presentation--text">
        <template v-if="$root.lang.current === 'fr'">
          <h1>
            <img
              src="/images/logo-afd.svg"
              width="200"
              alt="Logo point commun."
            />
          </h1>
        </template>

        <br />

        <h2>créer du lien par le design</h2>

        <template v-if="$root.lang.current === 'fr'">
          <p>
            Soucieux de donner la parole aux designers favorisant du bien
            commun, Silvia Dore organise en binôme avec Romain Diant
            l’exposition « Point Commun ». Rendez-vous annuel orchestré par
            l’Alliance France Design, « Point Commun » permet de questionner la
            position du designer dans la société, ce dans un monde remis en
            question par une pandémie sans commune mesure, et d’ouvrir le
            dialogue au delàs de la sphère des designers.
          </p>

          <blockquote class="t-indent">
            Ouvrons le débat, partageons nos idées et nos projets, créons à
            partir de nos pluralités des futurs communs.
          </blockquote>
        </template>

        <div class="t-indent">
          <button
            type="button"
            class="_unfold_button"
            :class="{ 'is--active': show_detail }"
            @click="show_detail = !show_detail"
          >
            <template v-if="!show_detail">►</template>
            <template v-else>▼</template>
            <template v-if="$root.lang.current === 'fr'">
              plus d’informations…
            </template>
            <template v-else>more informations… </template>
          </button>

          <p v-if="show_detail">
            <template v-if="$root.lang.current === 'fr'">
              Sur une initiative de Silvia Dore, co-organisation avec Romain
              Diant.
            </template>
            <template v-else> </template>
          </p>

          <h3>
            <span
              >Care
              <svg
                class="_picto-bg"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width="94.6px"
                height="33.9px"
                viewBox="0 0 94.6 33.9"
                style="overflow: visible; enable-background: new 0 0 94.6 33.9"
                xml:space="preserve"
              >
                <path
                  class="st0"
                  style="fill: #059cf5"
                  d="M82.7,33.9c6.9,0,11.9-5.1,11.9-11.8c0-4.3-2.3-8.1-5.8-10.3C86.9,10.7,47.3,0,47.3,0S7.7,10.8,5.8,12
	C2.3,14.1,0,17.9,0,22.2c0,6.7,5.2,11.6,12,11.6L82.7,33.9z"
                />
              </svg>
            </span>
          </h3>

          <p class="f-compagnie">
            Michela Deni (PROJEKT)<br />
            Ruedi Baur (Integral designers)<br />
            Cécile Duval-Zack (AIA LifeDesigners)<br />
            Pierre Cloarec (ENSCI)<br />
            Sophie Larger et Vincent Lacoste
          </p>

          <h3>
            <span>Territoires </span>
          </h3>

          <p class="f-compagnie">
            Ludovic Duhem (ESAD Valenciennes)<br />
            Malte Martin (agrafmobile)<br />
            Émeline Lavocat (27e Région)<br />
            Yann Aucompte et Matthieu Marchal<br />
            Fanny Ehl - Doctorante à l’université Lyon 2 en géographie
          </p>

          <h3>
            <span
              >Ressources
              <svg
                class="_picto-bg"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width="111px"
                height="44.9px"
                viewBox="0 0 111 44.9"
                style="overflow: visible; enable-background: new 0 0 111 44.9"
                xml:space="preserve"
              >
                <path
                  style="fill: #059cf5"
                  d="M111,21.5L94.5,0c0,0-19.4,7.3-39,7.3S16.6,0,16.6,0L0,21.5l16.6,23.4c8.4-5.2,22.3-9,38.9-9
	c16.6,0,30.6,3.8,39,9L111,21.5z"
                />
              </svg>
            </span>
          </h3>

          <p class="f-compagnie">
            Florian Dach et Dimitri Zephir (dach&zephir / Éloj Kréyol) <br />
            et Sophie Krier (Field Essays/Plateforme “art, design et société”
            EnsadLab)<br />
            Christophe Tincelin et Nicolas Chauveau (Entreautre)<br />
            Flora Koel et Alexandre Echasseriau<br />
            Miren Lasnier (ENSCI)
          </p>
        </div>

        <img src="/images/schema-afd.svg" width="200" />

        <h2>Merci à tous ceux qui nous soutiennent</h2>
        <img src="/images/logos-afd.svg" width="200" />

        <div class="_signature">
          <p>
            Alliance France Design, <br />
            11, rue Belzunce, Paris 09
          </p>
          <div class="_picto_sociaux">
            <a
              href="https://www.facebook.com/ExpositionPointCommun"
              target="_blank"
            >
              <svg class="svg-icon" viewBox="0 0 20 20">
                <path
                  fill="none"
                  d="M9.969,0.594c-5.195,0-9.406,4.211-9.406,9.406c0,5.195,4.211,9.406,9.406,9.406c5.195,0,9.406-4.211,9.406-9.406C19.375,4.805,15.164,0.594,9.969,0.594 M9.969,18.552c-4.723,0-8.551-3.829-8.551-8.552s3.829-8.551,8.551-8.551S18.521,5.277,18.521,10S14.691,18.552,9.969,18.552 M12.534,5.724H7.403c-0.944,0-1.71,0.766-1.71,1.71v5.131c0,0.944,0.766,1.71,1.71,1.71h5.131c0.944,0,1.71-0.766,1.71-1.71V7.435C14.244,6.49,13.479,5.724,12.534,5.724M11.679,7.007h1.283V8.29h-1.283V7.007z M9.969,8.29c0.944,0,1.71,0.766,1.71,1.71s-0.766,1.71-1.71,1.71s-1.71-0.766-1.71-1.71S9.024,8.29,9.969,8.29 M13.39,12.565c0,0.472-0.384,0.854-0.855,0.854H7.403c-0.472,0-0.855-0.383-0.855-0.854V9.573h0.898C7.423,9.712,7.403,9.854,7.403,10c0,1.417,1.149,2.565,2.565,2.565c1.416,0,2.565-1.148,2.565-2.565c0-0.146-0.02-0.288-0.043-0.427h0.898V12.565z"
                ></path></svg
            ></a>
            <a
              href="https://www.instagram.com/alliancefrancedesign"
              target="_blank"
            >
              <svg class="svg-icon" viewBox="0 0 20 20">
                <path
                  fill="none"
                  d="M14.467,6.707c-0.34,0.198-0.715,0.342-1.115,0.419c-0.318-0.335-0.775-0.545-1.279-0.545c-0.969,0-1.754,0.773-1.754,1.727c0,0.135,0.015,0.267,0.045,0.394C8.905,8.628,7.612,7.94,6.747,6.896C6.596,7.151,6.509,7.448,6.509,7.764c0,0.599,0.31,1.128,0.78,1.438C7.002,9.192,6.732,9.115,6.495,8.985c0,0.007,0,0.014,0,0.021c0,0.837,0.605,1.535,1.408,1.694c-0.147,0.04-0.302,0.06-0.462,0.06c-0.113,0-0.223-0.011-0.33-0.031c0.223,0.687,0.871,1.186,1.638,1.199c-0.6,0.464-1.356,0.739-2.179,0.739c-0.142,0-0.281-0.007-0.418-0.023c0.777,0.489,1.699,0.775,2.689,0.775c3.228,0,4.991-2.63,4.991-4.913c0-0.075-0.002-0.149-0.004-0.223c0.342-0.244,0.639-0.547,0.875-0.894c-0.316,0.137-0.652,0.23-1.008,0.272C14.057,7.448,14.336,7.11,14.467,6.707 M10,0.594c-5.195,0-9.406,4.211-9.406,9.406c0,5.195,4.211,9.406,9.406,9.406c5.196,0,9.407-4.211,9.407-9.406C19.406,4.805,15.195,0.594,10,0.594 M10,18.552c-4.723,0-8.551-3.829-8.551-8.552S5.277,1.449,10,1.449c4.723,0,8.551,3.829,8.551,8.551S14.723,18.552,10,18.552"
                ></path></svg
            ></a>
          </div>
        </div>

        <p>
          <small>
            <template v-if="$root.lang.current === 'fr'">
              Besoin d’aide, des questions ? Envoyez un email à
              <a
                href="mailto:r.diant@alliance-francaise-des-designers.org"
                target="_blank"
              >
                r.diant@alliance-francaise-des-designers.org
              </a>
            </template>
            <template v-else>
              Need help, questions? Send an email to
              <a
                href="mailto:r.diant@alliance-francaise-des-designers.org"
                target="_blank"
              >
                r.diant@alliance-francaise-des-designers.org
              </a>
            </template>
          </small>
          <br />
          <br />
          <template v-if="$root.lang.current === 'fr'">
            <small>
              Cette plate-forme a été créée et développée par
              <a href="https://latelier-des-chercheurs.fr/" target="_blank"
                >l’Atelier des chercheurs</a
              >
              avec et pour l’AFD. Elle se base sur le logiciel libre et
              open-source
              <a
                href="https://latelier-des-chercheurs.fr/outils/les-cahiers-du-studio"
                target="_bank"
              >
                Les Cahiers du Studio
              </a>
              et sa variante développée pour les
              <a href="https://dailleurs.delure.org/" target="_blank">
                Rencontres de Lure 2020 </a
              >.</small
            >
          </template>
          <template v-else>
            <small>
              This website/platform was created by
              <a href="https://latelier-des-chercheurs.fr/" target="_blank"
                >l’Atelier des chercheurs</a
              >
              with and for the organizers of Text and confused. It is based on
              the free software
              <a
                href="https://latelier-des-chercheurs.fr/en/tools/les-cahiers-du-studio"
                target="_bank"
                >The Studio's Notebooks/Les Cahiers du Studio</a
              >
              and its variant made for the
              <a href="https://dailleurs.delure.org/" target="_blank">
                Rencontres de Lure 2020</a
              >.
            </small>
          </template>

          <!-- <small>Crédits et technologies utilisées… </small> -->
        </p>
      </div>
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
      show_detail: false,
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

  // color: white;

  font-size: 1em;
  height: 100%;

  // padding-top: calc(var(--spacing) / 2);
  // padding-bottom: calc(var(--spacing) / 2);

  display: flex;
  flex-flow: column nowrap;

  button,
  input,
  select {
    color: currentColor;
    border: none;
  }

  button {
    background: transparent;
  }

  h1,
  h2 {
    font-size: 1.25em;
    font-weight: bold;
    margin-bottom: 0;
  }
  ul {
    ul {
      margin-top: 0.5em;
    }
  }

  h2 {
    margin-left: var(--spacing);
  }

  h1 {
    img {
      max-width: 300px;
    }
  }

  h2 + p {
    margin-top: 0;
  }
}

.m_informations--presentation {
  overflow-y: auto;
  padding: var(--spacing);
  flex: 1 1 auto;

  background: linear-gradient(#44b4f7, 25%, #fff);
  background-attachment: scroll, local;
}

.m_informations--presentation--text {
  // text-align: center;
  margin-left: 1em;
}

h1 {
}

.m_informations--buttons {
  flex: 0 0 auto;

  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  background-color: #fff;

  padding: calc(var(--spacing) / 4);
  align-items: center;
  // border-top: 2px solid var(--color-rouge_vif);
  // background-color: #999;
  button {
    display: block;
    margin: calc(var(--spacing) / 2);
    color: currentColor;
    background-color: #f9f9f9;

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

._unfold_button {
  background-color: var(--color-bleu_vif);
  font-size: 0.8em;
  padding: 0.3em;
}

._planning {
  margin-left: 0;
  padding-left: 0;
  list-style-type: none;

  ul {
    margin-left: 0;
    padding-left: 0;
    list-style-type: none;
  }

  li {
    margin-left: 0;
    padding-left: 0;

    ._spacer {
      padding-left: 3ch;
    }

    li {
      padding-left: 7.8ch;
    }
  }

  > li {
    // padding-left: 3ch;
  }
}

ol {
  margin-top: 3em;
}

blockquote {
  border-top: 2px solid var(--color-rouge_vif);
  font-weight: bold;
  font-size: 1.2em;
  margin-top: 1em;
  padding-top: 1em;
}

.t-indent {
  padding-left: var(--spacing);
}

h3 {
  font-family: "Compagnie II";
  color: white;
  margin: calc(var(--spacing) * 1) auto;
  font-size: 1.1em;
  letter-spacing: 0.04em;
  text-transform: lowercase;

  span {
    position: relative;
    z-index: 1;
    display: inline-block;
  }
  &:first-of-type {
    span {
      transform: rotate(-9deg);

      ._picto-bg {
        width: 130px;
        max-width: none;
        z-index: -1;
        height: 60px;
        margin: -23px -40px;
      }
    }
  }
  &:nth-of-type(2) {
    span {
      transform: rotate(5deg);
      margin-left: -8px;

      &::before {
        content: "";
        position: absolute;
        z-index: -1;
        width: 100%;
        height: 100%;
        padding: 0.6em 1em 0.8em;
        left: -1em;
        top: -0.9em;
        background-color: var(--color-rouge_vif);
      }
    }
  }
  &:nth-of-type(3) {
    span {
      margin-left: -12px;
      transform: rotate(-13.5deg);
      ._picto-bg {
        width: 140px;
        max-width: none;
        z-index: -1;
        height: 70px;
        margin: -24px -15px;
      }
    }
  }
}

._picto-bg {
  position: absolute;
  top: 0;
  left: 0;
}

._signature {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
._picto_sociaux {
  display: flex;

  > * {
    margin-right: calc(var(--spacing) / 4);
  }
}
</style>
