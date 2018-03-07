/***********
  VUE
***********/

import Vue from 'vue/dist/vue';
import localstore from 'store';
import VueScrollTo from 'vue-scrollto';
import PortalVue from 'portal-vue';
import VueI18n from 'vue-i18n';
import alertify from 'alertify.js';

import locale_strings from './locale_strings.js';

import moment from 'moment';

Vue.config.silent = false;
Vue.config.devtools = true;

Vue.prototype.$eventHub = new Vue(); // Global event bus

Vue.use(VueScrollTo);
Vue.use(PortalVue);
Vue.use(VueI18n);


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

moment.locale(lang_settings.current);
Object.defineProperty(Vue.prototype, '$moment', { value: moment });

// Create VueI18n instance with options
let i18n = new VueI18n({
  locale: lang_settings.current, // set locale
  messages: locale_strings, // set locale messages
});

/***********
  SOCKETIO
***********/
import io from 'socket.io-client';

Vue.prototype.$socketio = new Vue({
  i18n,
  data: {
    socket: ''
  },
  methods: {
    connect() {
      if(window.navigator.userAgent.indexOf('Chrome') > -1) {
        this.socket = io.connect({ transports: ['websocket','polling'] });
      } else {
        this.socket = io.connect({ transports: ['polling','websocket'] });
      }
      	this.socket.on('connect', this._onSocketConnect);
      this.socket.on('error', this._onSocketError);
      this.socket.on('connect_error', this._onConnectError);
      this.socket.on('authentificated', this._authentificated);
      	this.socket.on('listMedia', this._onListMedia);
      	this.socket.on('listMedias', this._onListMedias);
      	this.socket.on('listFolder', this._onListFolder);
      	this.socket.on('listFolders', this._onListFolders);
    },
    _onSocketConnect() {
      	let sessionId = this.socket.io.engine.id;
      	console.log(`Connected as ${sessionId}`);

      	window.state.connected = true;

      	// only for non-electron (since obviously in electron we have to be connected)
      	if(!window.state.is_electron) {
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(this.$t('notifications.connection_active'))
          ;
      	}
      this.sendAuth();
    },

    sendAuth() {
      let admin_access = auth.getAdminAccess();
      	console.log(`Asking for auth with ${JSON.stringify(admin_access, null, 4)}`);
      this.socket.emit('authenticate', {admin_access});
    },

    _onSocketError(reason) {
      	console.log(`Unable to connect to server: ${reason}`);
      	window.state.connected = false;
      alertify
        .closeLogOnClick(true)
        .error(this.$t('notifications.connection_error') + ' ' + reason)
        ;
    	},

    	_onConnectError(reason) {
      	console.log(`Lost connection to server: ${reason}`);
      	window.state.connected = false;
      alertify
        .closeLogOnClick(true)
        .error(this.$t('notifications.connection_lost') + '<br>' + this.$t('notifications.contents_wont_be_editable'))
        ;
    	},

    _authentificated(list_admin_folders) {
      	console.log(`Admin for projects ${JSON.stringify(list_admin_folders, null, 4)}`);

      // compare local store and answer from server
      // for each key that is not in the answer, let’s send and alert to notify that the password is most likely wrong or the folder name has changed
      if(auth.getAdminAccess() !== undefined) {
        let admin_access = Object.keys(auth.getAdminAccess());
        admin_access.forEach(slugFolderName => {
          if(list_admin_folders === undefined || list_admin_folders.indexOf(slugFolderName) === -1) {
            alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t('notifications["wrong_password_for_folder:"]') + ' ' + slugFolderName)
              ;
            auth.removeKey(slugFolderName);
          } else {
          }
        });
      }

      window.dispatchEvent(new CustomEvent('socketio.connected_and_authentified'));
      this.listFolders();
    },

    _onListMedia(mdata) {
      	console.log(`Received _onListMedia packet.`);
      let slugFolderName = Object.keys(mdata)[0];
      	console.log(`Media data is for ${slugFolderName}.`);

  //     let mediaData = Object.values(mdata[slugFolderName].medias)[0];
  //     let mediaName = Object.keys(mdata[slugFolderName].medias)[0];

      alertify
        .closeLogOnClick(true)
        .delay(4000)
        .log(this.$t('notifications["created_edited_media:"]') + ' ' + window.store.folders[slugFolderName].name)
        ;

      window.store.folders[slugFolderName].medias = Object.assign({}, window.store.folders[slugFolderName].medias, mdata[slugFolderName].medias);
    },

    _onListMedias(mdata) {
      	console.log(`Received _onListMedias packet.`);
      let slugFolderName = Object.keys(mdata)[0];
      	console.log(`Media data is for ${slugFolderName}.`);

      window.store.folders[slugFolderName].medias = mdata[slugFolderName].medias;

      window.dispatchEvent(new CustomEvent('timeline.listMediasForFolder', { detail: slugFolderName }));
    },

    _onListFolder(fdata) {
      	console.log(`Received _onListFolder packet.`);

      	// to prevent override of fully formed medias, we copy back the ones we have already
      for(let slugFolderName in fdata) {
        if(window.store.folders.hasOwnProperty(slugFolderName)) {
          fdata[slugFolderName].medias = window.store.folders[slugFolderName].medias;
        }
      }
      window.store.folders = Object.assign({}, window.store.folders, fdata);
    },

    _onListFolders(fdata) {
      	console.log(`Received _onListFolders packet.`);

      	// to prevent override of fully formed medias, we copy back the ones we have already
      	for(let slugFolderName in fdata) {
        if(window.store.folders.hasOwnProperty(slugFolderName)) {
          fdata[slugFolderName].medias = window.store.folders[slugFolderName].medias;
        }
      }
      window.store.folders = Object.assign({}, fdata);
      window.dispatchEvent(new CustomEvent('socketio.folders_listed'));
    },

    listFolders() {
      this.socket.emit('listFolders');
    },
    createFolder(fdata) {
      this.socket.emit('createFolder', fdata);
    },
    editFolder(fdata) {
      this.socket.emit('editFolder', fdata);
    },
    removeFolder(slugFolderName) {
      this.socket.emit('removeFolder', slugFolderName);
    },

    listMedias(slugFolderName) {
      this.socket.emit('listMedias', { slugFolderName });
    },
    createTextMedia(mdata) {
      this.socket.emit('createTextMedia', mdata);
    },
    editMedia(mdata) {
      this.socket.emit('editMedia', mdata);
    },
    removeMedia(slugFolderName, slugMediaName) {
      this.socket.emit('removeMedia', { slugFolderName, slugMediaName });
    }


  }
});

