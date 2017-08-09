const
  dev = require('./bin/dev-log'),
  api = require('./bin/api')
;

const file = require('./bin/file');

module.exports = (function() {

  dev.log(`Main module initialized at ${api.getCurrentDate()}`);
  let app;
  let io;
  let electronApp;

  // This var stores all session ID and the folder they are authorized to edit
  let usersAuthorizations = {};

  const API = {
    init          : (app, io, electronApp)   => { return init(app, io, electronApp); },
    createMediaMeta : (slugFolderName, slugMediaName) => { return createMediaMeta(slugFolderName, slugMediaName); },
  };

  function init(thisApp, thisIO, thisElectronApp) {
    dev.log(`Initializing socket module`);

    app = thisApp;
    io = thisIO;
    electronApp = thisElectronApp;

    io.on('connection', function(socket){
      var onevent = socket.onevent;
      socket.onevent = function (packet) {
        var args = packet.data || [];
        onevent.call (this, packet);    // original call
        packet.data = ['*'].concat(args);
        onevent.call(this, packet);      // additional call to catch-all
      };
      socket.on('*',function(event,data) { dev.log(`RECEIVED EVENT: ${event}`); });

      socket.on('authenticate', function(data) { onAuthenticate(socket, data); });

      socket.on('createFolder', function (data){ onCreateFolder(socket,data); });
      socket.on('removeFolder', function (data){ onRemoveFolder(socket,data); });
      socket.on('editFolder', function (data){ onEditFolder(socket,data); });

      socket.on('listMedias', function (data){ onListMedias(socket,data); });
      socket.on('editMedia', function (data){ onEditMedia(socket,data); });
      socket.on('removeMedia', function (data){ onRemoveMedia(socket,data); });
    });
  }

  /**************************************************************** AUTH ********************************/
  function onAuthenticate(socket, d) {
    dev.logfunction(`EVENT - onAuthenticate for ${JSON.stringify(d, null, 4)}`);
    if(d.admin_access !== undefined) {
      // get all folders slugs and passwords
      file.getFolder().then(foldersData => {
        // compare with data we received
        let userListOfFolder = d.admin_access;
        let sessionId = socket.id;

        for(let slugFolderName in userListOfFolder) {
          // if the slug match, and the hashed password matches as well
          if(foldersData[slugFolderName] !== undefined && userListOfFolder[slugFolderName] === foldersData[slugFolderName].password) {

            // add a key "sessionId" in usersAuthorizations and push slugFolderName as a value
            if(!usersAuthorizations.hasOwnProperty(sessionId)) {
              usersAuthorizations[sessionId] = [];
            }
            usersAuthorizations[sessionId].push(slugFolderName);
          }
        }
        // reply to user on which folder auth worked
        api.sendEventWithContent('adminAccess', usersAuthorizations[sessionId], io, socket);
      }, function(err, p) {
        dev.error(`Failed to get folder data: ${err}`);
        reject(err);
      });
    } else {
      dev.error(`Auth: no access data to parse.`);
    }
  }

  /**************************************************************** FOLDER ********************************/
  function onCreateFolder(socket, d) {
    dev.logfunction(`EVENT - onCreateFolder for ${d.name}`);
    file.createFolder(d).then(slugFolderName => {
      file.getFolder(slugFolderName).then(foldersData => {
        api.sendEventWithContent('listFolder', foldersData, io);
      }, function(err, p) {
        dev.error(`Failed to get folder data: ${err}`);
        reject(err);
      });
    }, function(err) {
      dev.error(`Failed to list medias! Error: ${err}`);
    });
  }
  function onEditFolder(socket,d) {
    dev.logfunction(`EVENT - onEditFolder for ${d.slugFolderName}`);
    file.editFolder(d).then(slugFolderName => {
      file.getFolder(slugFolderName).then(foldersData => {
        api.sendEventWithContent('listFolder', foldersData, io);
      }, function(err, p) {
        dev.error(`Failed to get folder data: ${err}`);
        reject(err);
      });
    });
  }
  function onRemoveFolder(socket, slugFolderName) {
    dev.logfunction(`EVENT - onRemoveFolder for ${slugFolderName}`);
    file.removeFolder(slugFolderName).then(() => {
      file.getFolder().then(foldersData => {
        api.sendEventWithContent('listFolders', foldersData, io);
      }, function(err, p) {
        dev.error(`Failed to get all folders data: ${err}`);
        reject(err);
      });
    }, function(err, p) {
      dev.error(`Failed to remove folder: ${err}`);
      reject(err);
    });
  }

  /**************************************************************** MEDIA ********************************/

  function createMediaMeta(slugFolderName, slugMediaName) {
    dev.logfunction(`EVENT - createMediaMeta for ${slugFolderName} with media ${slugMediaName}`);
    file.getMedia(slugFolderName, slugMediaName).then(mediasData => {
      // TODO : only send to authorized clients
      api.sendEventWithContent('mediaCreated', {[slugFolderName]: {medias: mediasData} }, io);
    }, function(err) {
      dev.error(`Failed to list medias! Error: ${err}`);
    });
  }

  function onEditMedia(socket,d) {
    dev.logfunction(`EVENT - onEditMedia for ${d.slugFolderName}/${d.slugMediaName}`);
    file.editMedia(d).then(slugFolderName => {
      file.getMedia(slugFolderName).then(mediasData => {
        // TODO : check client permissions, send public or all medias depending on this
        api.sendEventWithContent('listMedias', {[slugFolderName]: {medias: mediasData} }, io);
      }, function(err) {
        dev.error(`Failed to list medias! Error: ${err}`);
      });
    });
  }

  function onListMedias(socket, d) {
    dev.logfunction(`EVENT - onListMedias : ${JSON.stringify( d, null, 4)}`);
    file.getMedia(d.slugFolderName).then(mediasData => {
      // TODO : check client permissions, send public or all medias depending on this
      api.sendEventWithContent('listMedias', {[d.slugFolderName]: {medias: mediasData} }, io, socket);
    }, function(err) {
      dev.error(`Failed to list medias! Error: ${err}`);
    });
  }

  function onRemoveMedia(socket, d) {
    dev.logfunction(`EVENT - onRemoveMedia for ${d.slugFoldername} and ${d.slugMediaName}`);
    let slugFolderName = d.slugFolderName;
    let slugMediaName = d.slugMediaName;
    file.removeMedia(slugFolderName, slugMediaName).then(() => {
      file.getMedia(slugFolderName).then(mediasData => {
        // TODO : check client permissions, send public or all medias depending on this
        api.sendEventWithContent('listMedias', {[slugFolderName]: {medias: mediasData} }, io);
      }, function(err) {
        dev.error(`Failed to list medias! Error: ${err}`);
      });
    }, function(err, p) {
      dev.error(`Failed to remove folder: ${err}`);
      reject(err);
    });
  }


  return API;
})();
