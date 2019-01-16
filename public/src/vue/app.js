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
      let opts = { transports: ['polling', 'websocket'] };
      if (window.navigator.userAgent.indexOf('Chrome') > -1) {
        opts = { transports: ['websocket', 'polling'] };
      }
      this.socket = io.connect(opts);

      this.socket.on('connect', this._onSocketConnect);
      this.socket.on('reconnect', this._onReconnect);
      this.socket.on('pong', this._onPong);
      this.socket.on('error', this._onSocketError);
      this.socket.on('connect_error', this._onConnectError);
      this.socket.on('authentificated', this._authentificated);
      this.socket.on('listMedia', this._onListMedia);
      this.socket.on('listMedias', this._onListMedias);

      this.socket.on('listFolder', this._onListFolder);
      this.socket.on('listFolders', this._onListFolders);

      this.socket.on('listSpecificMedias', this._onListSpecificMedias);
      this.socket.on('publiPDFGenerated', this._onPubliPDFGenerated);
      this.socket.on('publiVideoGenerated', this._onPubliVideoGenerated);

      this.socket.on('newNetworkInfos', this._onNewNetworkInfos);

      this.socket.on('notify', this._onNotify);

      this.socket.on('pong', this._onPong);

      this.socket.on('listClients', this._listClients);
    },
    _onSocketConnect() {
      let sessionId = this.socket.io.engine.id;
      console.log(`Connected as ${sessionId}`);

      window.state.connected = true;

      this.socket.emit('updateClientInfo', {});

      // only for non-electron (since obviously in electron we have to be connected)
      if (!window.state.is_electron) {
        // this.$alertify
        //   .closeLogOnClick(true)
        //   .delay(4000)
        //   .success(this.$t('notifications.connection_active'));
      }

      // TODO : reenable auth for folders and publications
      this.listFolders({ type: 'folders' });
      this.listFolders({ type: 'authors' });
      this.sendAuth();
    },

    _onReconnect() {
      this.$eventHub.$emit('socketio.reconnect');
      console.log(`Reconnected`);
    },

    _onPong() {
      console.log(`_onPong`);
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
      // this.$alertify
      //   .closeLogOnClick(true)
      //   .error(this.$t('notifications.connection_error') + ' ' + reason);
    },

    _onConnectError(reason) {
      console.log(`Lost connection to server: ${reason}`);
      window.state.connected = false;
      // this.$alertify
      //   .closeLogOnClick(true)
      //   .error(
      //     this.$t('notifications.connection_lost') +
      //       '<br>' +
      //       this.$t('notifications.contents_wont_be_editable')
      //   );
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
            this.$alertify
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

    _onListMedia(data) {
      console.log('Received _onListMedia packet.');

      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      console.log(`Type is ${type}`);

      for (let slugFolderName in content) {
        console.log(`Media data is for ${slugFolderName}.`);
        if (window.store[type].hasOwnProperty(slugFolderName)) {
          window.store[type][slugFolderName].medias = Object.assign(
            {},
            window.store[type][slugFolderName].medias,
            content[slugFolderName].medias
          );

          // check if mdata has a mediaID (which would mean a user just created it)
          const mdata = Object.values(content[slugFolderName].medias)[0];
          if (mdata.hasOwnProperty('id')) {
            this.$eventHub.$emit('socketio.media_created_or_updated', mdata);
          }
        }
      }

      this.$eventHub.$emit(`socketio.${type}.listMedia`);
    },

    _onListMedias(data) {
      console.log('Received _onListMedias packet.');

      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      console.log(`Type is ${type}`);

      for (let slugFolderName in content) {
        console.log(`Media data is for ${slugFolderName}.`);
        if (window.store[type].hasOwnProperty(slugFolderName)) {
          window.store[type][slugFolderName].medias =
            content[slugFolderName].medias;
        }
      }
      this.$eventHub.$emit(`socketio.${type}.listMedias`);
    },

    _onListSpecificMedias(data) {
      console.log('Received _onListSpecificMedias packet.');

      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      console.log(`Type is ${type}`);

      for (let slugFolderName in content) {
        console.log(`Media data is for ${slugFolderName}.`);
        if (
          window.store[type].hasOwnProperty(slugFolderName) &&
          window.store[type][slugFolderName].hasOwnProperty('medias')
        ) {
          window.store[type][slugFolderName].medias = Object.assign(
            {},
            window.store[type][slugFolderName].medias,
            content[slugFolderName].medias
          );
        }
      }
      this.$eventHub.$emit(`socketio.${type}.listSpecificMedias`);
    },

    _onPubliPDFGenerated(data) {
      console.log('Received _onPubliPDFGenerated packet.');
      this.$eventHub.$emit('socketio.publication.pdfIsGenerated', data);
    },

    _onPubliVideoGenerated(data) {
      console.log('Received _onPubliVideoGenerated packet.');
      this.$eventHub.$emit('socketio.publication.videoIsGenerated', data);
    },

    _listClients(data) {
      console.log('Received _listClients packet.');
      window.state.clients = data;
    },

    // for projects, authors and publications
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
          .log(this.$t(`notifications['${localized_string}']`));
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
    removeFolder(fdata) {
      this.socket.emit('removeFolder', fdata);
    },

    listMedias(mdata) {
      this.socket.emit('listMedias', mdata);
    },
    createMedia(mdata) {
      this.socket.emit('createMedia', mdata);
    },
    editMedia(mdata) {
      this.socket.emit('editMedia', mdata);
    },
    removeMedia(mdata) {
      this.socket.emit('removeMedia', mdata);
    },
    listSpecificMedias(mdata) {
      this.socket.emit('listSpecificMedias', mdata);
    },
    downloadPubliPDF(pdata) {
      this.socket.emit('downloadPubliPDF', pdata);
    },
    downloadVideoPubli(pdata) {
      this.socket.emit('downloadVideoPubli', pdata);
    },
    updateNetworkInfos() {
      this.socket.emit('updateNetworkInfos');
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

    currentTime: '',

    justCreatedMediaID: false,
    justCreatedFolderID: false,
    justCreatedFolderPassword: false,

    media_modal: {
      open: false,
      minimized: false,
      show_sidebar: true
    },

    settings: {
      has_modal_opened: false,
      current_slugFolderName: '',
      has_sidebar_opened: false,
      highlightMedia: '',
      is_loading_medias_for_folder: false,
      enable_system_bar: window.state.is_electron && window.state.is_darwin,
      perf_mode: 'low',
      keyboard_shortcuts: [],
      current_author: false,
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      current_author: false
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

    window.addEventListener('resize', () => {
      this.settings.windowWidth = window.innerWidth;
      this.settings.windowHeight = window.innerHeight;
    });

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

      this.currentTime = this.$moment().millisecond(0);
      setInterval(
        () => (this.currentTime = this.$moment().millisecond(0)),
        1000
      );

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
          this.$eventHub.$once('socketio.folders.folders_listed', () => {
            this.openFolder(this.store.slugFolderName);
          });
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

      if (fdata.password !== '') {
        this.justCreatedFolderPassword = fdata.password;
      }

      this.justCreatedFolderID = fdata.id =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15);

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

    createMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: createMedia`);
      }
      this.justCreatedMediaID = mdata.id =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15);

      if (this.settings.current_author.hasOwnProperty('name')) {
        if (!mdata.hasOwnProperty('additionalMeta')) {
          mdata.additionalMeta = {};
        }
        mdata.additionalMeta.authors = [
          { name: this.$root.settings.current_author.name }
        ];
      }

      this.$nextTick(() => {
        this.$socketio.createMedia(mdata);
      });
    },

    removeMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: removeMedia: ${JSON.stringify(mdata, null, 4)}`
        );
      }
      this.$socketio.removeMedia(mdata);
    },
    editMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`);
      }
      this.$socketio.editMedia(mdata);
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
        this.$socketio.listMedias({
          type: 'folders',
          slugFolderName
        });
      });

      history.pushState(
        { slugFolderName },
        this.store.folders[slugFolderName].name,
        '/' + slugFolderName
      );
      this.$eventHub.$once('socketio.folders.listMedias', () => {
        this.settings.is_loading_medias_for_folder = false;
      });
    },
    closeFolder: function() {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: closeFolder');
      }
      this.settings.current_slugFolderName = '';
      history.pushState({ slugFolderName: '' }, '', '/');
    },
    updateFolderScale: function(slugFolderName, timelineViewport_scale) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: updateFolderScale');
      }

      let viewportScale = localstore.get('viewport_scale') || {};
      viewportScale[slugFolderName] = timelineViewport_scale;

      localstore.set('viewport_scale', viewportScale);
    },
    getFolderScale: function(slugFolderName) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: getFolderScale');
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

    updateFolderScrollLeft: function(
      slugFolderName,
      timelineViewport_scrollLeft
    ) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: updateFolderScrollLeft');
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
    },
    currentTime_human() {
      return this.$moment(this.currentTime).format('l LTS');
    }
  }
});
