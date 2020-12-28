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

          <h3><span>Care</span></h3>

          <p class="f-compagnie">
            Michela Deni (PROJEKT)<br />
            Ruedi Baur (Integral designers)<br />
            Cécile Duval-Zack (AIA LifeDesigners)<br />
            Pierre Cloarec (ENSCI)<br />
            Sophie Larger et Vincent Lacoste
          </p>

          <p>
            <small>
              Alliance France Design, <br />
              11, rue Belzunce, Paris 09<br />
              Médiateurs : Silvia Dore et Michela Deni</small
            >
          </p>

          <h3><span>Territoires</span></h3>

          <p class="f-compagnie">
            Ludovic Duhem (ESAD Valenciennes)<br />
            Malte Martin (agrafmobile)<br />
            Émeline Lavocat (27e Région)<br />
            Yann Aucompte et Matthieu Marchal<br />
            Fanny Ehl - Doctorante à l’université Lyon 2 en géographie
          </p>

          <h3><span>Ressources</span></h3>

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

        <p>
          <small>
            Alliance France Design, <br />
            11, rue Belzunce, Paris 09<br />
            Médiateurs : Silvia Dore et Michela Deni</small
          >
        </p>

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

    <div class="m_informations--buttons" v-if="!$root.current_author && false">
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

    &::before {
      content: "";
      position: absolute;
      z-index: -1;
      width: 100%;
      height: 100%;
      padding: 0.8em 1.6em 1em;
      left: -1.6em;
      top: -0.9em;
      background-color: var(--color-rouge_vif);
      border-radius: 1.5em;
    }
  }
  &:first-of-type {
    span {
      transform: rotate(-10deg);
    }
  }
  &:nth-of-type(2) {
    span {
      transform: rotate(5deg);
    }
  }
  &:nth-of-type(3) {
    span {
      transform: rotate(-5deg);
    }
  }
}
</style>
