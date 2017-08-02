import Vue from 'vue/dist/vue';
import io from 'socket.io-client';
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

import fileUpload from './components/fileUpload.vue';
import folder from './components/folder.vue';


/***********
   STOREJS
***********/

window.store = {
  debug:true,
  state: {},
};
window.store.state.folders = JSON.parse(JSON.stringify(locals.data));

/***********
  SOCKETIO
***********/

let socketio = (function() {
  let socket;

  const API = {
    init        : () => { return init(); },
    listMedias  : (slugFolderName) => { return listMedias(slugFolderName); },
  };

  function init() {
    socket = io.connect();
    	socket.on('connect', _onSocketConnect);
    socket.on('error', _onSocketError);
    	socket.on('listMedias', _onListMedias);
    	socket.on('mediaCreated', _onMediaCreated);
  }

  function listMedias(slugFolderName) {
    socket.emit('listMedias', { slugFolderName });
  }

  function _onSocketConnect() {
    	let sessionId = socket.io.engine.id;
    	console.log(`Connected as ${sessionId}`);
  }
  function _onSocketError(reason) {
    	console.log(`Unable to connect to server: ${reason}`);
  	}
  function _onListMedias(mdata) {
    let slugFolderName = Object.keys(mdata)[0];
    window.store.state.folders[slugFolderName].medias = mdata[slugFolderName].medias;
    return;
  }
  function _onMediaCreated(mdata) {
    let slugFolderName = Object.keys(mdata)[0];
    let createdMediaMeta = mdata[slugFolderName].medias;
    let mediaKey = Object.keys(createdMediaMeta)[0];
    window.store.state.folders[slugFolderName].medias[mediaKey] = createdMediaMeta[mediaKey];
    return;
  }

  return API;
})();
socketio.init();

setTimeout(() => {
  socketio.listMedias('compagnie-3-6-30');
}, 500);

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

window.vueapp = new Vue({ // eslint-disable-line no-new
  el: '#vue',
  data: {
    store: window.store.state,
    settings: {
    },
  },
  components: {
    fileUpload,
    folder
  },
  methods: {
  },
  watch: {
  }
});

