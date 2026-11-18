<template>
  <!-- /_ui: every shared style and component on one page, to see at once
  what a change of global CSS does (npm run debug-lr reloads it on each
  change). Only the global classes of assets/main.scss and the real
  components: what is seen here is what the app shows. A tool for
  developers, not linked from the app: its texts are not translated. -->
  <main class="m_ui limited-width">
    <header class="m_ui--header">
      <RouterLink :to="{ name: 'home' }" class="textLink font-small">
        ← {{ $t("back") }}
      </RouterLink>
      <h1 class="font-large">› <i>Interface</i></h1>
      <p class="font-small">
        Les classes partagées de <code>assets/main.scss</code> et les composants
        de base, tels que l’app les affiche.
      </p>
      <nav class="m_ui--nav font-small">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
        >
          {{ section.label }}
        </a>
      </nav>
    </header>

    <!-- COLORS -->
    <section id="colors" class="m_ui--section">
      <h2 class="m_ui--title text-cap">Couleurs</h2>
      <div class="m_ui--swatches">
        <div v-for="color in colors" :key="color" class="m_ui--swatch">
          <div
            class="m_ui--swatchColor"
            :style="{ background: `var(${color})` }"
          />
          <code>{{ color }}</code>
          <code class="m_ui--muted">{{ css_values[color] }}</code>
        </div>
      </div>
    </section>

    <!-- SPACING -->
    <section id="spacing" class="m_ui--section">
      <h2 class="m_ui--title text-cap">Espacements et rayons</h2>
      <div v-for="spacing in spacings" :key="spacing" class="m_ui--row">
        <div class="m_ui--bar" :style="{ width: `var(${spacing})` }" />
        <code>{{ spacing }}</code>
        <code class="m_ui--muted">{{ css_values[spacing] }}</code>
      </div>
      <div class="m_ui--row">
        <div class="m_ui--radius" style="border-radius: var(--radius-button)" />
        <code>--radius-button</code>
        <div class="m_ui--radius" style="border-radius: var(--radius-input)" />
        <code>--radius-input</code>
        <code class="m_ui--muted">
          --limited-width : {{ css_values["--limited-width"] }}
        </code>
      </div>
    </section>

    <!-- TYPOGRAPHY -->
    <section id="typography" class="m_ui--section">
      <h2 class="m_ui--title text-cap">Typographie</h2>

      <div class="m_ui--sample">
        <code>body · i · b · mark · code</code>
        <p>{{ lorem }}</p>
        <p>
          <i>Italique</i>, <b>gras</b>, <mark>surligné</mark>,
          <code>code</code>.
        </p>
      </div>

      <div class="m_ui--sample">
        <code>h1 · h2 · h3 · h4</code>
        <h1>Titre h1 · {{ short_text }}</h1>
        <h2>Titre h2 · {{ short_text }}</h2>
        <h3>Titre h3 · {{ short_text }}</h3>
        <h4>Titre h4 · {{ short_text }}</h4>
      </div>

      <div v-for="size in text_classes" :key="size" class="m_ui--sample">
        <code>.{{ size }}</code>
        <p :class="size">{{ short_text }}</p>
      </div>

      <div class="m_ui--sample">
        <code>small · .form-error</code>
        <small>Une aide sous un champ, en gris foncé.</small>
        <p class="form-error">Erreur : invalid_field</p>
      </div>

      <div class="m_ui--sample">
        <code>a · .textLink</code>
        <p>
          Un <a href="#typography">lien</a> dans un paragraphe, et un bouton qui
          se lit comme un
          <button type="button" class="textLink">mot souligné</button>.
        </p>
      </div>

      <div class="m_ui--sample">
        <code>ul · ol · blockquote · hr</code>
        <ul>
          <li>Une liste à puces</li>
        </ul>
        <ol>
          <li>Une liste numérotée</li>
        </ol>
        <blockquote>Une citation.</blockquote>
        <hr />
      </div>

      <div class="m_ui--sample">
        <code>.border-top-dashed · .border-bottom-dashed</code>
        <p class="border-top-dashed">Bordure pointillée en haut.</p>
        <p class="border-bottom-dashed">Bordure pointillée en bas.</p>
      </div>

      <div class="m_ui--sample">
        <code>.text-formatting</code>
        <div class="text-formatting">
          <h2>Présentation</h2>
          <p>Le texte de présentation de la page d’accueil.</p>
        </div>
      </div>
    </section>

    <!-- MARKDOWN -->
    <section id="markdown" class="m_ui--section">
      <h2 class="m_ui--title text-cap">Texte mis en forme</h2>
      <p class="font-small">
        Du Markdown, converti comme un média texte (<code>markdown.js</code>),
        dans <code>.markdown</code>, comme dans la fenêtre d’un média.
        Modifiable.
      </p>
      <div class="m_ui--columns">
        <textarea v-model="markdown" rows="18" aria-label="Markdown" />
        <!-- sanitised HTML (markdown.js) -->
        <div class="markdown" v-html="rendered_markdown" />
      </div>
    </section>

    <!-- BUTTONS -->
    <section id="buttons" class="m_ui--section">
      <h2 class="m_ui--title text-cap">Boutons</h2>

      <div class="m_ui--sample">
        <code>button · .button · :disabled</code>
        <div class="m_ui--row">
          <button type="button">Bouton</button>
          <a href="#buttons" class="button">Lien en bouton</a>
          <button type="button" disabled>Désactivé</button>
        </div>
      </div>

      <div class="m_ui--sample">
        <code>.button-round</code>
        <div class="m_ui--row">
          <button type="button" class="button-round m_ui--round">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <polyline points="35.48 13.74 22.2 36.41 12.81 25.55" />
            </svg>
            <span class="text-cap font-verysmall">Valider</span>
          </button>
          <button type="button" class="button-round m_ui--round">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <line x1="13.33" y1="13.33" x2="34.67" y2="34.67" />
              <line x1="13.33" y1="34.67" x2="34.67" y2="13.33" />
            </svg>
            <span class="text-cap font-verysmall">Fermer</span>
          </button>
          <button type="button" class="button-round m_ui--round" disabled>
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <line x1="24" y1="12" x2="24" y2="36" />
              <line x1="12" y1="24" x2="36" y2="24" />
            </svg>
            <span class="text-cap font-verysmall">Désactivé</span>
          </button>
        </div>
      </div>
    </section>

    <!-- FORMS -->
    <section id="forms" class="m_ui--section">
      <h2 class="m_ui--title text-cap">Formulaires</h2>
      <div class="m_ui--fields">
        <div v-for="type in input_types" :key="type">
          <label :for="`ui_${type}`">input type="{{ type }}"</label>
          <input :id="`ui_${type}`" :type="type" :placeholder="type" />
        </div>
        <div>
          <label for="ui_required">required</label>
          <input id="ui_required" type="text" required />
          <small>Le point rouge signale un champ obligatoire.</small>
        </div>
        <div>
          <label for="ui_disabled">disabled</label>
          <input id="ui_disabled" type="text" value="Non modifiable" disabled />
        </div>
        <div>
          <label for="ui_readonly">readonly</label>
          <input id="ui_readonly" type="text" value="Lecture seule" readonly />
        </div>
        <div>
          <label for="ui_select">select</label>
          <select id="ui_select">
            <option value="" disabled selected>Choisir…</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
        <div>
          <label for="ui_multiple">select multiple</label>
          <select id="ui_multiple" multiple size="3">
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
        </div>
        <div>
          <label for="ui_textarea">textarea</label>
          <textarea id="ui_textarea" v-model="short_text" rows="3" />
        </div>
        <div>
          <label><input type="checkbox" checked /> input type="checkbox"</label>
          <label
            ><input type="radio" name="ui_radio" checked /> input
            type="radio"</label
          >
          <label
            ><input type="radio" name="ui_radio" /> input type="radio"</label
          >
        </div>
        <div>
          <label for="ui_range">input type="range"</label>
          <input id="ui_range" type="range" />
        </div>
        <div>
          <label for="ui_color">input type="color"</label>
          <input id="ui_color" type="color" value="#22b573" />
        </div>
        <div>
          <label for="ui_file">input type="file"</label>
          <input id="ui_file" type="file" />
        </div>
        <div>
          <label for="ui_progress">progress</label>
          <progress id="ui_progress" max="100" value="60" />
        </div>
      </div>
    </section>

    <!-- MODALS -->
    <section id="modals" class="m_ui--section">
      <h2 class="m_ui--title text-cap">Modales</h2>
      <p class="font-small">
        <code>BaseModal</code>, avec tous les types de champs
        (<code>.m_modal--field</code>, <code>.m_modal--box</code>,
        <code>.m_modal--check</code>), et la fenêtre d’un média.
      </p>
      <div class="m_ui--row">
        <button type="button" class="textLink" @click="modal = 'normal'">
          Modale
        </button>
        <button type="button" class="textLink" @click="modal = 'wide'">
          Large (wide)
        </button>
        <button type="button" class="textLink" @click="modal = 'preview'">
          Avec aperçu
        </button>
        <button type="button" class="textLink" @click="modal = 'disabled'">
          Bouton désactivé
        </button>
        <button type="button" class="textLink" @click="modal = 'media'">
          Média (lecture seule)
        </button>
      </div>
    </section>

    <!-- MEDIAS -->
    <section id="medias" class="m_ui--section">
      <h2 class="m_ui--title text-cap">Vignettes de médias</h2>
      <p class="font-small">
        <code>MediaTile</code>, avec des médias d’exemple, sans fichier.
      </p>
      <ul class="m_ui--tiles">
        <li v-for="media in sample_medias" :key="media.$path">
          <MediaTile :media="media" />
        </li>
      </ul>
    </section>

    <MediaModal
      v-if="modal === 'media'"
      :media="sample_medias[0]"
      @close="modal = ''"
    />
    <BaseModal
      v-else-if="modal"
      :wide="modal === 'wide'"
      :disabled="modal === 'disabled'"
      @close="modal = ''"
      @submit="modal = ''"
    >
      <template #header>Titre de la modale</template>

      <template v-if="modal === 'preview'" #preview>
        <div class="m_ui--preview">Aperçu</div>
      </template>

      <div class="m_modal--field">
        <label for="ui_modal_title">Titre</label>
        <input id="ui_modal_title" type="text" required />
      </div>
      <div class="m_modal--field">
        <label for="ui_modal_select">Liste</label>
        <select id="ui_modal_select">
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
      </div>
      <div class="m_modal--field">
        <label for="ui_modal_text">Texte</label>
        <textarea id="ui_modal_text" rows="3" />
        <small>Une aide sous le champ.</small>
      </div>
      <div class="m_modal--field">
        <label>Dans une boîte</label>
        <div class="m_modal--box">
          <label class="m_modal--check">
            <input type="checkbox" checked />
            Privé
          </label>
          <small>Seuls ses contributeurs pourront voir ce cahier.</small>
        </div>
      </div>
      <p class="m_modal--field font-small">Un paragraphe en petit.</p>
      <p class="m_modal--field form-error">Erreur : invalid_field</p>

      <template #submit_button>Valider</template>
    </BaseModal>
  </main>
