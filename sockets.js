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
    init          : (app, io, electronApp)   => { return init(app, io, electronApp); }
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
      socket.on('*',function(event,data) {
        dev.log(`RECEIVED EVENT: ${event}`);
      });

      socket.on('listFolders', function (data){ onListFolders(socket,data); });
    });
  }

// ------------- F U N C T I O N S -------------------


  /*
    onListFolders : sans argument = retourne toutes les timelines avec tout leurs contenus (médias avec leurs méta)
    avec arg :
      - scope: overview
      => get all timelines meta without listing medias (used on home page)
      - scope: folder,
        slug: compagnie-3-6-30
      => get this timeline meta + medias and meta
  */
  function onListFolders(socket, d) {
    dev.logfunction(`EVENT - onListFolders with data: ${JSON.stringify(d, null, 4)}`);
    if(!d || !d.scope) {
      dev.error(`Missing arg/instruction for listing folders`);
    }

    switch (d.scope) {
      case 'all':
        file.getFolder().then(function(foldersData) {
          sendEventWithContent('listFolder', foldersData, io, socket);
        }, function(error) {
          dev.error(`Failed to list folders! Error: ${error}`);
        });
        break;
      case 'folder':
        file.getFolder(d.slug).then(function(foldersData) {
          sendEventWithContent('listFolder', foldersData, io, socket);
        }, function(error) {
          dev.error(`Failed to list folders! Error: ${error}`);
        });
        break;
    }
  }

  return API;
})();
