<template>
  <div>

    <button type="button" class="button margin-small" @click="showModal = true">
      Create Folder
    </button>

    <modal v-show="showModal" @close="showModal = false">

      <h3 slot="header">
        Create a folder
      </h3>

      <form slot="body" @submit.prevent="newFolder">

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
          <button class="modal-default-button" @click="showModal = false">
            Annuler
          </button>
          <button class="modal-default-button button-success" type="submit">
            Valider
          </button>
        </div>

      </form>

      <div slot="footer">
      </div>

    </modal>

  </div>
</template>
<script>
import modal from './subcomponents/modal.vue';
import moment from 'moment';

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

export default {
  components: {
    modal
  },
  data() {
    return {
      showModal: false
    }
  },
  computed: {
  },
  methods: {
    newFolder() {
      // check if required are filled
      let values = {
        name: this.$refs.name.value,
        start: this.$refs.startdate.value + 'T' + this.$refs.starttime.value,
        end: this.$refs.enddate.value + 'T' + this.$refs.endtime.value,
        password: this.$refs.password.value,
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
        return false;
      }

      // if it's all good, collect everything and send over socketio
      this.$emit('createFolder', values);

      // then close that popover
    }
  },
  watch: {
    showModal: function() {
      this.$refs.startdate.value = new Date().toDateInputValue();
      this.$refs.starttime.value = moment().format('HH:mm');
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
