/***********
  VUE
***********/

import Vue from 'vue/dist/vue';
import localstore from 'store';
import VueScrollTo from 'vue-scrollto';

Vue.use(VueScrollTo);

Vue.config.silent = false;
Vue.config.devtools = true;
import App from './App.vue';


/* eslint-disable no-new */
/* exported vm */
let vm = new Vue({
  el: '#app',
  template: `<App/>`,
  components: { App },
  data: {
    store: window.store.state,
    settings: {
      has_modal_opened: false,
      currentlyOpenedFolder: '',
      has_sidebar_opened: false,
      highlightMedia: '',
      is_loading_medias_for_folder: '',
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

    createTextMedia: function(mdata) {
      if(window.store.debug) { console.log(`ROOT EVENT: createTextMedia: ${JSON.stringify(mdata, null, 4)}`); }
      window.socketio.createTextMedia(mdata);
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
      this.settings.currentlyOpenedFolder = slugFolderName;
      this.settings.is_loading_medias_for_folder = slugFolderName;
      window.socketio.listMedias(slugFolderName);

      window.addEventListener('timeline.listMediasForFolder', this.listMediasForFolder);
    },
    closeFolder: function() {
      if(window.store.debug) { console.log(`ROOT EVENT: closeFolder`); }
      this.settings.currentlyOpenedFolder = '';
    },

    listMediasForFolder: function(e) {
      if(window.store.debug) { console.log(`ROOT EVENT: listMediasForFolder`); }
      if(e.detail === this.settings.is_loading_medias_for_folder) {
        this.settings.is_loading_medias_for_folder = '';
      }
    },
    updateProjectScale: function(slugFolderName, timelineViewport_scale) {
      if(window.store.debug) { console.log(`ROOT EVENT: updateProjectScale`); }

      let viewportScale = localstore.get('viewport_scale') || {};
      viewportScale[slugFolderName] = timelineViewport_scale;

      localstore.set('viewport_scale', viewportScale);
    },
    getProjectScale: function(slugFolderName) {
      if(window.store.debug) { console.log(`ROOT EVENT: getProjectScale`); }
      let viewportScale = localstore.get('viewport_scale') || {};
      if(viewportScale !== undefined && viewportScale[slugFolderName] !== undefined) {
        return viewportScale[slugFolderName];
      }
      return 20;
    },

    updateProjectScrollLeft: function(slugFolderName, timelineViewport_scrollLeft) {
      if(window.store.debug) { console.log(`ROOT EVENT: updateProjectScrollLeft`); }

      let viewportScrollLeft = localstore.get('viewport_scrollLeft') || {};
      viewportScrollLeft[slugFolderName] = timelineViewport_scrollLeft;

      localstore.set('viewport_scrollLeft', viewportScrollLeft);
    },
    getScrollLeft: function(slugFolderName) {
      if(window.store.debug) { console.log(`ROOT EVENT: getScrollLeft`); }
      let viewportScrollLeft = localstore.get('viewport_scrollLeft') || {};
      if(viewportScrollLeft !== undefined && viewportScrollLeft[slugFolderName] !== undefined) {
        return viewportScrollLeft[slugFolderName];
      }
      return 0;
    }
  },
  watch: {
    'settings.has_modal_opened': function() {
      if(window.store.debug) { console.log(`ROOT EVENT: var has changed: has_modal_opened: ${this.settings.has_modal_opened}`); }
      if(this.has_modal_opened){
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

    }
  }
});

setTimeout(() => {
//   vm.openFolder('rencontre-1');
}, 500);