</template>

<script>
import { renderMarkdown } from "@/markdown";
import BaseModal from "@/components/BaseModal.vue";
import MediaModal from "@/components/MediaModal.vue";
import MediaTile from "@/components/MediaTile.vue";

const NOW = new Date().toISOString();
// a media without file, for the tiles and the media's window
const sample = (name, meta) => ({
  $path: `_ui/exemple/${name}.meta.txt`,
  $date_created: NOW,
  $date_uploaded: NOW,
  date_timeline: NOW,
  $authors: ["authors/louis"],
  ...meta,
});

export default {
  components: { BaseModal, MediaModal, MediaTile },
  data() {
    return {
      sections: [
        { id: "colors", label: "Couleurs" },
        { id: "spacing", label: "Espacements" },
        { id: "typography", label: "Typographie" },
        { id: "markdown", label: "Texte mis en forme" },
        { id: "buttons", label: "Boutons" },
        { id: "forms", label: "Formulaires" },
        { id: "modals", label: "Modales" },
        { id: "medias", label: "Médias" },
      ],
      colors: [
        "--c-noir",
        "--c-noir_light",
        "--c-gris_fonce",
        "--c-gris",
        "--c-gris_clair",
        "--c-gris_tresclair",
        "--c-blanc",
        "--c-bg",
        "--c-border",
        "--c-vert_vif",
        "--c-rouge",
      ],
      spacings: ["--spacing-verysmall", "--spacing-small", "--spacing-medium"],
      text_classes: ["font-large", "font-small", "font-verysmall", "text-cap"],
      input_types: [
        "text",
        "password",
        "email",
        "number",
        "url",
        "search",
        "tel",
        "date",
        "time",
        "datetime-local",
      ],
      // read once mounted, from the stylesheet
      css_values: {},
      short_text: "Capturer, annoter et publier des médias — 0123456789",
      lorem:
        "Les Cahiers du Studio est une application de capture, d’annotation et de publication de médias (photos, textes, vidéos, sons) conçue en particulier pour les temps de résidence dans un lieu de création théâtrale. « Guillemets », apostrophe’s, tiret — et points de suspension…",
      markdown: `## Un intertitre

Un paragraphe avec du **gras**, de l’*italique*, du \`code\` et un [lien](https://example.org).
Un retour à la ligne simple.

Un deuxième paragraphe.

- une liste
- à puces
  - imbriquée

1. une liste
2. numérotée

> Une citation.

---

### Un titre de niveau 3`,
      sample_medias: [
        sample("texte", {
          $type: "text",
          caption: "Notes de répétition",
          $content:
            "# Lundi\n\nLecture à la table, puis premier filage de la scène 3.",
        }),
        sample("repere", { $type: "marker", caption: "Début du filage" }),
        sample("lien", {
          $type: "url",
          $content: "https://www.example.org/article",
          $authors: ["authors/pauline"],
        }),
        sample("texte-vide", {
          $type: "text",
          $content: "",
          $authors: ["authors/elise"],
        }),
        sample("partition", {
          $type: "other",
          $media_filename: "partition.mscz",
          caption: "Partition de la chanson",
        }),
      ],
      modal: "",
    };
  },
  computed: {
    rendered_markdown() {
      return renderMarkdown(this.markdown);
    },
  },
  mounted() {
    const style = getComputedStyle(document.documentElement);
    this.css_values = Object.fromEntries(
      [...this.colors, ...this.spacings, "--limited-width"].map((name) => [
        name,
        style.getPropertyValue(name).trim(),
      ])
    );
  },
};
</script>

