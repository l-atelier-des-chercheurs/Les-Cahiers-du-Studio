const
  path = require('path'),
  fs = require('fs-extra')
;

const
  local  = require('../local'),
  api  = require('./api'),
  dev = require('./dev-log')
;

module.exports = (function() {

  const API = {

    getFolderPath          : (slugFolderName = '') => { return getFolderPath(slugFolderName); },
    getFolder              : (slugFolderName = '') => { return getFolder(slugFolderName); },
    getMetaFileOfFolder    : (slugFolderName) => { return getMetaFileOfFolder(slugFolderName); },

    getMedia               : (slugFolderName, slugMediaName) => { return getMedia(slugFolderName, slugMediaName); },


    createMediaMeta        : (path, mediaFileName, metaFileName = '') => { return createMediaMeta(path, mediaFileName, metaFileName); }
  };

  function getFolderPath(slugFolderName = '') {
    dev.logfunction(`COMMON — getFolderPath: ${slugFolderName}`);
    return path.join(getUserPath(), slugFolderName);
  }
  function getUserPath() {
    return global.pathToUserContent;
  }
  function getMetaFileOfFolder(slugFolderName) {
    let folderPath = getFolderPath(slugFolderName);
    let metaPath = path.join(folderPath, local.settings().folderMetafilename + local.settings().metaFileext);
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
    var metaFileContentParsed = api.parseData( metaFileContent);
    return metaFileContentParsed;
  }

  function getFolder(slugFolderName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — getFolder: ${slugFolderName}`);
      let mainFolderPath = getFolderPath();
      dev.logverbose(`Main folder path: ${mainFolderPath}`);
      // on cherche tous les dossiers du dossier de contenu
      fs.readdir(mainFolderPath, function (err, filenames) {
        dev.logverbose(`Found filenames: ${filenames}`);
        if(err) { dev.error(`Couldn't read content dir: ${err}`); reject(err); }
        if(filenames === undefined) { dev.error(`No folder found: ${err}`); reject(err); }

        // only get folders
        var folders = filenames.filter( function(slugFolderName){ return new RegExp( local.settings().regexpMatchFolderNames, 'i').test(slugFolderName); });
        dev.logverbose(`Number of folders in ${mainFolderPath} = ${folders.length}. Folder(s) is(are) ${folders}`);

        var allFoldersData = [];
        folders.forEach((slugFolderName) => {
          if( new RegExp( local.settings().regexpMatchFolderNames, 'i').test( slugFolderName) && slugFolderName.indexOf(local.settings().deletedPrefix)){
            let fmeta = new Promise((resolve, reject) => {
              readFolderMeta(slugFolderName).then((meta) => {
                meta.slugFolderName = slugFolderName;
                resolve(meta);
              });
            });
            allFoldersData.push(fmeta);
          }
        });
        Promise.all(allFoldersData).then((allFoldersData) => {
          dev.logverbose(`All folders meta have been processed`, JSON.stringify(allFoldersData, null, 4));
          // reunite array items as a single big object
          let flatObjFoldersData = {};
          allFoldersData.forEach((fmeta) => {
            flatObjFoldersData[fmeta.slugFolderName] = fmeta;
          });
          resolve(flatObjFoldersData);
        });
      });
    });
  }

  function getMedia(slugFolderName, slugMediaName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — getMedia`);
      if(slugFolderName === undefined) {
        dev.error(`Missing slugFolderName to read medias from.`);
        reject();
      }
      if(slugMediaName === undefined) {
        dev.logverbose(`Missing slugMediaName to read medias from ${slugFolderName}. Reading all medias instead.`);
      }
      dev.logverbose(`COMMON — getMedia — folder: ${slugFolderName}`);

      let slugFolderPath = getFolderPath(slugFolderName);
      // on cherche tous les dossiers du dossier de contenu
      fs.readdir(slugFolderPath, function (err, filenames) {
        if(err) { dev.error(`Couldn't read content dir: ${err}`); reject(err); }
        if(filenames === undefined) { dev.error(`No medias for folder found: ${err}`); resolve(); }

        dev.logverbose(`Found filenames: ${filenames}`);
        // pour chaque item qui n'est ni le fichier meta, ni un autre dossier, ni un fichier txt (méta)
        let medias = filenames.filter(function(slugFolderName){
          return
          // not a folder
          !new RegExp( local.settings().regexpMatchFolderNames, 'i').test(slugFolderName)
          // not meta
          && slugFolderName !== local.settings().folderMetafilename + local.settings().metaFileext
          // not
          && new RegExp( local.settings().regexpGetFileExtension, 'i').exec(slugFolderName)[0] !== '.txt';
        });
        dev.logverbose(`Number of actual medias in ${slugFolderPath} = ${medias.length}. Media(s) is(are) ${medias}`);

        if(medias.length === 0) {
          dev.logverbose(`Since no medias is in this folder, let’s abort right there.`)
          resolve(`No medias in this folder.`);
        } else {
          // pour chaque item, on regarde s’il contient un fichier méta (même nom + .txt)

          // si oui, on le lis et ces métas sont renvoyés dans l’autre sens

          // si non, on lit la date de création et modification et on retourne


          var allMediasData = [];
          medias.forEach(function(slugFolderName) {
            if( new RegExp( local.settings().regexpMatchFolderNames, 'i').test( slugFolderName) && slugFolderName.indexOf(local.settings().deletedPrefix)){
              let fmeta = new Promise((resolve, reject) => {
                readFolderMeta(slugFolderName).then((meta) => {
                  let metaWithKey = {};
                  metaWithKey[slugFolderName] = meta;
                  resolve(metaWithKey);
                });
              });
              allMediasData.push(fmeta);
            }
          });
          Promise.all(allFoldersData).then((allMediasData) => {
            dev.logverbose(`All folders meta have been processed`, JSON.stringify(allMediasData, null, 4));
            resolve(allFoldersData);
          });
        }

      });
    });
  }

  function createMediaMeta(atPath, mediaFileName, metaFileName) {
    return new Promise(function(resolve, reject) {
      dev.logverbose(`Will create a new meta file for media ${mediaFileName} for folder ${atPath}`);

      // If no metaFileName, we will deduce metaFileName from mediaFileName
      if(metaFileName === '') {
        var fileNameWithoutExtension = new RegExp( local.settings().regexpRemoveFileExtension, 'i').exec( mediaFileName)[1];
        metaFileName = fileNameWithoutExtension + local.settings().metaFileext;
      }

      // check that a meta with this name doesn't exist already
      api.findFirstFilenameNotTaken(atPath, metaFileName).then(function(metaFileName) {

        var newPathToMeta = path.join(atPath, metaFileName);

        var mdata =
        {
          name : mediaFileName,
          created : api.getCurrentDate(),
          modified : api.getCurrentDate(),
        };
        if(mediaRatio !== undefined) {
          mdata['ratio'] = mediaRatio;
        }

        dev.logverbose(`Saving JSON string ${JSON.stringify(mdata, null, 4)}`);
        api.storeData( newPathToMeta, mdata, 'create').then(function( meta) {
          console.log(`New media meta file created at path: ${newPathToMeta} with meta: ${meta}`);
          resolve(meta);
        }, function(err) {
          console.log(gutil.colors.red(`--> Couldn’t create media meta.`));
          reject(`Couldn't create media meta : ${err}`);
        });
      }, function(err) {
        reject(err);
      });
    });
  }


  return API;
})();