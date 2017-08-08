<template>
  <Modal @close="$emit('close')">
    <h3 slot="header">
      Edit media <i>{{ slugMediaName }}</i>
    </h3>

    <div style="width: 250px;">
      <MediaContent
        :slugFolderName="slugFolderName"
        :slugMediaName="index"
        :media="media"
      >
      </MediaContent>
    </div>

    <form slot="body" v-on:submit.prevent="editThisMedia">

<!-- Creation date (stored in meta file, overrides file date) -->
      <div>
        <label>Creation date</label>
        <div class="two-column">
          <p>
            <input type="date" v-model="mediadata.createddate">
          </p>
          <p>
            <input type="time" v-model="mediadata.createdtime">
          </p>
        </div>
      </div>

<!-- Type of media (if guessed wrong from filename, will only be stored in the meta file and used as a reference when displaying that media on the client) -->
      <div class="input-single">
        <select ref="type" v-model="mediadata.type">
          <option v-for="mediaType in ['image', 'video']">
            {{ mediaType }}
          </option>
        </select>
      </div>

<!-- Keywords -->
      <div class="input-single">
        <label>Keyword(s)</label><br>
        <small>One per line</small>
        <textarea v-model="mediadata.keywords">
        </textarea>
      </div>

<!-- Author(s) -->
      <div class="input-single">
        <label>Author(s)</label><br>
        <small>One per line</small>
        <textarea v-model="mediadata.authors">
        </textarea>
      </div>

<!-- Public or private -->
      <div class="input-single">
        <label>Public</label><br>
        <input type="checkbox" v-model="mediadata.public">
      </div>

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

    <div slot="footer">
    </div>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import moment from 'moment';
import alertify from 'alertify.js';
import MediaContent from '../subcomponents/MediaContent.vue';

// creation
// type
// keywords
// authors
// public/private

export default {
  props: ['slugFolderName', 'slugMediaName', 'media'],
  components: {
    Modal
  },
  data() {
    return {
      mediadata: {
        createddate: moment(this.media.created, 'YYYYMMDD_HHmmss').format('YYYY-MM-DD'),
        createdtime: moment(this.media.created, 'YYYYMMDD_HHmmss').format('HH:mm'),
        type: this.media.type,
        authors: this.media.authors,
        keywords: this.media.keywords,
        public: (this.media.public == 'true')
      }
    }
  },
  computed: {
  },
  methods: {
    editThisMedia: function (event) {
      console.log('editThisMedia');

      // copy all values
      let values = this.mediadata;

      values.created = values.createddate + 'T' + values.createdtime;
      delete values.createddate; delete values.createdtime;

      values.slugFolderName = this.slugFolderName;
      values.slugMediaName = this.slugMediaName;

      debugger;

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
