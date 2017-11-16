<template>
  <Modal
    :backgroundColor="mediadata.color"
    @close="$emit('close')"
    @submit="editThisMedia"
    >
    <template slot="header">
      <span class="text-cap"> Éditer le média&nbsp;:</span>
      <i>{{ slugMediaName }}</i>
    </template>

    <template slot="sidebar">
<!-- Creation date (stored in meta file, overrides file date) -->
      <div class="margin-bottom-small">
        <label>Date de création <small>(timeline)</small></label>
        <DateTime v-model="mediadata.created">
        </DateTime>
      </div>

<!-- Type of media (if guessed wrong from filename, will only be stored in the meta file and used as a reference when displaying that media on the client) -->
      <div class="margin-bottom-small">
        <label>Type&nbsp;:</label>
        <select ref="type" v-model="mediadata.type">
          <option v-for="mediaType in ['image', 'video', 'audio', 'text', 'marker']">
            {{ mediaType }}
          </option>
        </select>
      </div>

<!-- Color -->
      <div class="margin-bottom-small">
        <label>Couleur&nbsp;:</label>
        <select ref="type" v-model="mediadata.color">
          <option v-for="mediaColor in ['white', 'red', 'blue', 'green', 'purple', 'orange', 'yellow']">
            {{ mediaColor }}
          </option>
        </select>
        </textarea>
      </div>

<!-- Keywords -->
      <div class="margin-bottom-small">
        <label>Mot-clé(s)&nbsp;:<small>un par ligne</small></label><br>
        <textarea v-model="mediadata.keywords">
        </textarea>
      </div>

<!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>Auteur-e(s)&nbsp;:<small>un-e par ligne</small></label><br>
        <textarea v-model="mediadata.authors">
        </textarea>
      </div>

