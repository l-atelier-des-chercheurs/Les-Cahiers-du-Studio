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
  settings  = require('./settings'),
  dev = require('./bin/dev-log'),
  api = require('./bin/api'),
  file = require('./bin/file')
;


module.exports = function() {

  console.log("Main module initialized");
  console.log(api.getCurrentDate('X'));
  console.log(api.getCurrentDate());

  let app;
  let io;
  let electronApp;

  const API = {
    init          : (app, io, electronApp)   => { return init(app, io, electronApp) }
  };

  function init(thisApp, thisIO, thisElectronApp) {
    dev.log("Initializing socket module");

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

/*
  function onListConf( socket){
    console.log( "EVENT - onListConf");
    listAllFolders().then(function( allFoldersData) {
      sendEventWithContent( 'listAllFolders', allFoldersData, socket);
    }, function(error) {
      console.error("Failed to list folders! Error: ", error);
    });
  }

  function onNewConf( confData) {
    console.log('New Conf: '+ confData);
    createNewConf(confData).then(function(newpdata) {
      console.log('newpdata: '+newpdata);
      sendEventWithContent('confCreated', newpdata);
    }, function(errorpdata) {
      console.error("Failed to create a new folder! Error: ", errorpdata);
      sendEventWithContent('confAlreadyExist', errorpdata);
    });
  }
  // F I N      I N D E X

  function onListSlides( socket, dataFolder) {
    dev.logfunction( "EVENT - onListSlides");
    api.readConfMeta(dataFolder.slugFolderName).then(function(confMeta) {
      dev.logverbose('just read conf meta, confMeta.slides.length = ' + confMeta.slides.length);
      // if no slides to show, or one slide that's just empty text
      if(confMeta.slides.length === 0 || (confMeta.slides.length === 1 && confMeta.slides[0] === ''))
        return;
      var confSlidesData = new Array();
      for(var slideName of confMeta.slides) {
        dev.logverbose('Slide : ' + slideName);
        var mediaMeta = getMediaMeta(dataFolder.slugFolderName, slideName);
        mediaMeta.metaName = slideName;
        confSlidesData.push(mediaMeta);
        dev.logverbose('new media meta added');
      }
      dev.logverbose('sending data : ' + JSON.stringify(confSlidesData));
      sendEventWithContent( 'listAllSlides', confSlidesData, socket);
    }, function(error) {
      console.error("Failed to list slides! Error: ", error);
    });
  }

  function onMediaNewPos(slidePos) {
    var slideNameWE = new RegExp( settings.regexpRemoveFileExtension, 'i').exec(slidePos.mediaName)[1];
    var mediaMeta = getMediaMeta(slidePos.slugFolderName, slideNameWE);
    mediaMeta.posX = Math.max(slidePos.posX,0);
    mediaMeta.posY = slidePos.posY;
    updateMediaMeta(slidePos.slugFolderName, slideNameWE, mediaMeta).then(function(mediaNewMeta) {
      sendEventWithContent( 'updateOneSlide', mediaNewMeta);
    }, function(error) {
      console.error("Failed to update media meta! Error: ", error);
    });
  }

  function onMediaNewSize(slideWidth) {
    var slideNameWE = new RegExp( settings.regexpRemoveFileExtension, 'i').exec(slideWidth.mediaName)[1];
    var mediaMeta = getMediaMeta(slideWidth.slugFolderName, slideNameWE);
    mediaMeta.width = slideWidth.width;
    if(!mediaMeta.hasOwnProperty('ratio'))
      mediaMeta.height = slideWidth.height;
    updateMediaMeta(slideWidth.slugFolderName, slideNameWE, mediaMeta).then(function(mediaNewMeta) {
      sendEventWithContent( 'updateOneSlide', mediaNewMeta);
    }, function(error) {
      console.error("Failed to update media meta! Error: ", error);
    });
  }



  // CONF METHOD
  function createNewConf( confData) {
    return new Promise(function(resolve, reject) {
      console.log("COMMON — createNewFolder");

      var confName = confData.titre;
      var confLieu = confData.lieu;
      var confDate= confData.date;
      var confAuth = confData.auteur;
      var confIntro = confData.introduction;
      var slugFolderName = slugg(confName);
      var confPath = api.getContentPath(slugFolderName);
      var currentDateString = api.getCurrentDate();

      fs.access(confPath, fs.F_OK, function( err) {
        // if there's nothing at path
        if (err) {
          console.log("New conf created with name " + confName + " and path " + confPath);
          fs.ensureDirSync(confPath);//write new folder in folders
          var fmeta =
            {
              "name" : confName,
              "introduction" : confIntro,
              "lieu" : confLieu,
              "date" : confDate,
              "auteur": confAuth,
              "created" : currentDateString,
            };
          api.storeData( getMetaFileOfFolder(confPath), fmeta, "create").then(function( meta) {
            console.log('sucess ' + meta)
            resolve( meta);
          }, function(err) {
            console.log( gutil.colors.red('--> Couldn\'t create conf meta.'));
            reject( 'Couldn\'t create conf meta ' + err);
          });

        } else {
          // if there's already something at path
          console.log("WARNING - the following folder name already exists: " + slugFolderName);
          var objectJson = {
            "name": confName,
            "timestamp": currentDateString
          };
          reject( objectJson);
        }
      });

    });
  }


  function getMetaFileOfFolder(folderPath) {
    console.log(`COMMON — getMetaFileOfFolder ${folderPath}`);
    return path.join(folderPath, settings.confMetafilename + settings.metaFileext);
  }


  // should remove this function to replace with
  function getFolderMeta( slugFolderName) {
    console.log(`COMMON — getFolderMeta for ${slugFolderName}`);

    var folderPath = api.getContentPath(slugFolderName);
    var folderMetaFile = getMetaFileOfFolder( folderPath);

    var folderData = fs.readFileSync( folderMetaFile,settings.textEncoding);
    var folderMetadata = api.parseData( folderData);

    return folderMetadata;
  }

  function storeData( mpath, d, e) {
    return new Promise(function(resolve, reject) {
      console.log('Will store data');
      var textd = api.textifyObj(d);
      if( e === "create") {
        fs.appendFile( mpath, textd, function(err) {
          if (err) { console.log('Failed to create new meta file'); reject( err); }
          resolve(api.parseData(textd));
        });
      }
        if( e === "update") {
        fs.writeFile( mpath, textd, function(err) {
          if (err) { console.log('Failed to update new meta file'); reject( err); }
          resolve(api.parseData(textd));
        });
      }
    });
  }

  function getMediaMeta( slugFolderName, fileNameWithoutExtension) {
      dev.logfunction( "COMMON — getMediaMeta : slugFolderName = " + slugFolderName + " n = " + fileNameWithoutExtension);
      var confPath = api.getContentPath(slugFolderName);
      dev.logverbose( 'confPath = ' + confPath);
      var mediaMetaPath = path.join(confPath, fileNameWithoutExtension + settings.metaFileext);
      dev.logverbose( 'mediaMetaPath = ' + mediaMetaPath);

      try{
        fs.accessSync( mediaMetaPath, fs.F_OK);
      } catch(err) {
        console.log( gutil.colors.red('-->Couldn’t find media metafile at path ' + mediaMetaPath));
        return new Error('Couldn’t find media metafile');
      }

      var mediaData = fs.readFileSync(mediaMetaPath, settings.textEncoding);
      var mediaMetaData = api.parseData(mediaData);

      // update last acess and edit date of metafile and file
//       fs.utimesSync(mediaMetaPath, api.getCurrentDate('X'), api.getCurrentDate('X'));
//       fs.utimesSync(path.join(confPath, mediaMetaData.name), api.getCurrentDate('X'), api.getCurrentDate('X'));

      dev.logverbose( "COMMON — getMediaMeta : data was parsed and mediaMetaData = " + JSON.stringify(mediaMetaData));
    return mediaMetaData;
  }

  function updateMediaMeta( slugFolderName, fileNameWithoutExtension, newMediaMeta) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — updateMediaMeta : slugFolderName = " + slugFolderName + " fileNameWithoutExtension = " + fileNameWithoutExtension);
      var confPath = api.getContentPath(slugFolderName);
      var mediaMetaPath = path.join(confPath, fileNameWithoutExtension + settings.metaFileext);
      api.storeData( mediaMetaPath, newMediaMeta, 'update').then(function( meta) {
        console.log('just stored new media meta');
        resolve(meta);
      }, function(err) {
        console.log( gutil.colors.red('--> Couldn\'t update media meta.'));
        reject( 'Couldn\'t update media meta ' + err);
      });
    });
  }


// - - - END FUNCTIONS - - -


  function getFolderPath(slugFolderName) {
    dev.logfunction( "COMMON — getFolderPath : " + slugFolderName);
    return path.join(api.getContentPath(), dodoc.settings().contentDirname, slugFolderName);
  }
*/


  return API;
}
