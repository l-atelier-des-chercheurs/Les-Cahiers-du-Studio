<template>
  <Modal
    @close="$emit('close')"
    @submit="newFolder"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
    >
    <template slot="header">
      <span class="text-cap"> {{ $t('create_a_folder') }}</span>
    </template>

    <template slot="sidebar">

<!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('name') }}</label>
        <input type="text" v-model="folderdata.name" required autofocus>
      </div>

<!-- Start date -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('capture_start') }}</label>
        <DateTime v-model="folderdata.start" :read_only="read_only">
        </DateTime>
      </div> -->

<!-- End date -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('capture_end') }}</label>
        <DateTime v-model="folderdata.end" :twowaybinding=true :read_only="read_only">
        </DateTime>
        <div class="margin-bottom-small">
          <small>
            {{ $t('currently') }}
            <button
              type="button"
              class="button-small border-circled button-thin button-wide padding-verysmall margin-none bg-transparent"
              @click="folderdata.end = $root.currentTime"
            >
              {{ $root.currentTime_human }}
            </button>
          </small>
        </div>
      </div> -->

<!-- Password -->
      <div class="margin-bottom-small">
        <input type="checkbox" id="enable_password" v-model="show_password_field">
        <label for="enable_password">{{ $t('password') }}</label>
        <template v-if="show_password_field">
          <input type="password" v-model="folderdata.password">
          <small>{{ $t('password_instructions') }}</small>
        </template>
      </div>

    </template>

    <template slot="submit_button">
      {{ $t('create') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import DateTime from '../subcomponents/DateTime.vue';
import alertify from 'alertify.js';

export default {
  props: {
    read_only: Boolean,
  },
  components: {
    Modal,
    DateTime
  },
  data() {
    return {
      askBeforeClosingModal: false,
      show_password_field: false,
      folderdata: {
        name: '',
        password: '',
        authors: ''
      }
    };
  },
  watch: {
    'folderdata': {
      handler() {
        this.askBeforeClosingModal = true;
      },
      deep: true
    }
  },
  computed: {},
  methods: {
    newFolder: function(event) {
      console.log('newFolder');

      function getAllFolderNames() {
        let allFoldersName = [];
        for (let slugFolderName in window.store.folders) {
          let foldersName = window.store.folders[slugFolderName].name;
          allFoldersName.push(foldersName);
        }
        return allFoldersName;
      }
      let allFoldersName = getAllFolderNames();

      // check if folder name (not slug) already exists
      if (allFoldersName.indexOf(this.folderdata.name) >= 0) {
        // invalidate if it does
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.folder_name_exists'));

        return false;
      }

      this.$root.createFolder({
        type: 'folders',
        data: this.folderdata 
      });

      this.$eventHub.$on('socketio.folder_created_or_updated', this.newFolderCreated);
    },
    newFolderCreated: function(fdata) {
      if(fdata.id === this.$root.justCreatedFolderID) {
        this.$eventHub.$off('socketio.folder_created_or_updated', this.newFolderCreated);
        this.$root.justCreatedFolderID = false;

        this.$nextTick(() => {
          if(fdata.password === 'has_pass') {
            this.$auth.updateFoldersPasswords({
              "projects": {
                [fdata.slugFolderName]: this.projectdata.password
              }
            });
            this.$socketio.sendAuth();

            this.$eventHub.$once('socketio.authentificated', () => {
              this.$emit('close', '');
              this.$root.openFolder(fdata.slugFolderName);
              this.$root.createMedia({
                slugFolderName: fdata.slugFolderName,
                type: 'folders',
                additionalMeta: {
                  type: 'marker',
                  content: 'Création du dossier',
                  color: 'red',
                  collapsed: true
                }
              });            
            });
          } else {
            this.$emit('close', '');
            this.$root.openFolder(fdata.slugFolderName);
            this.$root.createMedia({
              slugFolderName: fdata.slugFolderName,
              type: 'folders',
              additionalMeta: {
                type: 'marker',
                content: this.$t('creation_of_the_timeline')
              }
            });            
          }
        });
      }
    }
  }
};
</script>
<style>

</style>
