const
  dev = require('./bin/dev-log'),
  api = require('./bin/api'),
  auth = require('./bin/auth')
;

const file = require('./bin/file');

module.exports = (function() {

  dev.log(`Main module initialized at ${api.getCurrentDate()}`);
  let app;
  let io;
  let electronApp;

  const API = {
    init          : (app, io, electronApp)   => { return init(app, io, electronApp); },
    createMediaMeta : (slugFolderName, slugMediaName) => { return createMediaMeta(slugFolderName, slugMediaName); },
    pushMessage   : (msg)    => pushMessage(msg)
  };

  function init(thisApp, thisIO, thisElectronApp) {
    dev.log(`Initializing socket module`);

    app = thisApp;
    io = thisIO;
    electronApp = thisElectronApp;

    io.on('connection', function (socket){
      var onevent = socket.onevent;
      socket.onevent = function (packet) {
        var args = packet.data || [];
        onevent.call (this, packet);    // original call
        packet.data = ['*'].concat(args);
        onevent.call(this, packet);      // additional call to catch-all
      };
      socket.on('*',function(event,data) { dev.log(`RECEIVED EVENT: ${event}`); });

      socket.on('authenticate', function(data) { onAuthenticate(socket, data); });

      socket.on('listFolders', function () { onListFolders(socket); });
      socket.on('createFolder', function (data){ onCreateFolder(socket,data); });
      socket.on('removeFolder', function (data){ onRemoveFolder(socket,data); });
      socket.on('editFolder', function (data){ onEditFolder(socket,data); });

      socket.on('listMedias', function (data){ onListMedias(socket,data); });
      socket.on('editMedia', function (data){ onEditMedia(socket,data); });
      socket.on('removeMedia', function (data){ onRemoveMedia(socket,data); });
    });
  }

  /**************************************************************** UTIL ********************************/
  function onAuthenticate(socket, d) {
    dev.logfunction(`EVENT - onAuthenticate for ${JSON.stringify(d, null, 4)}`);
    auth.setAuthenticate(socket.id, d.admin_access).then((list_admin_folders) => {
      api.sendEventWithContent('authentificated', list_admin_folders, io, socket);
    })
    .catch(err => {
      api.sendEventWithContent('authentificated', {}, io, socket);
    });
  }

  function pushMessage(msg) {
    dev.logfunction(`EVENT - pushMessage ${msg}`);
    api.sendEventWithContent('authentificated', {}, io, socket);
  }

  /**************************************************************** FOLDER ********************************/
  function onListFolders(socket) {
    dev.logfunction(`EVENT - onListFolders`);
    sendFolders('', socket);
  }
  function onCreateFolder(socket, d) {
    dev.logfunction(`EVENT - onCreateFolder for ${d.name}`);
    file.createFolder(d).then(slugFolderName => {
      sendFolders(slugFolderName);
    }, function(err) {
      dev.error(`Failed to list medias! Error: ${err}`);
    });
  }
  function onEditFolder(socket,d) {
    dev.logfunction(`EVENT - onEditFolder for ${d.slugFolderName}`);
    // check if allowed
    file.getFolder(d.slugFolderName).then(foldersData => {
      if(!auth.hasFolderAuth(socket.id,foldersData,d.slugFolderName)) { return; }

      file.editFolder(foldersData, d).then(slugFolderName => {
        sendFolders(slugFolderName);
      });
    });
  }
  function onRemoveFolder(socket, slugFolderName) {
    dev.logfunction(`EVENT - onRemoveFolder for ${slugFolderName}`);
    // check if allowed
    file.getFolder(slugFolderName).then(foldersData => {
      if(!auth.hasFolderAuth(socket.id,foldersData,slugFolderName)) { return; }

      file.removeFolder(slugFolderName).then(() => {
        sendFolders();
      }, function(err, p) {
        dev.error(`Failed to remove folder: ${err}`);
        reject(err);
      });
    }, function(err, p) {
      dev.error(`Failed to remove folder: ${err}`);
      reject(err);
    });
  }

  /**************************************************************** MEDIA ********************************/

  function onListMedias(socket, d) {
    dev.logfunction(`EVENT - onListMedias : ${JSON.stringify(d, null, 4)}`);
    sendMedias(d.slugFolderName, '', socket);
  }

  function createMediaMeta(slugFolderName, slugMediaName, additionalMeta) {
    dev.logfunction(`EVENT - createMediaMeta for ${slugFolderName}/${slugMediaName}`);
    createMediaMeta(slugFolderName, slugMediaName, additionalMeta).then(() => {
      sendMedias(slugFolderName, slugMediaName);
    }, function(err) {
      dev.error(`Failed to list medias! Error: ${err}`);
    });

  }

  function onEditMedia(socket,d) {
    dev.logfunction(`EVENT - onEditMedia for ${d.slugFolderName}/${d.slugMediaName}`);
    file.editMedia(d).then(slugFolderName => {
      sendMedias(slugFolderName, d.slugMediaName);
    });
  }

  function onRemoveMedia(socket, d) {
    dev.logfunction(`EVENT - onRemoveMedia for ${d.slugFoldername}/${d.slugMediaName}`);
    let slugFolderName = d.slugFolderName;
    let slugMediaName = d.slugMediaName;
    file.removeMedia(slugFolderName, slugMediaName).then(() => {
      sendMedias(slugFolderName, '');
    }, function(err, p) {
      dev.error(`Failed to remove media: ${err}`);
      reject(err);
    });
  }


  /**************************************************************** GENERAL ********************************/

  function sendMedias(slugFolderName, slugMediaName, socket) {
    dev.logfunction(`COMMON - sendMedias for ${slugFolderName}`);

    file.getFolder(slugFolderName).then(foldersData => {
      file.getMedia(slugFolderName, slugMediaName).then(mediasData => {

        Object.keys(io.sockets.connected).forEach(sid => {
          if(socket) {
            if(socket.id !== sid) {
              return;
            }
          }
          let thisSocket = socket || io.sockets.connected[sid];
          let filteredMediasData = {[slugFolderName]: {medias: auth.filterMedias(sid, foldersData, slugFolderName, mediasData)}};

          if(slugMediaName) {
            api.sendEventWithContent('listMedia',  filteredMediasData, io, thisSocket);
          } else {
            api.sendEventWithContent('listMedias',  filteredMediasData, io, thisSocket);
          }
        });

        // TODO : check client permissions, send public or all medias depending on this
      }, function(err) {
        dev.error(`Failed to list medias! Error: ${err}`);
      });
    }, function(err, p) {
      dev.error(`Failed to get folders data: ${err}`);
      reject(err);
    });
  }


  function sendFolders(slugFolderName, socket) {
    dev.logfunction(`COMMON - sendFolders for ${slugFolderName}`);

    file.getFolder(slugFolderName).then(foldersData => {
      // check if single socket or multiple sockets
      Object.keys(io.sockets.connected).forEach(sid => {
        if(socket) {
          if(socket.id !== sid) {
            return;
          }
        }
        let thisSocket = socket || io.sockets.connected[sid];
        let filteredFoldersData = auth.filterFolders(sid, foldersData);
        for(let k in filteredFoldersData) {
          // check if there is any password, if there is then send a placeholder
          if(filteredFoldersData[k].password && filteredFoldersData[k].password !== '') {
            filteredFoldersData[k].password = 'has_pass';
          }
        }
        if(slugFolderName) {
          api.sendEventWithContent('listFolder', filteredFoldersData, io, thisSocket);
        } else {
          api.sendEventWithContent('listFolders', filteredFoldersData, io, thisSocket);
        }
      });
    }, function(err, p) {
      dev.error(`Failed to get folders data: ${err}`);
      reject(err);
    });
  }


  return API;
})();
