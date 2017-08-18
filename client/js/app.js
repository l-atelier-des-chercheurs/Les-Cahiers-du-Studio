/***********
  VUE
***********/

import Vue from 'vue/dist/vue';

Vue.config.silent = false;
Vue.config.devtools = true;
import App from './App.vue';

/* eslint-disable no-new */
let vm = new Vue({
  el: '#app',
  template: `<App/>`,
  components: { App },
  data: {
    store: window.store.state,
    settings: {
      has_modal_opened: false,
      currentlyOpenedFolder: ''
    },
  },
  methods: {
    createFolder: function(fdata) {
      if(window.store.debug) { console.log(`ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`); }
      window.socketio.createFolder(fdata);
    },
    editFolder: function(fdata) {
      if(window.store.debug) { console.log(`ROOT EVENT: editFolder: ${JSON.stringify(fdata, null, 4)}`); }
      window.socketio.editFolder(fdata);
    },
    removeFolder: function(slugFolderName) {
      if(window.store.debug) { console.log(`ROOT EVENT: removeFolder: ${slugFolderName}`); }
      window.socketio.removeFolder(slugFolderName);
    },
    removeMedia: function(slugFolderName, slugMediaName) {
      if(window.store.debug) { console.log(`ROOT EVENT: removeMedia: ${slugFolderName}/${slugMediaName}`); }
      window.socketio.removeMedia(slugFolderName, slugMediaName);
    },
    editMedia: function(mdata) {
      if(window.store.debug) { console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`); }
      window.socketio.editMedia(mdata);
    },

    openFolder: function(slugFolderName) {
      if(window.store.debug) { console.log(`ROOT EVENT: openFolder: ${slugFolderName}`); }
      if(!this.store.folders.hasOwnProperty(slugFolderName)) {
        console.log(`Missing folder key on the page, aborting.`);
        return false;
      }
      // we check if this folder already is tracking medias
      if(this.store.folders[slugFolderName].hasOwnProperty('medias')) {
        this.settings.currentlyOpenedFolder = slugFolderName;

      } else {
        // if its not, we create an empty medias object,
        this.store.folders[slugFolderName].medias = {};
        this.store.folders[slugFolderName].loading_medias = true;
        this.settings.currentlyOpenedFolder = slugFolderName;
        window.socketio.listMedias(slugFolderName);
      }

    },
    closeFolder: function() {
      if(window.store.debug) { console.log(`ROOT EVENT: closeFolder`); }
      this.settings.currentlyOpenedFolder = '';
    }
  },
  watch: {
    has_modal_opened: function() {
      if(window.store.debug) { console.log(`ROOT EVENT: var has changed: has_modal_opened: ${this.has_modal_opened}`); }
      if(this.has_modal_opened){
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

    }
  }
});

setTimeout(() => {
  vm.openFolder('test-temps-reel');
}, 500);
