import Vue from 'vue/dist/vue';

import io from 'socket.io-client';
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

import localstore from 'store';

/***********
   AUTH
***********/
window.auth = (function() {
  let admin_access;

  const API = {
    init        : () =>init(),
    updateAdminAccess : folderPass => updateAdminAccess(folderPass),
    removeKey : slugFolderName => removeKey(slugFolderName),
    getAdminAccess : () => getAdminAccess()
  };

  function init() {
    admin_access = localstore.get('admin_access');
  }

  function updateAdminAccess(folderPass) {
    for(let slugFolderName in folderPass) {
      admin_access[slugFolderName] = folderPass[slugFolderName];
    }
    localstore.set('admin_access', admin_access);
  }

  function removeKey(slugFolderName) {
    delete admin_access[slugFolderName];
    localstore.set('admin_access', admin_access);
  }

  function getAdminAccess() {
    return admin_access;
  }

  return API;
})();
auth.init();

/***********
   STOREJS
***********/

window.store = {
  debug:true,
  state: {
    folders: {},
    networkInfos: locals.networkInfos,
    lang: locals.lang
  },
};
// window.store.state.folders = JSON.parse(JSON.stringify(locals.data));

/***********
  SOCKETIO
***********/
import alertify from 'alertify.js';

window.socketio = (function() {
  let socket;

  const API = {
    init        : () => { return init(); },

    sendAuth    : () => sendAuth(),

    createFolder: (fdata) => { return createFolder(fdata); },
    editFolder  : (fdata) => { return editFolder(fdata); },
    removeFolder: (slugFolderName) => { return removeFolder(slugFolderName); },

    listMedias  : (slugFolderName) => { return listMedias(slugFolderName); },
    editMedia   : (mdata) => { return editMedia(mdata); },
    removeMedia : (slugFolderName, slugMediaName) => { return removeMedia(slugFolderName, slugMediaName); },
  };

  function init() {
    socket = io.connect({ transports: ['websocket', 'polling'] });
    	socket.on('connect', _onSocketConnect);
    socket.on('error', _onSocketError);
    	socket.on('authentificated', _authentificated);
    	socket.on('listMedia', _onListMedia);
    	socket.on('listMedias', _onListMedias);
    	socket.on('listFolder', _onListFolder);
    	socket.on('listFolders', _onListFolders);
    	socket.on('mediaCreated', _onMediaCreated);
  }

  function _onSocketConnect() {
    	let sessionId = socket.io.engine.id;
    	console.log(`Connected as ${sessionId}`);
    	sendAuth();
  }

  function sendAuth() {
    let admin_access = auth.getAdminAccess();
    	console.log(`Asking for auth with ${JSON.stringify(admin_access, null, 4)}`);
    socket.emit('authenticate', {admin_access});
  }

  function _onSocketError(reason) {
    	console.log(`Unable to connect to server: ${reason}`);
  	}
  function _authentificated(list_admin_folders) {
    	console.log(`Admin for projects ${JSON.stringify(list_admin_folders, null, 4)}`);

    // compare local store and answer from server
    // for each key that is not in the answer, let’s send and alert to notify that the password is most likely wrong or the folder name has changed
    let admin_access = Object.keys(auth.getAdminAccess());

    admin_access.forEach(slugFolderName => {
      if(list_admin_folders.indexOf(slugFolderName) === -1) {
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(`Wrong password or inexistent folder for ${slugFolderName}`)
          ;
        auth.removeKey(slugFolderName);
      } else {

      }
    });
    listFolders();
  }

  function _onListMedia(mdata) {
    let slugFolderName = Object.keys(mdata)[0];
    window.store.state.folders[slugFolderName].medias = Object.assign({}, window.store.state.folders[slugFolderName].medias, mdata[slugFolderName].medias);
  }
  function _onListMedias(mdata) {
    let slugFolderName = Object.keys(mdata)[0];
    window.store.state.folders[slugFolderName].medias = mdata[slugFolderName].medias;
  }
  function _onListFolder(fdata) {
    window.store.state.folders = Object.assign({}, window.store.state.folders, fdata);
  }
  function _onListFolders(fdata) {
    window.store.state.folders = Object.assign({}, fdata);
  }
  function _onMediaCreated(mdata) {
    let slugFolderName = Object.keys(mdata)[0];
    let createdMediaMeta = mdata[slugFolderName].medias;
    // to get Vue to detect that medias has a new key, we need to rewrite medias itself
    window.store.state.folders[slugFolderName].medias = Object.assign({}, window.store.state.folders[slugFolderName].medias, createdMediaMeta);
    return;
  }



  function listFolders() {
    socket.emit('listFolders');
  }
  function createFolder(fdata) {
    socket.emit('createFolder', fdata);
  }
  function editFolder(fdata) {
    socket.emit('editFolder', fdata);
  }
  function removeFolder(slugFolderName) {
    socket.emit('removeFolder', slugFolderName);
  }

  function listMedias(slugFolderName) {
    socket.emit('listMedias', { slugFolderName });
  }
  function editMedia(mdata) {
    socket.emit('editMedia', mdata);
  }
  function removeMedia(slugFolderName, slugMediaName) {
    socket.emit('removeMedia', { slugFolderName, slugMediaName });
  }


  return API;
})();
socketio.init();

/***********
  UTILS
***********/

$.extend($.easing,{
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) { return c/2*t*t*t*t*t + b; }
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  }
});

// If click on a link with a specific class, open in the browser and not in electron.
$('body').on('click', '.js--openInBrowser', function() {
/*
  if(require('electron') !== undefined) {
    var shell = require('electron').shell;
    event.preventDefault();
    shell.openExternal(event.target.href);
  }
*/
});

/***********
  VUE
***********/
Vue.config.silent = false;
Vue.config.devtools = true;
import App from './App.vue';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
  data: {
    store: window.store.state,
    settings: {
      folder_currently_opened: '',
      has_modal_opened: false
    },
  },
  methods: {
    loadFolderMedias: function(slugFolderName) {
      if(window.store.debug) { console.log(`ROOT EVENT: loadFolderMedias: ${slugFolderName}`); }

      if(this.settings.folder_currently_opened !== slugFolderName) {
        window.socketio.listMedias(slugFolderName);
        this.settings.folder_currently_opened = slugFolderName;
      } else {
        this.settings.folder_currently_opened = '';
      }
    },
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

