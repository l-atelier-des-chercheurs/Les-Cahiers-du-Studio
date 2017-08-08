<template>
  <Modal @close="$emit('close')">
    <h3 slot="header">
      Create a folder
    </h3>

    <form slot="body" v-on:submit.prevent="newFolder">

<!-- Human name -->
      <div class="input-single">
        <label>Name</label>
        <p>
          <input type="text" v-model="folderdata.name" required>
        </p>
      </div>

<!-- Start date -->
      <div>
        <label>Beginning</label>
        <div class="two-column">
          <DateTime v-model="folderdata.start">
          </DateTime>
        </div>
      </div>

<!-- End date -->
      <div>
        <label>End</label>
        <div class="two-column">
          <DateTime v-model="folderdata.end">
          </DateTime>
        </div>

      </div>

<!-- Password -->
      <div class="input-single">
        <label>Password</label><br>
        <input type="password" v-model="folderdata.password">
        <small>If there is one, only user with this password will be able to edit this folder</small>
      </div>

<!-- Author(s) -->
      <div class="input-single">
        <label>Author(s)</label><br>
        <small>One per line</small>
        <textarea v-model="folderdata.authors">
        </textarea>
      </div>

      <small>
        fields with a <sup>o</sup> are required<br>
        they can be edited at all time
      </small>

      <div>
        <button class="modal-default-button button-success" type="submit">
          Create
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
import DateTime from '../subcomponents/DateTime.vue';
import moment from 'moment';
import alertify from 'alertify.js';

export default {
  components: {
    Modal,
    DateTime
  },
  data() {
    return {
      folderdata: {
        name: '',
        start: moment(),
        end: '',
        password: '',
        authors: ''
      }
    }
  },
  computed: {
  },
  methods: {
    newFolder: function (event) {
      console.log('newFolder');

      function getAllFolderNames() {
        let allFoldersName = [];
        for (let slugFolderName in window.store.state.folders) {
          let foldersName = window.store.state.folders[slugFolderName].name;
          allFoldersName.push(foldersName);
        }
        return allFoldersName;
      }
      let allFoldersName = getAllFolderNames();

      // check if folder name (not slug) already exists
      if(allFoldersName.indexOf(this.folderdata.name) >= 0) {
        // invalidate if it does
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error('Folder name already exists. Please use another.')
          ;

        return false;
      }

      // copy all values
      let values = this.folderdata;
      values.slugFolderName = this.slugFolderName;

      // if it's all good, collect everything and send over socketio
      this.$root.createFolder(values);

      // then close that popover
      this.$emit('close', '');
    }
  },
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
