const path = require('path'),
	moment = require('moment'),
  parsedown = require('woods-parsedown'),
  fs = require('fs-extra')
;

const settings  = require('../settings'),
  dev = require('./dev-log')
;

module.exports = (function() {

  const API = {
    getTimeline              : (slug = '')  => { return getTimeline(path) }
  }


  function listFolders() {
    return new Promise(function(resolve, reject) {
      //
      fs.readdir( api.getContentPath(), function (err, filenames) {
        if (err) return console.log( 'Couldn\'t read content dir : ' + err);

        var folders = filenames.filter( function(slugFolderName){ return new RegExp("^([^.]+)$", 'i').test( slugFolderName); });
        console.log( "Number of folders in " + api.getContentPath() + " = " + folders.length + ". Folders are " + folders);

        var foldersProcessed = 0;
        var allFoldersData = [];
        folders.forEach( function( slugFolderName) {

          if( new RegExp("^([^.]+)$", 'i').test( slugFolderName)
          && slugFolderName.indexOf( settings.deletedPrefix)){
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