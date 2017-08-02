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
  state: {}
};
window.store.state.folders = JSON.parse(JSON.stringify(locals.data));

setTimeout(() => {
//   window.store.state.folders['compagnie-3-6-30'].created = '';
}, 1000);

/***********
  SOCKETIO
***********/

(function initSocketIO() {
  var socket = io.connect();
  function onSocketConnect() {
    	let sessionId = socket.io.engine.id;
    	console.log(`Connected as ${sessionId}`);

    // à déplacer
    socket.emit('listMedias', { slugFolderName : 'compagnie-3-6-30' });
  }
  function onSocketError(reason) {
    	console.log('Unable to connect to server', reason);
  	}
  	socket.on('connect', onSocketConnect);
  socket.on('error', onSocketError);

  	socket.on('listMedias', onListMedias);

})();

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


function onListMedias(mdata) {
  let slugFolderName = Object.keys(mdata)[0];
  window.store.state.folders[slugFolderName].medias = mdata[slugFolderName].medias;
  return;
}