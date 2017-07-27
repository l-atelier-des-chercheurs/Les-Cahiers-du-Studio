"use strict";

const
  fs = require('fs-extra'),
  glob = require('glob'),
  path = require('path'),
  mm = require('marky-mark'),
  exec = require('child_process').exec,
  gutil = require('gulp-util'),
  gm = require('gm').subClass({imageMagick: true})
;

const
  local  = require('./local'),
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
    init          : (app, io, electronApp)   => { return init(app, io, electronApp) }
  };

  function init(thisApp, thisIO, thisElectronApp) {
    dev.log(`Initializing socket module`);

    app = thisApp;
    io = thisIO;
    electronApp = thisElectronApp;

    io.on("connection", function(socket){
      var onevent = socket.onevent;
      socket.onevent = function (packet) {
          var args = packet.data || [];
          onevent.call (this, packet);    // original call
          packet.data = ["*"].concat(args);
          onevent.call(this, packet);      // additional call to catch-all
      };
      socket.on("*",function(event,data) {
        dev.log('RECEIVED EVENT : ' + event);
      });

      // I N D E X
/*
      socket.on('newConf', onNewConf);
      socket.on('listConf', function (data){ onListConf(socket); });
      socket.on('listSlides', function (data){ onListSlides(socket, data); });
*/

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
    dev.logfunction( "EVENT - onRemoveUserDirPath");

    if(!d) {

      file.getFolder().then(function(foldersData) {
        sendEventWithContent('listFolder', foldersData, io, socket);
      }, function(error) {
        console.error("Failed to list folders! Error: ", error);
      });

    } else if(d.scope === "folder") {
      file.getFolder(d.slug).then(function(foldersData) {
        sendEventWithContent('listFolder', foldersData, io, socket);
      }, function(error) {
        console.error("Failed to list folders! Error: ", error);
      });
    }
  }

  return API;
})();
