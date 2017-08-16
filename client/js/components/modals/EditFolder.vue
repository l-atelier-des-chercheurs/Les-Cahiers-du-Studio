<template>
  <Modal @close="$emit('close')">
    <h3 slot="header">
      Edit a folder
    </h3>

    <form slot="body" v-on:submit.prevent="editThisFolder">

<!-- Human name -->
      <div class="input-single">
        <label>Name</label>
        <input type="text" v-model="folderdata.name" required>
      </div>

<!-- Start date -->
      <div class="input-single">
        <label>Beginning</label>
        <DateTime v-model="folderdata.start">
        </DateTime>
      </div>

<!-- End date -->
      <div class="input-single">
        <label>End</label>
        <DateTime v-model="folderdata.end">
        </DateTime>
      </div>

<!-- Password -->
<!--
      <div class="input-single">
        <label>Password</label><br>
        <input type="password" v-model="folderdata.password">
        <small>If there is one, only user with this password will be able to edit this folder</small>
      </div>
 -->

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
import DateTime from '../subcomponents/DateTime.vue';
import alertify from 'alertify.js';
import slug from 'slugg';

export default {
  props: ['slugFolderName', 'folder'],
  components: {
    Modal,
    DateTime
  },
  data() {
    return {
      folderdata: {
        name: this.folder.name,
        start: this.folder.start,
        end: this.folder.end,
        authors: this.folder.authors
      }
    }
  },
  computed: {
  },
  methods: {
    editThisFolder: function (event) {
      console.log('editThisFolder');

      // only if user changed the name of this folder
      if(this.folderdata.name !== this.folder.name) {
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

        if(slug(this.folderdata.name).length === 0) {
          alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error('Folder name needs to contain alphanumeric characters.')
            ;
        }
      }

      // copy all values
      let values = this.folderdata;

      values.slugFolderName = this.slugFolderName;

      // if it's all good, collect everything and send over socketio
      this.$root.editFolder(values);

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
