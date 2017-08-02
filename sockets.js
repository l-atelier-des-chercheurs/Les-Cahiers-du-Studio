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
