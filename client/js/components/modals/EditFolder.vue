<template>
  <Modal @close="$emit('close')">
    <h3 slot="header">
      Edit a folder
    </h3>

    <form slot="body" v-on:submit.prevent="editThisFolder">

<!-- Human name -->
      <div class="input-single">
        <label>Name</label>
        <p>
          <input type="text" ref="name" required>
        </p>
      </div>

<!-- Start date -->
      <div>
        <label>Beginning</label>
        <div class="two-column">
          <p>
            <input type="date" ref="startdate">
          </p>
          <p>
            <input type="time" ref="starttime">
          </p>
        </div>
      </div>

<!-- End date -->
      <div>
        <label>End</label>
        <div class="two-column">
          <p>
            <input type="date" ref="enddate">
          </p>
          <p>
            <input type="time" ref="endtime">
          </p>
        </div>
      </div>

<!-- Password -->
      <div class="input-single">
        <label>Password</label><br>
        <input type="password" ref="password">
        <small>If there is one, only user with this password will be able to edit this folder</small>
      </div>

<!-- Author(s) -->
      <div class="input-single">
        <label>Author(s)</label><br>
        <small>One per line</small>
        <textarea ref="authors">
        </textarea>
      </div>

      <small>
        fields with a * are required<br>
        they can be edited at all time
      </small>

      <div>
        <button class="modal-default-button button-success" type="submit">
          Valider
        </button>
        <!-- pressing enter presses the first button… need fix to place this button somewhere else -->
        <button class="modal-default-button" @click="$emit('close')">
          Annuler
        </button>
      </div>

    </form>

    <div slot="footer">
    </div>

  </Modal>
</template>
<script>
import Modal from './Modal.vue';
import moment from 'moment';
import alertify from 'alertify.js';

export default {
  props: ['folder'],
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
    editThisFolder: function (event) {
      console.log('editThisFolder');

      // check if required are filled
      let values = {
        name: this.$refs.name.value.trim(),
        start: this.$refs.startdate.value + 'T' + this.$refs.starttime.value,
        end: this.$refs.enddate !== undefined ? (this.$refs.enddate.value + 'T' + this.$refs.endtime.value) : '',
        password: this.$refs.password.value.trim(),
        authors: this.$refs.authors.value,
      }

      function getAllFolderNames () {
        let allFoldersName = [];
        for (let slugFolderName in window.store.state.folders) {
          let foldersName = window.store.state.folders[slugFolderName].name;
          allFoldersName.push(foldersName);
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

      // if it's all good, collect everything and send over socketio
      this.$root.$emit('editFolder', values);

      // then close that popover
      this.$emit('close', '');
    }
  },
  mounted() {
    this.$refs.name.value = this.folder.name;
    // TODO : separate start and end date into date and time fields
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