<style lang="scss" scoped>
// only the layout of this page: the samples keep the global styles
.m_ui {
  padding: var(--spacing-medium);
}

.m_ui--header {
  margin-bottom: var(--spacing-medium);

  p {
    margin: var(--spacing-verysmall) 0 var(--spacing-small);
  }
}

.m_ui--nav {
  display: flex;
  flex-flow: row wrap;
  gap: var(--spacing-small);
}

.m_ui--section {
  padding: var(--spacing-medium) 0;
  border-top: 1px solid var(--c-gris_clair);
}

.m_ui--title {
  margin-bottom: var(--spacing-small);
  font-size: var(--font-size-verysmall);
  color: var(--c-gris_fonce);
}

// the name of the class or element shown, above each sample
.m_ui--sample {
  margin-bottom: var(--spacing-medium);

  > code {
    display: block;
    margin-bottom: var(--spacing-verysmall);
  }
}

code {
  font-family: monospace;
  font-size: var(--font-size-verysmall);
  color: var(--c-gris_fonce);
}

.m_ui--muted {
  color: var(--c-gris);
}

.m_ui--row {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: var(--spacing-small);
  margin-bottom: var(--spacing-small);
}

.m_ui--swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: var(--spacing-small);
}

.m_ui--swatch {
  display: flex;
  flex-flow: column nowrap;
}

.m_ui--swatchColor {
  height: 3rem;
  margin-bottom: var(--spacing-verysmall);
  border: 1px solid var(--c-gris_clair);
  border-radius: var(--radius-input);
}

.m_ui--bar {
  height: 1rem;
  background-color: var(--c-noir);
}

.m_ui--radius {
  width: 3rem;
  height: 2rem;
  border: 1px solid var(--c-noir);
}

.m_ui--columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
  gap: var(--spacing-medium);
  align-items: start;
}

.m_ui--fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
  gap: var(--spacing-medium);

  label:has(input[type="checkbox"], input[type="radio"]) {
    display: flex;
    align-items: center;
  }
}

// the round buttons' strokes, as on the home page
.m_ui--round svg {
  fill: none;
  stroke: #333;
  stroke-miterlimit: 10;
  stroke-width: 2px;
}

.m_ui--tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(11rem, 40vw), 1fr));
  gap: var(--spacing-small);
  margin: 0;
  padding: 0;
  list-style: none;
}

.m_ui--preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--c-gris);
}
</style>
