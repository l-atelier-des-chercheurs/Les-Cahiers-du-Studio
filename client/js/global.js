import Vue from 'vue/dist/vue';
import io from 'socket.io-client';
import fileUpload from './components/fileUpload.vue';
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;


/***********
   STOREJS
***********/

window.store = {
  debug:true,
  el: '#vue',
  state: {
    folders: {}
  }
};

/***********
  SOCKETIO
***********/

(function initSocketIO() {
  var socket = io.connect();
  function onSocketConnect() {
    	let sessionId = socket.io.engine.id;
    	console.log(`Connected as ${sessionId}`);

    	// change scope depending on page/subpage
    	socket.emit('listFolders', { scope: 'all' });
  }
  function onSocketError(reason) {
    	console.log('Unable to connect to server', reason);
  	}
  	socket.on('connect', onSocketConnect);
  socket.on('error', onSocketError);

  socket.on('listFolders', function (data){ onListFolders(socket); });
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
  SOCKETIO
***********/





