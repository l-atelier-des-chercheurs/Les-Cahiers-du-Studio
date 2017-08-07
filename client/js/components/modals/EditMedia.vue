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
      <div class="input-single">
        <label>Creation date</label>
        <p>
          <input type="text" ref="name" required>
        </p>
      </div>

<!-- Type of media (if guessed wrong from filename, will only be stored in the meta file and used as a reference when displaying that media on the client) -->

<!-- Keywords (separated with a comma) -->

<!-- Author(s) -->

<!-- Public or private -->


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

export default {
  props: ['slugFolderName', 'slugMediaName', 'media'],
  components: {
    Modal
  },
  data() {
    return {
    }
  },
  computed: {
  },
  methods: {
    editThisMedia: function (event) {
      console.log('editThisMedia');

      // check if required are filled
      let values = {
        name: this.$refs.name.value.trim(),
        start: this.$refs.startdate.value + 'T' + this.$refs.starttime.value,
        end: this.$refs.enddate !== undefined ? (this.$refs.enddate.value + 'T' + this.$refs.endtime.value) : '',
        password: this.$refs.password.value.trim(),
        authors: this.$refs.authors.value,
      }

      let thisFolderName = this.folder.name;
      function getAllFolderNames() {
        let allFoldersName = [];
        for (let slugFolderName in window.store.state.folders) {
          let foldersName = window.store.state.folders[slugFolderName].name;
          if(foldersName !== thisFolderName) {
            allFoldersName.push(foldersName);
          }
        }
        return allFoldersName;
      }
      let allFoldersName = getAllFolderNames();

      // check if folder name (not slug) already exists
      if(allFoldersName.indexOf(values.name) >= 0) {
        // invalidate if it does
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error('Folder name already exists. Please use another.')
          ;

        return false;
      }

      values.slugFolderName = this.slugFolderName;

      // if it's all good, collect everything and send over socketio
      this.$root.editFolder(values);

      // then close that popover
      this.$emit('close', '');
    }
  },
  mounted() {
    this.$refs.name.value = this.folder.name;
    // TODO : separate start and end date into date and time fields
    if(this.folder.start) {
      // cut a date such as 20170701_140000 to 2017-07-01 and 14:00
      this.$refs.startdate.value = moment(this.folder.start, 'YYYYMMDD_HHmmss').format('YYYY-MM-DD');
      this.$refs.starttime.value = moment(this.folder.start, 'YYYYMMDD_HHmmss').format('HH:mm');
    }
/*
        start: this.$refs.startdate.value + 'T' + this.$refs.starttime.value,
        end: this.$refs.enddate !== undefined ? (this.$refs.enddate.value + 'T' + this.$refs.endtime.value) : '',
*/

    if(this.folder.authors) {
      this.$refs.authors.value = this.folder.authors;
    }
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
