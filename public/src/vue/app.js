/** *********
  VUE
***********/

// The following line loads the standalone build of Vue instead of the runtime-only build,
// so you don't have to do: import Vue from 'vue/dist/vue'
// This is done with the browser options. For the config, see package.json
import Vue from 'vue';

import localstore from 'store';
import VueScrollTo from 'vue-scrollto';
import PortalVue from 'portal-vue';
import VueI18n from 'vue-i18n';
import alertify from 'alertify.js';

import locale_strings from './locale_strings.js';

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
    if (localstore_lang !== undefined) {
      // exists in available
      if (this.available[localstore_lang] !== undefined) {
        this.current = localstore_lang;
      }
    }

    if (this.current === '') {
      // set current lang from
      let browserLangIsAvailable = Object.keys(this.available).filter(x => {
        return window.navigator.language.includes(x);
      });
      if (browserLangIsAvailable.length > 0) {
        this.current = browserLangIsAvailable[0];
      }
    }

    if (this.current === '') {
      this.current = 'en';
    }
  }
};
lang_settings.init();

import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/en-gb';

moment.locale(lang_settings.current);
Vue.prototype.$moment = moment;

const html = document.documentElement; // returns the html tag
html.setAttribute('lang', lang_settings.current);

document.body.classList.add('has_systembar');

// Create VueI18n instance with options
let i18n = new VueI18n({
  locale: lang_settings.current, // set locale
  messages: locale_strings // set locale messages
});

