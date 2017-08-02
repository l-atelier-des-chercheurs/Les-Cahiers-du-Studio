const
  path = require('path'),
  fs = require('fs-extra'),
  imageSize = require('image-size')
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
    createMediaMeta        : (slugFolderName, mediaFileName) => { return createMediaMeta(slugFolderName, mediaFileName); }
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
  function readMediaMeta(slugFolderName,slugMediaName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — readMediaMeta: slugFolderName = ${slugFolderName} & slugMediaName = ${slugMediaName}`);

      // pour chaque item, on regarde s’il contient un fichier méta (même nom + .txt)
      let mediaPath = path.join(getFolderPath(slugFolderName), slugMediaName);
      let potentialMetaFile = mediaPath + local.settings().metaFileext;

      fs.access(potentialMetaFile, fs.F_OK, function(err) {
        // if there's nothing at path
        if(err) {
          dev.logverbose(`No meta for this media: ${err}`);
          // let’s get creation date and modification date, guess the type, and return this whole thing afterwards
          createMediaMeta(slugFolderName, slugMediaName).then(function(mediaData) {
            resolve(mediaData);
          });

        } else {
          dev.logverbose(`Found meta for this media.`);
          let mediaData = readMetaFile(potentialMetaFile);
          resolve(mediaData);
        }
      });


    });
  }


  function readMetaFile(metaPath){
    dev.logfunction(`COMMON — readMetaFile: ${metaPath}`);
    var metaFileContent = fs.readFileSync(metaPath, local.settings().textEncoding);
    var metaFileContentParsed = api.parseData(metaFileContent);
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

        var folders = filenames.filter(function(thisSlugFolderName){
          dev.logverbose(`Checking ${thisSlugFolderName}`);
          dev.logverbose(`Results ${new RegExp(local.settings().regexpMatchFolderNames, 'i').test(thisSlugFolderName)}`);
            // is a folder
          return new RegExp(local.settings().regexpMatchFolderNames, 'i').test(thisSlugFolderName) &&
            // if slugFolderName isset, filter to get only requested folder
            (slugFolderName !== '' ? thisSlugFolderName === slugFolderName : true) &&
            slugFolderName.indexOf(local.settings().deletedPrefix)
          ;
        });

        dev.logverbose(`Number of folders in ${mainFolderPath} = ${folders.length}. Folder(s) is(are) ${folders}`);

        var allFoldersData = [];
        folders.forEach((slugFolderName) => {
          let fmeta = new Promise((resolve, reject) => {
            readFolderMeta(slugFolderName).then((meta) => {
              meta.slugFolderName = slugFolderName;
              resolve(meta);
            });
          });
          allFoldersData.push(fmeta);
        });
        Promise.all(allFoldersData).then((parsedFoldersData) => {
          dev.logverbose(`All folders meta have been processed`, JSON.stringify(parsedFoldersData, null, 4));
          // reunite array items as a single big object
          let flatObjFoldersData = {};
          parsedFoldersData.forEach((fmeta) => {
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

        dev.logverbose(`Found this many (${filenames.length}) filenames: ${filenames}`);
        let medias = filenames.filter(function(thisSlugMediaName){
            // not a folder
          return !new RegExp( local.settings().regexpMatchFolderNames, 'i').test(thisSlugMediaName) &&
            // not meta.txt
            thisSlugMediaName !== local.settings().folderMetafilename + local.settings().metaFileext &&
            // not a text file
            new RegExp( local.settings().regexpGetFileExtension, 'i').exec(thisSlugMediaName)[0] !== '.txt' &&
            // not deleted
            thisSlugMediaName.indexOf(local.settings().deletedPrefix) &&
            // not a dotfile
            thisSlugMediaName.indexOf('.') !== 0

            ;
        });
        dev.logverbose(`Number of actual medias in ${slugFolderPath} = ${medias.length}. Media(s) is(are) ${medias}`);

        if(medias.length === 0) {
          dev.logverbose(`Since no medias is in this folder, let’s abort right there.`);
          resolve(`No medias in this folder.`);
        } else {
          var allMediasData = [];
          medias.forEach(function(slugMediaName) {
            let fmeta = new Promise((resolve, reject) => {
              readMediaMeta(slugFolderName,slugMediaName).then((meta) => {
                meta.slugMediaName = slugMediaName;
                resolve(meta);
              });
            });
            allMediasData.push(fmeta);
          });

          Promise.all(allMediasData).then((parsedMediasData) => {
            dev.logverbose(`All medias meta have been processed`, JSON.stringify(parsedMediasData, null, 4));
            // reunite array items as a single big object
            let flatObjMediasData = {};
            parsedMediasData.forEach((fmeta) => {
              flatObjMediasData[fmeta.slugMediaName] = fmeta;
            });
            resolve(flatObjMediasData);
          });
        }

      });
    });
  }

  function createMediaMeta(slugFolderName, slugMediaName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — createMediaMeta : will create a new meta file for media ${slugMediaName} in folder ${slugFolderName}`);

      let mediaPath = path.join(getFolderPath(slugFolderName), slugMediaName);
      let potentialMetaFile = mediaPath + local.settings().metaFileext;

      // check that a meta with this name doesn't exist already
      fs.access(potentialMetaFile, fs.F_OK, function(err) {
        // if there's nothing at path, we’re all good
        if(err) {

          // TODO : créer le thumb
          let stats = fs.statSync(mediaPath);
          let birthtime = api.convertDate(new Date(stats.birthtime));
          let mtime = api.convertDate(new Date(stats.mtime));

          let mdata = {
            created : birthtime,
            modified : mtime,
            public: false,
          };

          try {
            let dimension = imageSize(mediaPath);
            let mediaRatio = typeof dimension !== undefined ? dimension.height / dimension.width : undefined;
            if(mediaRatio !== undefined) { mdata.ratio = mediaRatio; }
          } catch(err) {
            dev.error(`Failed to get size of media. Error: ${err}`);
          }

          dev.logverbose(`Saving JSON string ${JSON.stringify(mdata, null, 4)}`);
          api.storeData(potentialMetaFile, mdata, 'create').then(function(meta) {
            dev.logverbose(`New media meta file created at path: ${potentialMetaFile} with meta: ${meta}`);
            resolve(meta);
          }, function(err) {
            reject(`Couldn't create media meta : ${err}`);
          });

        } else {
          // otherwise, something’s weird
          dev.error(`Found existing meta! Weird.`);
          reject();
        }
      });

    });
  }


  return API;
})();