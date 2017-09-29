<template>
  <BaseModal :size="'large'" @close="$emit('close')" >
    <div slot="header">
      Editer le media <i>{{ slugMediaName }}</i>

      <span>
        <button type="button" class="button_small" @click.prevent="printMedia">
          Imprimer
        </button>
      </span>
    </div>

    <div slot="body">
      <MediaContent
        :slugFolderName="slugFolderName"
        :slugMediaName="slugMediaName"
        :media="media"
        :size="1800"
        v-model="mediadata.content"
      >
      </MediaContent>
    </div>

    <form slot="footer" v-on:submit.prevent="editThisMedia">

<!-- Creation date (stored in meta file, overrides file date) -->
      <div class="input-single">
        <label>Date de création <small>utilisée pour le placement sur l’axe horizontal</small></label>
        <DateTime v-model="mediadata.created">
        </DateTime>
      </div>

<!-- Type of media (if guessed wrong from filename, will only be stored in the meta file and used as a reference when displaying that media on the client) -->
      <div class="input-single">
        <label>Type</label>
        <select ref="type" v-model="mediadata.type">
          <option v-for="mediaType in ['image', 'video', 'text', 'marker']">
            {{ mediaType }}
          </option>
        </select>
      </div>

<!-- Color -->
      <div class="input-single">
        <label>Couleur</label><br>
        <select ref="type" v-model="mediadata.color">
          <option v-for="mediaColor in ['white', 'red', 'blue', 'green']">
            {{ mediaColor }}
          </option>
        </select>
        </textarea>
      </div>

<!-- Keywords -->
      <div class="input-single">
        <label>Mot-clé(s) <small>un par ligne</small></label><br>
        <textarea v-model="mediadata.keywords">
        </textarea>
      </div>

<!-- Author(s) -->
      <div class="input-single">
        <label>Auteur-e(s) <small>un-e par ligne</small></label><br>

        <textarea v-model="mediadata.authors">
        </textarea>
      </div>

<!-- Public or private -->
      <div class="input-single">
        <span class="switch">
          <input type="checkbox" class="switch" id="publicswitch" v-model="mediadata.public">
          <label for="publicswitch">
            Public
          </label>
        </span>
      </div>

      <button type="button" class="button_small" @click="removeMedia()">
        Supprimer
      </button>

      <button type="button" class="button_small">
        <a :download="slugMediaName" :href="mediaURL" title="slugMediaName" target="_blank">
          Télécharger
        </a>
      </button>

      <div>
        <button type="submit" class="modal-default-button button-success c_bleu">
          Mettre à jour
        </button>
        <button type="button" class="modal-default-button" @click.prevent="$emit('close')">
          Annuler
        </button>
      </div>

    </form>

  </BaseModal>
</template>
<script>
import BaseModal from './BaseModal.vue';
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
    BaseModal,
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
