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
      <div>
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

      <!-- <svg
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
        style="enable-background: new 0 0 960 277.15"
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
      </svg> -->

      <div class="m_informations--presentation--text">
        <template v-if="$root.lang.current === 'fr'">
          <h1>
            Fonts and Faces N°7 <br />

            Colloque international de typographie
          </h1>
          <h2>Text and confused</h2>
        </template>
        <template v-else>
          <h1>
            Fonts and Faces #7<br />
            International Type Symposium
          </h1>

          <h2>Text and confused</h2>
        </template>

        <br />

        <template v-if="$root.lang.current === 'fr'">
          <p>
            Lire un texte, acte qui se donne comme automatique une fois
            l’expérience acquise, nous livre l’accès au sens sémantique propagé
            par son auteur·trice. S’il y a automatisme, automatisation, c’est
            que la mécanique réside dans l’acte même d’encodage et de décodage
            de la lettre où le dessinateur / la dessinatrice de caractères a les
            clés — de lecture. Qu’il s’agisse de circonscrire l’écriture, de la
            perturber voire de s’affranchir du sens, leurs graphies brouillent
            la lecture jusqu’à la rendre impénétrable. Leurs créations, moins
            attachées à des formes conventionnelles, créent un schisme entre le
            sens et la forme et donnent le sentiment d’une volonté d’un texte
            insaisissable.
          </p>
        </template>
        <template v-else>
          <p>
            Read a text, an act that gives itself as automatic once the
            experience is acquired, gives us access to the semantic meaning
            propagated by its author. If there is automatism, automation, it is
            because the mechanics lie in the very act of encoding and decoding
            the letter, where the type designer has the keys to reading. Whether
            it is a question of circumscribing the writing, disturbing it or
            even freeing oneself from meaning, their spellings blur the reading
            to the point of making it impenetrable. Their creations, less
            attached to conventional forms, create a schism between meaning and
            form and give the feeling of a desire for an elusive text.
          </p>
        </template>

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
          <template v-else> more informations… </template>
        </button>

        <template v-if="show_detail">
          <template v-if="$root.lang.current === 'fr'">
            <p>
              Organisée au Campus Fonderie, cette journée d’étude interrogera
              des créateurs et des créatrices sur les questions
              d’intelligibilité d’un texte. Comment s’affranchissent-ils et
              elles de la question de la lisibilité et se focalisent-ils et
              elles sur des questions liées à l’imperméabilité de leurs
              caractères ? Nous tenterons de comprendre ce qui motive leur
              démarche, aussi multiple soit-elle et comment ces nouvelles formes
              de lettres se dégagent de toutes représentations connues.
            </p>
          </template>

          <template v-else>
            <p>
              Organized at the Campus Fonderie de l'Image, this event will
              question creators on the questions of intelligibility of a text.
              How do they free themselves from the question of legibility and
              focus on questions related to the impermeability of their
              characters?
            </p>
          </template>
        </template>

        <template v-if="$root.lang.current === 'fr'">
          <ul>
            <li>09h55<span class="_spacer" />iiintroduction</li>
            <li>10h00<span class="_spacer" />Brando Corradini</li>
            <li>11h00<span class="_spacer" />Toan Vu-Huu</li>
            <li>12h00<span class="_spacer" />Barry Spencer</li>
            <li>Pause</li>
            <li>14h30<span class="_spacer" />Ariane Dubois</li>
            <li>15h00<span class="_spacer" />Alexandra Aïn</li>
            <li>16h00<span class="_spacer" />Velvetyne Type Foundry</li>
            <li>
              Projets satellites
              <ul>
                <li>Grosso-Modo (avec Saber Zammouri)</li>
                <li>Sophie Cure</li>
                <li>Margot Mourrier-Sanyas</li>
              </ul>
            </li>
          </ul>
        </template>
        <template v-else>
          <ul>
            <li>09h55<span class="_spacer" />iiintroduction</li>
            <li>10h00<span class="_spacer" />Brando Corradini</li>
            <li>11h00<span class="_spacer" />Toan Vu-Huu</li>
            <li>12h00<span class="_spacer" />Barry Spencer</li>
            <li>Break</li>
            <li>14h30<span class="_spacer" />Ariane Dubois</li>
            <li>15h00<span class="_spacer" />Alexandra Aïn</li>
            <li>16h00<span class="_spacer" />Velvetyne Type Foundry</li>
            <li>
              Satellites Projects
              <ul>
                <li>Grosso-Modo (with Saber Zammouri)</li>
                <li>Sophie Cure</li>
                <li>Margot Mourrier-Sanyas</li>
              </ul>
            </li>
          </ul>
        </template>

        <p>
          #fontsandfaces →
          <a
            href="https://twitter.com/hashtag/fontsandfaces?src=hashtag_click"
            target="_blank"
          >
            twitter
          </a>
          <!-- <br />
          <a
            href="https://www.instagram.com/campus_fonderie_de_limage/"
            target="_blank"
          >
            instagram.com/campus_fonderie_de_limage
          </a>
          <br />
          <a href="https://twitter.com/campuslfi" target="_blank"
            >twitter.com/campuslfi</a
          >
          <br />
          <a
            href="https://facebook.com/campusfonderiedelimage/"
            target="_blank"
          >
            facebook.com/campusfonderiedelimage
          </a>
          -->
        </p>

        <!-- <small>
            Campus Fonderie de l’Image<br />80 rue Jules Ferry<br />93170
            Bagnolet
          </small> -->
      </div>

      <h2>
        <template v-if="$root.lang.current === 'fr'">
          Comment utiliser cet outil ?
        </template>
        <template v-else> How to use this website? </template>
      </h2>

      <ol class="margin-sides-medium">
        <li>
          <template v-if="$root.lang.current === 'fr'">
            Les contenus sont accessibles à tous, sans inscription.
          </template>
          <template v-else>
            All content is freely available to all ; there is no need to sign
            up.
          </template>
        </li>
        <li>
          <template v-if="$root.lang.current === 'fr'">
            Pour commenter, il suffit de s’enregistrer.
          </template>
          <template v-else>
            If you wish to comment, registration is easy.
          </template>
        </li>
        <!-- <li>
          <template v-if="$root.lang.current === 'fr'">
            Pour poster des contenus, faites une demande par mail à
            <a href="mailto:info@delure.org" target="_blank">
              info@delure.org
            </a>
          </template>
          <template v-else>
            To upload content, please send your request by email to
            <a href="mailto:info@delure.org" target="_blank">
              info@delure.org
            </a>
          </template>
        </li> -->
      </ol>

      <p>
        <template v-if="$root.lang.current === 'fr'"> </template>
        <template v-else> </template>
      </p>
      <p>
        <small>
          <template v-if="$root.lang.current === 'fr'">
            Besoin d’aide, des questions ? Envoyez un email à
            <a href="mailto:vfried@campusfonderiedelimage.org" target="_blank">
              vfried@campusfonderiedelimage.org
            </a>
          </template>
          <template v-else>
            Need help, questions? Send an email to
            <a href="mailto:vfried@campusfonderiedelimage.org" target="_blank">
              vfried@campusfonderiedelimage.org
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
            avec et pour les organisateurs du colloque Text and confused. Elle
            se base sur le logiciel libre et open-source
            <a
              href="https://latelier-des-chercheurs.fr/outils/les-cahiers-du-studio"
              target="_bank"
              >Les Cahiers du Studio</a
            >
            et sa variante développée pour les
            <a href="https://dailleurs.delure.org/" target="_blank"
              >Rencontres de Lure 2020</a
            >.</small
          >
        </template>
        <template v-else>
          <small>
            This website/platform was created and programed by
            <a href="https://latelier-des-chercheurs.fr/" target="_blank"
              >l’Atelier des chercheurs</a
            >
            with and for the organizers of Text and confused. It is based on the
            free software
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
  background-color: var(--color-yellow);
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

  h1,
  h2 {
    font-size: 4.5em;
    font-family: "CipherI Small", "Minimal", sans-serif;
    line-height: 0.5em;
  }
  ul {
    ul {
      margin-top: 0.5em;
    }
  }
}

.m_informations--presentation {
  overflow-y: auto;
  padding: var(--spacing);
  flex: 1 1 auto;
}

.m_informations--presentation--text {
  // text-align: center;
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

._unfold_button {
  background-color: var(--color-bleu_vif);
  font-size: 0.8em;
  padding: 0.3em;
}

ul {
  margin-left: 0;
  padding-left: 0;
  list-style-type: none;

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
</style>
