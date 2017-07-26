const path = require('path'),
	moment = require('moment'),
  parsedown = require('woods-parsedown'),
  fs = require('fs-extra')
;

const
  local  = require('../local'),
  dev = require('./dev-log')
;

module.exports = (function() {

  const API = {
    getFolderPath          : (slugFolderName = '') => { return getFolderPath(slugFolderName) },
    getFolder              : (slug = '') => { return getFolder(slug) },
    getMetaFileOfFolder    : (slugFolderName) => { return getMetaFileOfFolder(slugFolderName); },
    readFolderMeta         : (slugFolderName) => { return readFolderMeta(slugFolderName); },
  }

  function getFolderPath(slugFolderName) {
    dev.logfunction( "COMMON — getFolderPath : " + slugFolderName);
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
      dev.logfunction( "COMMON — readConfMeta: " + slugFolderName);
      var metaFolderPath = getMetaFileOfFolder(slugFolderName);

      readMetaFile(metaFolderPath);
      var folderData = fs.readFileSync(metaFolderPath, );
      var folderMetadata = parseData(folderData);

      resolve(folderMetadata);
    });
  }

  function readMetaFile(metaPath){
    var metaFileContent = fs.readFileSync(metaPath, local.settings().textEncoding);
    var metaFileContentParsed = parseData( metaFileContent);
    return metaFileContentParsed;
  }

  function getFolder(slug) {
    return new Promise(function(resolve, reject) {

      // on cherche tous les dossiers du dossier

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

  return API;
})();