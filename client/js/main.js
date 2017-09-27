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
    admin_access = localstore.get('admin_access') || {};
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

    createFolder: (fdata) => createFolder(fdata),
    editFolder  : (fdata) => editFolder(fdata),
    removeFolder: (slugFolderName) => removeFolder(slugFolderName),

    listMedias  : (slugFolderName) => listMedias(slugFolderName),
    createTextMedia : (mdata) =>          createTextMedia(mdata),
    editMedia   : (mdata) =>          editMedia(mdata),
    removeMedia : (slugFolderName, slugMediaName) => removeMedia(slugFolderName, slugMediaName),
  };

  function init() {
    if (window.navigator.userAgent.indexOf('Chrome') > -1) {
      socket = io.connect({ transports: ['websocket','polling'] });
    } else {
      socket = io.connect({ transports: ['polling','websocket'] });
    }
    	socket.on('connect', _onSocketConnect);
    socket.on('error', _onSocketError);
    	socket.on('authentificated', _authentificated);
    	socket.on('listMedia', _onListMedia);
    	socket.on('listMedias', _onListMedias);
    	socket.on('listFolder', _onListFolder);
    	socket.on('listFolders', _onListFolders);
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
    if(auth.getAdminAccess() !== undefined) {
      let admin_access = Object.keys(auth.getAdminAccess());
      admin_access.forEach(slugFolderName => {
        if(list_admin_folders === undefined || list_admin_folders.indexOf(slugFolderName) === -1) {
          alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(`Mauvais mot de passe ou dossier absent: ${slugFolderName}`)
            ;
          auth.removeKey(slugFolderName);
        } else {
        }
      });
    }
    listFolders();
  }

  function _onListMedia(mdata) {
    	console.log(`Received _onListMedia packet.`);
    let slugFolderName = Object.keys(mdata)[0];
    	console.log(`Media data is for ${slugFolderName}.`);

    let mediaData = Object.values(mdata[slugFolderName].medias)[0];
    	let mediaName = Object.keys(mdata[slugFolderName].medias)[0];

    alertify
      .closeLogOnClick(true)
      .delay(4000)
      .log(`Création ou édition d’un média "${mediaData.type}" pour le dossier ${slugFolderName}`)
      ;

    window.store.state.folders[slugFolderName].medias = Object.assign({}, window.store.state.folders[slugFolderName].medias, mdata[slugFolderName].medias);
  }
  function _onListMedias(mdata) {
    	console.log(`Received _onListMedias packet.`);
    let slugFolderName = Object.keys(mdata)[0];
    	console.log(`Media data is for ${slugFolderName}.`);

    window.store.state.folders[slugFolderName].medias = mdata[slugFolderName].medias;
  }
  function _onListFolder(fdata) {
    	console.log(`Received _onListFolder packet.`);

    	// to prevent override of fully formed medias, we copy back the ones we have already
    for(let slugFolderName in fdata) {
      if(window.store.state.folders.hasOwnProperty(slugFolderName)) {
        fdata[slugFolderName].medias = window.store.state.folders[slugFolderName].medias;
      }
    }
    window.store.state.folders = Object.assign({}, window.store.state.folders, fdata);
  }
  function _onListFolders(fdata) {
    	console.log(`Received _onListFolders packet.`);

    	// to prevent override of fully formed medias, we copy back the ones we have already
    	for(let slugFolderName in fdata) {
      if(window.store.state.folders.hasOwnProperty(slugFolderName)) {
        fdata[slugFolderName].medias = window.store.state.folders[slugFolderName].medias;
      }
    }
    window.store.state.folders = Object.assign({}, fdata);
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
  function createTextMedia(mdata) {
    socket.emit('createTextMedia', mdata);
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
  if(window && window.process && window.process.type) {
    const shell = window.require('electron').shell;
    event.preventDefault();
    shell.openExternal(event.target.href);
  }
});

document.addEventListener('keydown', function(event) {
  // letter G
  if(event.keyCode === 71) {
    $('body').toggleClass('is--debug');
  }
});