<!-- Public or private -->
      <div class="margin-bottom-small">
        <span class="switch">
          <input type="checkbox" class="switch" id="publicswitch" v-model="mediadata.public">
          <label for="publicswitch">
            Public
          </label>
        </span>
      </div>

      <div class="m_modal--buttonrow flex-wrap flex-vertically-start flex-horizontally-start">
        <button type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
          @click="removeMedia()"
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
            <title>Fichier 8</title>
            <g id="Calque_2" data-name="Calque 2">
              <g id="Editeur_txt" data-name="Editeur txt">
                <g>
                  <g>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d"/>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                  <g>
                    <path d="M16.79,35.19l-.72-16.86H33l-.72,16.86a1.42,1.42,0,0,1-1.46,1.31H18.25A1.42,1.42,0,0,1,16.79,35.19Z" style="fill: #4d4d4d;stroke: #fff;stroke-miterlimit: 10"/>
                    <path d="M20.83,15.41v-2a.89.89,0,0,1,.92-.86h5.52a.89.89,0,0,1,.92.86v2Z" style="fill: #4d4d4d;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="20.75" y1="34.18" x2="20.75" y2="21.01" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="24.66" y1="34.18" x2="24.66" y2="21.01" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="28.58" y1="34.18" x2="28.58" y2="21.01" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="14" y1="15.41" x2="35" y2="15.41" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                </g>
              </g>
            </g>
          </svg>

          <span class="text-cap font-verysmall">
            Supprimer
          </span>
        </button>

        <button type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
          @click.prevent="printMedia()"
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
            <g id="Calque_2" data-name="Calque 2">
              <g id="Editeur_txt" data-name="Editeur txt">
                <g>
                  <g>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d"/>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                  <g>
                    <rect x="12.5" y="18.57" width="24" height="12.78" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <polyline points="16.83 18.57 16.83 15.54 20.38 12.03 32.17 12.03 32.17 18.57" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <rect x="16.83" y="25.95" width="15.33" height="10.08" style="fill: #4d4d4d;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="19.12" y1="29.29" x2="29.53" y2="29.29" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="19.12" y1="32.17" x2="29.53" y2="32.17" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="14.11" y1="25.95" x2="34.86" y2="25.95" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <ellipse cx="32.37" cy="22.15" rx="0.75" ry="0.74" style="fill: #fff;stroke: #fff;stroke-miterlimit: 10"/>
                    <polyline points="20.02 11.99 20.02 15.49 16.52 15.49" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                </g>
              </g>
            </g>
          </svg>
          <span class="text-cap font-verysmall">
            Imprimer
          </span>
        </button>

        <button type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
          >
          <a :href="mediaURL" title="slugMediaName" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
              <title>Fichier 10</title>
              <g id="Calque_2" data-name="Calque 2">
                <g id="Editeur_txt" data-name="Editeur txt">
                  <g>
                    <g>
                      <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d"/>
                      <circle cx="24.5" cy="24.5" r="24" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    </g>
                    <circle cx="28.41" cy="20.96" r="8.75" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <circle cx="28.41" cy="20.96" r="8.75" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <rect x="12.37" y="30.04" width="11.71" height="2.65" transform="translate(-16.84 22.08) rotate(-45)" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="28.64" y1="16.82" x2="28.64" y2="25.21" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="24.45" y1="21.02" x2="32.84" y2="21.02" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                </g>
              </g>
            </svg>
            <span class="text-cap font-verysmall">
              Zoom
            </span>
          </a>
        </button>

        <button type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
        >
          <a :download="slugMediaName" :href="mediaURL" title="slugMediaName" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
              <g id="Calque_2" data-name="Calque 2">
                <g id="Editeur_txt" data-name="Editeur txt">
                  <g>
                    <g>
                      <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d"/>
                      <circle cx="24.5" cy="24.5" r="24" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    </g>
                    <g>
                      <polyline points="33.12 20.63 24.5 28.82 15.88 20.63" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                      <line x1="24.5" y1="28.82" x2="24.5" y2="12.53" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    </g>
                    <line x1="13.26" y1="34.05" x2="35.74" y2="34.05" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                </g>
              </g>
            </svg>
            <span class="text-cap font-verysmall">
              Télécharger
            </span>
          </a>
        </button>
      </div>

    </template>

    <template slot="submit_button">
      Enregistrer
    </template>

    <template slot="preview">
      <MediaContent
        :slugMediaName="slugMediaName"
        :media="media"
        :mediaURL="mediaURL"
        v-model="mediadata.content"
      >
      </MediaContent>
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import alertify from 'alertify.js';
import MediaContent from '../subcomponents/MediaContent.vue';
import DateTime from '../subcomponents/DateTime.vue';

// creation
// type
// keywords
// authors
// public/private

export default {
  props: ['slugFolderName', 'slugMediaName', 'media'],
  components: {
    Modal,
    DateTime,
    MediaContent
  },
  data() {
    return {
      mediadata: {
        created: this.media.created,
        type: this.media.type,
        color: this.media.color,
        authors: this.media.authors,
        keywords: this.media.keywords,
        public: (this.media.public == 'true'),
        content: this.media.content
      },
      mediaURL: `/${this.slugFolderName}/${this.slugMediaName}`
    }
  },
  computed: {
  },
  methods: {
    printMedia: function() {
      window.print();
    },
    openMediaNewWindow: function() {
    },
    removeMedia: function() {
      if(window.confirm(locals.lang.modal.sureToRemoveMedia)) {
        this.$root.removeMedia(this.slugFolderName, this.slugMediaName);
        // then close that popover
        this.$emit('close', '');
      }
    },
    editThisMedia: function (event) {
      console.log('editThisMedia');

      // copy all values
      let values = this.mediadata;
      values.slugFolderName = this.slugFolderName;
      values.slugMediaName = this.slugMediaName;

      // if it's all good, collect everything and send over socketio
      this.$root.editMedia(values);

      // then close that popover
      this.$emit('close', '');
    }
  },
  mounted() {
  }
}

</script>
<style>
.two-column {
  column-count: 2;
  column-gap: 1rem;
}

@media (max-width: 50rem) {
  .two-column {
    column-count: 1;
    column-gap: 0;
  }
}
</style>