import App from './App.vue';

/* eslint-disable no-new */
/* exported vm */
let vm = new Vue({
  i18n,
  el: '#app',
  template: `
    <App
      :current_slugFolderName="settings.current_slugFolderName"
      :currentFolder="currentFolder"
    />
  `,
  components: { App },
  data: {
    store: window.store,
    state: window.state,

    justCreatedTextmediaID: false,
    justCreatedFolderID: false,

    settings: {
      has_modal_opened: false,
      current_slugFolderName: '',
      has_sidebar_opened: false,
      highlightMedia: '',
      is_loading_medias_for_folder: '',
      enable_system_bar: window.state.is_electron && window.state.is_darwin,
    },

    lang: {
      available: lang_settings.available,
      current: lang_settings.current
    }
  },
  created() {
    if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: created`); }
    if(this.settings.enable_system_bar) {
      document.body.classList.add('has_systembar');
    }

    if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: created / checking for errors`); }

    if(!!this.store.noticeOfError) {
      if(this.store.noticeOfError === 'failed_to_find_folder') {
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications["failed_to_get_folder:"]') + ' ' + this.store.slugFolderName)
          ;
      }
    } else {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: created / no erros, checking for content to load`); }

      // if no error and if we have some content already loaded, let’s open it directly
      // (we are probably in an exported timeline)
      if(Object.keys(this.store.folders).length > 0) {
        this.settings.current_slugFolderName = Object.keys(this.store.folders)[0];
      } else {
        // if a slugfoldername is requested, load the content of that folder rightaway
        // we are probably in a webbrowser that accesses a subfolder
        if(!!this.store.slugFolderName) {
          this.settings.current_slugFolderName = this.store.slugFolderName;
          this.settings.is_loading_medias_for_folder = this.store.slugFolderName;
          window.addEventListener('socketio.folders_listed', () => { this.openFolder(this.store.slugFolderName); }, { once: true });
        }
      }
    }

    window.onpopstate = (event) => {
      console.log(`ROOT EVENT: popstate with event.state.slugFolderName = ${event.state.slugFolderName}`);
      this.settings.current_slugFolderName = event.state.slugFolderName;
    };

    if(this.state.mode === 'live') {
      console.log(`ROOT EVENT: created / now connecting with socketio`);
      this.$socketio.connect();
    }
  },
  methods: {
    createFolder: function(fdata) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`); }

      fdata.folderID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      this.justCreatedFolderID = fdata.folderID;

      this.$socketio.createFolder(fdata);
    },
    editFolder: function(fdata) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: editFolder: ${JSON.stringify(fdata, null, 4)}`); }
      this.$socketio.editFolder(fdata);
    },
    removeFolder: function(slugFolderName) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: removeFolder: ${slugFolderName}`); }
      this.$socketio.removeFolder(slugFolderName);
    },

    createTextMedia: function(mdata) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: createTextMedia: ${JSON.stringify(mdata, null, 4)}`); }

      if(mdata.type === 'text') {
        mdata.mediaID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.justCreatedTextmediaID = mdata.mediaID;
      }

      this.$socketio.createTextMedia(mdata);
    },
    removeMedia: function(slugFolderName, slugMediaName) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: removeMedia: ${slugFolderName}/${slugMediaName}`); }
      this.$socketio.removeMedia(slugFolderName, slugMediaName);
    },
    editMedia: function(mdata) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`); }
      this.$socketio.editMedia(mdata);
    },

    openFolder: function(slugFolderName) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: openFolder: ${slugFolderName}`); }
      if(!this.store.folders.hasOwnProperty(slugFolderName)) {
        console.log(`Missing folder key on the page, aborting.`);
        return false;
      }
      this.settings.current_slugFolderName = slugFolderName;
      this.settings.is_loading_medias_for_folder = slugFolderName;
      this.$socketio.listMedias(slugFolderName);

      history.pushState({ slugFolderName }, this.store.folders[slugFolderName].name, '/' + slugFolderName);
      window.addEventListener('timeline.listMediasForFolder', this.listMediasForFolder);
    },
    closeFolder: function() {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: closeFolder`); }
      this.settings.current_slugFolderName = '';
      history.pushState({ slugFolderName: '' }, '', '/');
    },

    listMediasForFolder: function(e) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: listMediasForFolder`); }
      if(e.detail === this.settings.is_loading_medias_for_folder) {
        this.settings.is_loading_medias_for_folder = '';
      }
    },
    updateProjectScale: function(slugFolderName, timelineViewport_scale) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: updateProjectScale`); }

      let viewportScale = localstore.get('viewport_scale') || {};
      viewportScale[slugFolderName] = timelineViewport_scale;

      localstore.set('viewport_scale', viewportScale);
    },
    getProjectScale: function(slugFolderName) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: getProjectScale`); }
      let viewportScale = localstore.get('viewport_scale') || {};
      if(viewportScale !== undefined && viewportScale[slugFolderName] !== undefined) {
        return viewportScale[slugFolderName];
      }
      return 20;
    },

    updateLocalLang: function(newLangCode) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: updateLocalLang`); }
      i18n.locale = newLangCode;
      localstore.set('language', newLangCode);
    },

    updateProjectScrollLeft: function(slugFolderName, timelineViewport_scrollLeft) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: updateProjectScrollLeft`); }

      let viewportScrollLeft = localstore.get('viewport_scrollLeft') || {};
      viewportScrollLeft[slugFolderName] = timelineViewport_scrollLeft;

      localstore.set('viewport_scrollLeft', viewportScrollLeft);
    },
    getScrollLeft: function(slugFolderName) {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: getScrollLeft`); }
      let viewportScrollLeft = localstore.get('viewport_scrollLeft') || {};
      if(viewportScrollLeft !== undefined && viewportScrollLeft[slugFolderName] !== undefined) {
        return viewportScrollLeft[slugFolderName];
      }
      return 0;
    }
  },
  watch: {
    'settings.has_modal_opened': function() {
      if(window.state.dev_mode === 'debug') { console.log(`ROOT EVENT: var has changed: has_modal_opened: ${this.settings.has_modal_opened}`); }
      if(this.has_modal_opened){
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

    }
  },
  computed: {
    currentFolder: function() {
      if(this.store.hasOwnProperty('folders') && this.store.folders.hasOwnProperty(this.settings.current_slugFolderName)) {
        return this.store.folders[this.settings.current_slugFolderName];
      }
      return {};
    }
  }
});

/*
setTimeout(() => {
  vm.openFolder('rencontre-1');
}, 500);
*/