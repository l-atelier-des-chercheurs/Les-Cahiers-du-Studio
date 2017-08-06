const
  path = require('path'),
  fs = require('fs-extra'),
  imageSize = require('image-size'),
  sharp = require('sharp'),
  mkdirp = require('mkdirp'),
  validator = require('validator')
;

const
  local  = require('../local'),
  api  = require('./api'),
  dev = require('./dev-log')
;

module.exports = (function() {

  const API = {
    getFolderPath       : (slugFolderName = '') => { return getFolderPath(slugFolderName); },
    getFolder           : (slugFolderName) => { return getFolder(slugFolderName); },
    getMetaFileOfFolder : (slugFolderName) => { return getMetaFileOfFolder(slugFolderName); },
    getMedia            : (slugFolderName, slugMediaName) => { return getMedia(slugFolderName, slugMediaName); },
    createMediaMeta     : (slugFolderName, mediaFileName) => { return createMediaMeta(slugFolderName, mediaFileName); },
    createFolder        : (fdata) => { return createFolder(fdata); },
    removeFolder        : (slugFolderName) => { return removeFolder(slugFolderName); }
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
            // is a folder
          return new RegExp(local.settings().regexpMatchFolderNames, 'i').test(thisSlugFolderName) &&
            // if slugFolderName isset, filter to get only requested folder
            (slugFolderName !== undefined ? thisSlugFolderName === slugFolderName : true) &&
            // if not deleted
            thisSlugFolderName.indexOf(local.settings().deletedPrefix) !== 0 &&
            // if not local.settings().thumbFolderName
            thisSlugFolderName !== local.settings().thumbFolderName
          ;
        });

        dev.logverbose(`Number of folders in ${mainFolderPath} = ${folders.length}. Folder(s) is(are) ${folders}`);

        var allFoldersData = [];
        folders.forEach((slugFolderName) => {
          let fmeta = new Promise((resolve, reject) => {
            readFolderMeta(slugFolderName).then((meta) => {
              meta.slugFolderName = slugFolderName;
              meta.medias = {};
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
      dev.logverbose(`COMMON — getMedia — folder: ${slugFolderName} — media: ${slugMediaName}`);

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
            thisSlugMediaName.indexOf('.') !== 0 &&
            // if has slugMediaName, only if it matches
            (slugMediaName !== undefined ? thisSlugMediaName === slugMediaName : true)
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

          let mediaFileExtension = new RegExp(local.settings().regexpGetFileExtension, 'i').exec(slugMediaName)[0];
          dev.logverbose(`Trying to guess filetype from extension: ${mediaFileExtension}`);
          switch(mediaFileExtension.toLowerCase()) {
            case '.mp4':
              mdata.type = 'video';
              break;
            case '.mp3':
              mdata.type = 'audio';
              break;
            default:
              mdata.type = 'image';
          }

          // attempt to create a thumb file
          let makeThumbs = [];

          if(mdata.type === 'image') {
            let thumbResolutions = [200,600,1800];
            thumbResolutions.forEach((thumbRes) => {
              let makeThumb = new Promise((resolve, reject) => {
                _makeImageThumb(mediaPath, slugFolderName, slugMediaName, thumbRes).then((thumbPath) => {
                  let thumbMeta = {
                    path: thumbPath,
                    size: thumbRes
                  };
                  resolve(thumbMeta);
                });
              });
              makeThumbs.push(makeThumb);
            });
          }

          Promise.all(makeThumbs).then((thumbData) => {
            mdata.thumb = thumbData;
            api.storeData(potentialMetaFile, mdata, 'create').then(function(meta) {
              dev.logverbose(`New media meta file created at path: ${potentialMetaFile} with meta: ${JSON.stringify(meta, null, 4)}`);
              resolve(meta);
            }, function(err) {
              reject(`Couldn't create media meta : ${err}`);
            });
          });


        } else {
          // otherwise, something’s weird
          dev.error(`Found existing meta! Weird.`);
          reject();
        }
      });

    });
  }

  function _makeImageThumb(source, slugFolderName, slugMediaName, resolution) {
    return new Promise(function(resolve, reject) {
      dev.logverbose(`Making a thumb for ${source} with slugFolderName = ${slugFolderName}, slugMediaName = ${slugMediaName} and resolution = ${resolution}`);

      let thumbFolderPath = path.join(local.settings().thumbFolderName, slugFolderName);

      mkdirp(getFolderPath(thumbFolderPath), function(err) {
        let thumbName = `${slugMediaName}.${resolution}.jpeg`;
        let thumbPath = path.join(thumbFolderPath, thumbName);

        sharp(source)
          .rotate()
          .resize(resolution, resolution)
          .max()
          .withoutEnlargement()
          .withMetadata()
          .toFormat('jpeg', {
            quality: local.settings().mediaThumbQuality
          })
          .toFile(getFolderPath(thumbPath))
          .then(function() {
            resolve(thumbPath);
          });
      });

      // vérifier/créer le dossier slugFolderName existe
      // créer un aperçu à cet endroit là

    });
  }

  function createFolder(fdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — createFolder : will create a new folder with: ${JSON.stringify(fdata, null, 4)}`);

      getFolder().then(foldersData => {
        let allFoldersSlug = Object.keys(foldersData).map(function(obj) {
          return obj.slugFolderName;
        });
        // créer un slug
        let slugFolderName = api.slug(fdata.name);
        dev.logverbose(`Proposed slug: ${slugFolderName}`);

        let index = 0;
        let newSlugFolderName = slugFolderName;
        while(allFoldersSlug.indexOf(newSlugFolderName) !== -1) {
          index++;
          newSlugFolderName = `${newSlugFolderName}-${index}`;
        }
        slugFolderName = newSlugFolderName;

        // créer un fichier meta avec : nom humain, date de création, date de début, date de fin, mot de passe hashé, nom des auteurs
        dev.logverbose(`Making a new folder at path ${getFolderPath(slugFolderName)}`);
        mkdirp(getFolderPath(slugFolderName), function(err) {
          createFolderMeta(slugFolderName, fdata).then(() => {
            resolve(slugFolderName);
          }, function(err) {
            reject(`Couldn't create folder meta: ${err}`);
          });
        }, function(err, p) {
          dev.error(`Failed to create folder ${slugFolderName}: ${err}`);
          reject(err);
        });
      }, function(err, p) {
        dev.error(`Failed to get folders data: ${err}`);
        reject(err);
      });
    });
  }

  function removeFolder(slugFolderName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — removeFolder : will remove folder: ${slugFolderName}`);

      var folderPath = getFolderPath(slugFolderName);
      var deletedFolderName = local.settings().deletedPrefix + slugFolderName + '_' + api.getCurrentDate();
      var deletedFolderPath = getFolderPath(deletedFolderName);

      fs.rename(folderPath, deletedFolderPath, (err) => {
        if (err) { reject( err); }
        resolve();
      });
    });
  }

  function createFolderMeta (slugFolderName, additionalMeta) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — createFolderMeta : will create a new meta for folder with name ${slugFolderName} and data ${additionalMeta}`);

      let folderMetaPath = getMetaFileOfFolder(slugFolderName);

      // check that a meta with this name doesn't exist already
      fs.access(folderMetaPath, fs.F_OK, function(err) {
        // if there's nothing at path, we’re all good
        if(err) {

          // default data
          let mdata = {
            name: additionalMeta.name !== undefined ? validator.escape(additionalMeta.name) : slugFolderName,
            created : api.getCurrentDate(),
            start: '',
            end: '',
            password: '',
            authors: ''
          };

          // parse start
          let start = api.convertDate(additionalMeta.start);
          if (start) { mdata.start = start; }
          // parse end
          let end = api.convertDate(additionalMeta.end);
          if (end) { mdata.end = end; }
          // hash password
          let hashedPassword = additionalMeta.password;
          if (hashedPassword) { mdata.password = additionalMeta.password; }
          // add authors
          let authors = additionalMeta.authors;
          if (authors) { mdata.authors = authors; }

          api.storeData(folderMetaPath, mdata, 'create').then(function(meta) {
            dev.logverbose(`New folder meta file created at path: ${folderMetaPath} with meta: ${JSON.stringify(meta, null, 4)}`);
            resolve();
          }, function(err) {
            reject(`Couldn't create media meta : ${err}`);
          });

        } else {
          // otherwise, something’s weird
          dev.error(`Found existing meta for folder! This can’t happen…`);
          reject();
        }
      });

    });
  }

  return API;
})();