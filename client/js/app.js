/***********
  VUE
***********/

import Vue from 'vue/dist/vue';
import localstore from 'store';
import VueScrollTo from 'vue-scrollto';
import PortalVue from 'portal-vue';
import VueI18n from 'vue-i18n';

import locale_strings from './locale_strings.js';

import moment from 'moment';

Vue.prototype.$eventHub = new Vue(); // Global event bus

Vue.use(VueScrollTo);
Vue.use(PortalVue);
Vue.use(VueI18n);

Vue.config.silent = false;
Vue.config.devtools = true;

import App from './App.vue';


let lang_settings = {
  available: {
    fr: 'Français',
    en: 'English'
  },
  default: 'en',
  current: '',
  init: function() {
    let localstore_lang = localstore.get('language');

    // has lang set
    if(localstore_lang !== undefined) {
      // exists in available
      if(this.available[localstore_lang] !== undefined) {
        this.current = localstore_lang;
      }
    }

    if(this.current === '') {
      // set current lang from
      let browserLangIsAvailable = Object.keys(this.available).filter((x) => {
        	return x === window.navigator.language;
      });
      if(browserLangIsAvailable.length > 0) {
        this.current = browserLangIsAvailable[0];
      }
    }

    if(this.current === '') {
      this.current = 'en';
    }
  }
};
lang_settings.init();

moment.locale(`${lang_settings.current}`);
Object.defineProperty(Vue.prototype, '$moment', { value: moment });

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: lang_settings.current, // set locale
  messages: locale_strings, // set locale messages
});

/* eslint-disable no-new */
/* exported vm */
let vm = new Vue({
  i18n,
  el: '#app',
  template: `<App/>`,
  components: { App },
  data: {
    store: window.store.state,
    justCreatedTextmediaID: false,
    settings: {
      has_modal_opened: false,
      currentlyOpenedFolder: '',
      has_sidebar_opened: false,
      highlightMedia: '',
      is_loading_medias_for_folder: '',
      enable_system_bar: window.store.state.is_electron && window.store.state.is_darwin,
    },
    lang: {
      available: lang_settings.available,
      current: lang_settings.current
    }
  },
  mounted() {
    if(this.settings.enable_system_bar) {
      document.body.classList.add('has_systembar');
    }
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

      if(mdata.type === 'text') {
        mdata.mediaID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.justCreatedTextmediaID = mdata.mediaID;
      }

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

    updateLocalLang: function(newLangCode) {
      if(window.store.debug) { console.log(`ROOT EVENT: updateLocalLang`); }
      i18n.locale = newLangCode;
      localstore.set('language', newLangCode);
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