/** *********
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
      if (window.navigator.userAgent.indexOf('Chrome') > -1) {
        this.socket = io.connect({ transports: ['websocket', 'polling'] });
      } else {
        this.socket = io.connect({ transports: ['polling', 'websocket'] });
      }
      this.socket.on('connect', this._onSocketConnect);
      this.socket.on('error', this._onSocketError);
      this.socket.on('connect_error', this._onConnectError);
      this.socket.on('authentificated', this._authentificated);
      this.socket.on('listMedia', this._onListMedia);
      this.socket.on('listMedias', this._onListMedias);
      this.socket.on('listFolder', this._onListFolder);
      this.socket.on('listFolders', this._onListFolders);
      this.socket.on('notify', this._onNotify);
    },
    _onSocketConnect() {
      let sessionId = this.socket.io.engine.id;
      console.log(`Connected as ${sessionId}`);

      window.state.connected = true;

      // only for non-electron (since obviously in electron we have to be connected)
      if (!window.state.is_electron) {
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(this.$t('notifications.connection_active'));
      }
      this.sendAuth();
    },

    sendAuth() {
      let admin_access = auth.getAdminAccess();
      console.log(
        `Asking for auth with ${JSON.stringify(admin_access, null, 4)}`
      );
      this.socket.emit('authenticate', { admin_access });
    },

    _onSocketError(reason) {
      console.log(`Unable to connect to server: ${reason}`);
      window.state.connected = false;
      alertify
        .closeLogOnClick(true)
        .error(this.$t('notifications.connection_error') + ' ' + reason);
    },

    _onConnectError(reason) {
      console.log(`Lost connection to server: ${reason}`);
      window.state.connected = false;
      alertify
        .closeLogOnClick(true)
        .error(
          this.$t('notifications.connection_lost') +
            '<br>' +
            this.$t('notifications.contents_wont_be_editable')
        );
    },

    _authentificated(list_admin_folders) {
      console.log(
        `Admin for projects ${JSON.stringify(list_admin_folders, null, 4)}`
      );

      // compare local store and answer from server
      // for each key that is not in the answer, let’s send and alert to notify that the password is most likely wrong or the folder name has changed
      if (auth.getAdminAccess() !== undefined) {
        let admin_access = Object.keys(auth.getAdminAccess());
        admin_access.forEach(slugFolderName => {
          if (
            list_admin_folders === undefined ||
            list_admin_folders.indexOf(slugFolderName) === -1
          ) {
            alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(
                this.$t('notifications["wrong_password_for_folder:"]') +
                  ' ' +
                  slugFolderName
              );
            auth.removeKey(slugFolderName);
          } else {
          }
        });
      }

      window.dispatchEvent(
        new CustomEvent('socketio.connected_and_authentified')
      );
      this.listFolders({ type: 'folders' });
    },

    _onListMedia(mdata) {
      console.log('Received _onListMedia packet.');
      let slugFolderName = Object.keys(mdata)[0];
      console.log(`Media data is for ${slugFolderName}.`);

      //     let mediaData = Object.values(mdata[slugFolderName].medias)[0];
      //     let mediaName = Object.keys(mdata[slugFolderName].medias)[0];
      alertify
        .closeLogOnClick(true)
        .delay(4000)
        .log(
          this.$t('notifications["created_edited_media:"]') +
            ' ' +
            window.store.folders[slugFolderName].name
        );

      window.store.folders[slugFolderName].medias = Object.assign(
        {},
        window.store.folders[slugFolderName].medias,
        mdata[slugFolderName].medias
      );
    },

    _onListMedias(mdata) {
      console.log('Received _onListMedias packet.');
      let slugFolderName = Object.keys(mdata)[0];
      console.log(`Media data is for ${slugFolderName}.`);

      window.store.folders[slugFolderName].medias =
        mdata[slugFolderName].medias;

      window.dispatchEvent(
        new CustomEvent('timeline.listMediasForFolder', {
          detail: slugFolderName
        })
      );
    },
    _onListFolder(data) {
      console.log('Received _onListFolder packet.');
      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      // to prevent override of fully formed medias in folders, we copy back the ones we have already
      for (let slugFolderName in content) {
        if (
          window.store[type].hasOwnProperty(slugFolderName) &&
          window.store[type][slugFolderName].hasOwnProperty('medias')
        ) {
          content[slugFolderName].medias =
            window.store[type][slugFolderName].medias;
        }
        if (content[slugFolderName].hasOwnProperty('id')) {
          this.$eventHub.$emit(
            'socketio.folder_created_or_updated',
            content[slugFolderName]
          );
        }
      }

      window.store[type] = Object.assign({}, window.store[type], content);
      this.$eventHub.$emit(`socketio.${type}.folder_listed`);
    },

    // for projects, authors and publications
    _onListFolders(data) {
      console.log('Received _onListFolders packet.');

      if (typeof data !== 'object') {
        return;
      }

      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      console.log(`Type is ${type}`);

      // to prevent override of fully formed medias in folders, we copy back the ones we have already
      for (let slugFolderName in content) {
        if (
          window.store[type].hasOwnProperty(slugFolderName) &&
          window.store[type][slugFolderName].hasOwnProperty('medias')
        ) {
          content[slugFolderName].medias =
            window.store[type][slugFolderName].medias;
        }
      }
      window.store[type] = Object.assign({}, content);

      this.$eventHub.$emit(`socketio.${type}.folders_listed`);
    },

    _onNewNetworkInfos(data) {
      console.log('Received _onNewNetworkInfos packet.');
      window.state.localNetworkInfos = data;
    },

    _onNotify({ localized_string, not_localized_string }) {
      console.log('Received _onNotify packet.');

      if (not_localized_string) {
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(not_localized_string);
      }
      if (localized_string) {
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(this.$t(`notifications[${localized_string}]`));
      }
    },

    listFolders(fdata) {
      this.socket.emit('listFolders', fdata);
    },
    listFolder(fdata) {
      this.socket.emit('listFolder', fdata);
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

let vm = new Vue({
  // eslint-disable-line no-new
  i18n,
  el: '#app',
  components: { App },
  template: `
    <App
      :current_slugFolderName="settings.current_slugFolderName"
      :currentFolder="currentFolder"
    />
  `,
  data: {
    store: window.store,
    state: window.state,

    access: false,

    justCreatedTextmediaID: false,
    justCreatedFolderID: false,
    justCreatedFolderPassword: false,

    settings: {
      has_modal_opened: false,
      current_slugFolderName: '',
      has_sidebar_opened: false,
      highlightMedia: '',
      is_loading_medias_for_folder: '',
      enable_system_bar: window.state.is_electron && window.state.is_darwin,
      perf_mode: 'low',
      keyboard_shortcuts: []
    },

    lang: {
      available: lang_settings.available,
      current: lang_settings.current
    }
  },
  created() {
    if (window.state.dev_mode === 'debug') {
      console.log('ROOT EVENT: created');
    }
    if (this.settings.enable_system_bar) {
      document.body.classList.add('has_systembar');
    }

    if (window.state.dev_mode === 'debug') {
      console.log('ROOT EVENT: created / checking for errors');
    }

    this.settings.keyboard_shortcuts = this.getKeyboardShortcuts();

    if (
      window.state.hasOwnProperty('export_options') &&
      !!window.state.export_options.password_protect
    ) {
      let hashCode = function(s) {
        return s.split('').reduce(function(a, b) {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
      };

      let mdp = prompt('Password for application :');

      if ('' + hashCode(mdp) !== window.state.export_options.password_protect) {
        window.alert('This password is not valid.');
        return;
      }
    }

    this.access = true;

    if (this.state.mode === 'export') {
      this.settings.has_sidebar_opened = true;
    }

    if (this.store.noticeOfError) {
      if (this.store.noticeOfError === 'failed_to_find_folder') {
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t('notifications["failed_to_get_folder:"]') +
              ' ' +
              this.store.slugFolderName
          );
      }
    } else {
      if (window.state.dev_mode === 'debug') {
        console.log(
          'ROOT EVENT: created / no erros, checking for content to load'
        );
      }

      // if no error and if we have some content already loaded, let’s open it directly
      // (we are probably in an exported timeline)
      if (Object.keys(this.store.folders).length > 0) {
        this.settings.current_slugFolderName = Object.keys(
          this.store.folders
        )[0];
      } else {
        // if a slugfoldername is requested, load the content of that folder rightaway
        // we are probably in a webbrowser that accesses a subfolder
        if (this.store.slugFolderName) {
          this.settings.current_slugFolderName = this.store.slugFolderName;
          this.settings.is_loading_medias_for_folder = this.store.slugFolderName;
          window.addEventListener(
            'socketio.folders_listed',
            () => {
              this.openFolder(this.store.slugFolderName);
            },
            { once: true }
          );
        }
      }
    }

    window.onpopstate = event => {
      console.log(
        `ROOT EVENT: popstate with event.state.slugFolderName = ${
          event.state.slugFolderName
        }`
      );
      this.settings.current_slugFolderName = event.state.slugFolderName;
    };

    if (this.state.mode === 'live') {
      console.log('ROOT EVENT: created / now connecting with socketio');
      this.$socketio.connect();
    }
  },
  methods: {
    createFolder: function(fdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }

      fdata.folderID =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15);
      this.justCreatedFolderID = fdata.folderID;
      if (fdata.password !== '') {
        this.justCreatedFolderPassword = fdata.password;
      }

      this.$socketio.createFolder(fdata);
    },
    editFolder: function(fdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: editFolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }
      this.$socketio.editFolder(fdata);
    },
    removeFolder: function(slugFolderName) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: removeFolder: ${slugFolderName}`);
      }
      this.$socketio.removeFolder(slugFolderName);
    },

    createTextMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: createTextMedia: ${JSON.stringify(mdata, null, 4)}`
        );
      }

      if (mdata.type === 'text') {
        mdata.mediaID =
          Math.random()
            .toString(36)
            .substring(2, 15) +
          Math.random()
            .toString(36)
            .substring(2, 15);
        this.justCreatedTextmediaID = mdata.mediaID;
      }

      this.$socketio.createTextMedia(mdata);
    },
    removeMedia: function(slugFolderName, slugMediaName) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: removeMedia: ${slugFolderName}/${slugMediaName}`
        );
      }
      this.$socketio.removeMedia(slugFolderName, slugMediaName);
    },
    editMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`);
      }
      this.$socketio.editMedia(mdata);
    },

    openFolder: function(slugFolderName) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: openFolder: ${slugFolderName}`);
      }
      if (!this.store.folders.hasOwnProperty(slugFolderName)) {
        console.log('Missing folder key on the page, aborting.');
        return false;
      }
      this.settings.current_slugFolderName = slugFolderName;
      this.settings.is_loading_medias_for_folder = slugFolderName;

      this.$nextTick(() => {
        this.$socketio.listMedias(slugFolderName);
      });

      history.pushState(
        { slugFolderName },
        this.store.folders[slugFolderName].name,
        '/' + slugFolderName
      );
      window.addEventListener(
        'timeline.listMediasForFolder',
        this.listMediasForFolder
      );
    },
    closeFolder: function() {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: closeFolder');
      }
      this.settings.current_slugFolderName = '';
      history.pushState({ slugFolderName: '' }, '', '/');
    },

    listMediasForFolder: function(e) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: listMediasForFolder');
      }
      if (e.detail === this.settings.is_loading_medias_for_folder) {
        this.settings.is_loading_medias_for_folder = '';
      }
    },
    updateProjectScale: function(slugFolderName, timelineViewport_scale) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: updateProjectScale');
      }

      let viewportScale = localstore.get('viewport_scale') || {};
      viewportScale[slugFolderName] = timelineViewport_scale;

      localstore.set('viewport_scale', viewportScale);
    },
    getProjectScale: function(slugFolderName) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: getProjectScale');
      }
      let viewportScale = localstore.get('viewport_scale') || {};
      if (
        viewportScale !== undefined &&
        viewportScale[slugFolderName] !== undefined
      ) {
        return viewportScale[slugFolderName];
      }
      if (this.state.mode === 'export') {
        return 50;
      }
      return 20;
    },

    updateLocalLang: function(newLangCode) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: updateLocalLang');
      }
      i18n.locale = newLangCode;
      moment.locale(newLangCode);

      const html = document.documentElement; // returns the html tag
      html.setAttribute('lang', newLangCode);

      localstore.set('language', newLangCode);
    },

    updateProjectScrollLeft: function(
      slugFolderName,
      timelineViewport_scrollLeft
    ) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: updateProjectScrollLeft');
      }

      let viewportScrollLeft = localstore.get('viewport_scrollLeft') || {};
      viewportScrollLeft[slugFolderName] = timelineViewport_scrollLeft;

      localstore.set('viewport_scrollLeft', viewportScrollLeft);
    },
    getScrollLeft: function(slugFolderName) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: getScrollLeft');
      }
      let viewportScrollLeft = localstore.get('viewport_scrollLeft') || {};
      if (
        viewportScrollLeft !== undefined &&
        viewportScrollLeft[slugFolderName] !== undefined
      ) {
        return viewportScrollLeft[slugFolderName];
      }
      return 0;
    },
    updateKeyboardShortcuts: function(keyboard_shortcuts) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: updateKeyboardShortcuts');
      }
      localstore.set('keyboard_shortcuts', keyboard_shortcuts);
      this.settings.keyboard_shortcuts = keyboard_shortcuts;
    },
    getKeyboardShortcuts: function() {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: getKeyboardShortcuts');
      }
      let kbs = localstore.get('keyboard_shortcuts') || [];
      return kbs;
    }
  },
  watch: {
    'settings.has_modal_opened': function() {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: var has changed: has_modal_opened: ${
            this.settings.has_modal_opened
          }`
        );
      }
      if (this.has_modal_opened) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  computed: {
    currentFolder: function() {
      if (
        this.store.hasOwnProperty('folders') &&
        this.store.folders.hasOwnProperty(this.settings.current_slugFolderName)
      ) {
        return this.store.folders[this.settings.current_slugFolderName];
      }
      return {};
    }
  }
});
