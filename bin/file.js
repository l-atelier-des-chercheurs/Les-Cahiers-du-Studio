const
  path = require('path'),
	moment = require('moment'),
  parsedown = require('dodoc-parsedown'),
  fs = require('fs-extra')
;

const
  local  = require('../local'),
  dev = require('./dev-log')
;

module.exports = (function() {

  const API = {
    getFolderPath          : (slugFolderName = '') => { return getFolderPath(slugFolderName) },
    getFolder              : (slugFolderName = '') => { return getFolder(slugFolderName) },
    getMetaFileOfFolder    : (slugFolderName) => { return getMetaFileOfFolder(slugFolderName); },
    readFolderMeta         : (slugFolderName) => { return readFolderMeta(slugFolderName); },

    createMediaMeta        : (path, mediaFileName, metaFileName = '') => { return createMediaMeta(path, mediaFileName, metaFileName); }
  };

  function getFolderPath(slugFolderName) {
    dev.logfunction(`COMMON — getFolderPath: ${slugFolderName}`);
    return path.join(getUserPath(), local.settings().contentDirname, slugFolderName);
  }
  function getUserPath() {
    return global.pathToUserContent;
  }

  function getMetaFileOfFolder(slugFolderName) {
    let path = getFolderPath(slugFolderName);
    let metaPath = path.join(path, local.settings().folderMetafilename + local.settings().metaFileext);
    return metaPath;
  }

  function readFolderMeta(slugFolderName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — readFolderMeta: ${slugFolderName}`);
      var metaFolderPath = getMetaFileOfFolder(slugFolderName);
      var folderData = readMetaFile(metaFolderPath);
      resolve(folderData);
    });
  }

  function readMetaFile(metaPath){
    dev.logfunction(`COMMON — readMetaFile: ${metaPath}`);
    var metaFileContent = fs.readFileSync(metaPath, local.settings().textEncoding);
    var metaFileContentParsed = parseData( metaFileContent);
    return metaFileContentParsed;
  }

  function getFolder(slugFolderName) {
    return new Promise(function(resolve, reject) {

      // on cherche tous les dossiers du dossier de contenu

      fs.readdir(getFolderPath(), function (err, filenames) {
        if (err) return console.log( 'Couldn\'t read content dir : ' + err);

        var folders = filenames.filter( function(slugFolderName){ return new RegExp("^([^.]+)$", 'i').test( slugFolderName); });
        dev.logverbose( "Number of folders in " + getFolderPath() + " = " + folders.length + ". Folders are " + folders);

        var foldersProcessed = 0;
        var allFoldersData = [];
        folders.forEach( function( slugFolderName) {

          if( new RegExp("^([^.]+)$", 'i').test( slugFolderName)
          && slugFolderName.indexOf( local.settings().deletedPrefix)){
            var fmeta = getFolderMeta( slugFolderName);
            fmeta.slugFolderName = slugFolderName;
            allFoldersData.push( fmeta);
          }

          foldersProcessed++;
          if( foldersProcessed === folders.length && allFoldersData.length > 0) {
            console.log( "- - - - all folders JSON have been processed.");
            resolve( allFoldersData);
          }
        });
      });
    });
  }

  function createMediaMeta(path, mediaFileName, metaFileName) {
    return new Promise(function(resolve, reject) {
      dev.logverbose(`Will create a new meta file for media ${mediaFileName} for conf ${path}`);

      // If no metaFileName, we will deduce metaFileName from mediaFileName
      if(metaFileName === '') {
        var fileNameWithoutExtension = new RegExp( local.settings().regexpRemoveFileExtension, 'i').exec( mediaFileName)[1];
        metaFileName = fileNameWithoutExtension + local.settings().metaFileext;
      }

      // check that a meta with this name doesn't exist already
      api.findFirstFilenameNotTaken(path, metaFileName).then(function(metaFileName) {

        var newPathToMeta = path.join(path, metaFileName);
        var newPathToMedia = path.join(path, mediaFileName);

        try {
          var dimension = sizeOf(newPathToMedia);
          if(typeof dimension !== undefined)
            var mediaRatio = dimension.height / dimension.width;
        } catch(err) {}

        var mdata =
        {
          "name" : mediaFileName,
          "created" : api.getCurrentDate(),
          "modified" : api.getCurrentDate(),
        };
        if(mediaRatio !== undefined) {
          mdata['ratio'] = mediaRatio;
        }

        dev.logverbose("Saving JSON string " + JSON.stringify(mdata, null, 4));
        api.storeData( newPathToMeta, mdata, 'create').then(function( meta) {
          console.log( "New media meta file created at path " + newPathToMeta + " with meta : " + meta);
          resolve(meta);
        }, function(err) {
          console.log(gutil.colors.red('--> Couldn\'t create media meta.'));
          reject( 'Couldn\'t create media meta ' + err);
        });
      }, function(err) {
        console.log(gutil.colors.red('--> Couldn\'t find meta filename to use.'));
        reject( 'Couldn\'t find meta filename to use ' + err);
      });
    });
  }


  return API;
})();