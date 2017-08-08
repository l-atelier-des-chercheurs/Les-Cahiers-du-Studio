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
      socket.on('listMedias', function (data){ onListMedias(socket,data); });
      socket.on('createFolder', function (data){ onCreateFolder(socket,data); });
      socket.on('removeFolder', function (data){ onRemoveFolder(socket,data); });
      socket.on('editFolder', function (data){ onEditFolder(socket,data); });
      socket.on('editMedia', function (data){ onEditMedia(socket,data); });
    });
  }

  // ------------- F U N C T I O N S -------------------
  function onListMedias(socket, d) {
    dev.logfunction(`EVENT - onListMedias : ${JSON.stringify( d, null, 4)}`);
    file.getMedia(d.slugFolderName).then(mediasData => {
      // TODO : check client permissions, send public or all medias depending on this
      api.sendEventWithContent('listMedias', {[d.slugFolderName]: {medias: mediasData} }, io, socket);
    }, function(err) {
      dev.error(`Failed to list medias! Error: ${err}`);
    });
  }
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

  function createMediaMeta(slugFolderName, slugMediaName) {
    dev.logfunction(`EVENT - createMediaMeta for ${slugFolderName} with media ${slugMediaName}`);
    file.getMedia(slugFolderName, slugMediaName).then(mediasData => {
      // TODO : only send to authorized clients
      api.sendEventWithContent('mediaCreated', {[slugFolderName]: {medias: mediasData} }, io);
    }, function(err) {
      dev.error(`Failed to list medias! Error: ${err}`);
    });
  }

  return API;
})();
