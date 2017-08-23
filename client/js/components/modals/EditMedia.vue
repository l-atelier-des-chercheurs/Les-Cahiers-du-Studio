<template>
  <Modal @close="$emit('close')">
    <div slot="header">
      Edit media <i>{{ slugMediaName }}</i>
    </div>

    <div slot="body" style="width: 300px;">
      <MediaContent
        :slugFolderName="slugFolderName"
        :slugMediaName="slugMediaName"
        :media="media"
        :size="1800"
      >
      </MediaContent>
    </div>

    <form slot="footer" v-on:submit.prevent="editThisMedia">

<!-- Creation date (stored in meta file, overrides file date) -->
      <div class="input-single">
        <label>Creation date</label>
        <DateTime v-model="mediadata.created">
        </DateTime>
      </div>

<!-- Type of media (if guessed wrong from filename, will only be stored in the meta file and used as a reference when displaying that media on the client) -->
      <div class="input-single">
        <label>Type</label>
        <select ref="type" v-model="mediadata.type">
          <option v-for="mediaType in ['image', 'video']">
            {{ mediaType }}
          </option>
        </select>
      </div>

<!-- Keywords -->
      <div class="input-single">
        <label>Keyword(s)</label><br>
        <small>one per line</small>
        <textarea v-model="mediadata.keywords">
        </textarea>
      </div>

<!-- Author(s) -->
      <div class="input-single">
        <label>Author(s)</label><br>
        <small>one per line</small>
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
        <a download :href="mediaURL" title="slugMediaName">
          Télécharger
        </a>
      </button>

      <div>
        <button class="modal-default-button button-success" type="submit">
          Update
        </button>
        <!-- pressing enter presses the first button… need fix to place this button somewhere else -->
        <button class="modal-default-button" @click="$emit('close')">
          Cancel
        </button>
      </div>

    </form>

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
        authors: this.media.authors,
        keywords: this.media.keywords,
        public: (this.media.public == 'true')
      },
      mediaURL: `/${this.slugFolderName}/${this.slugMediaName}`
    }
  },
  computed: {
  },
  methods: {
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
