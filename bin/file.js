const path = require('path'),
  fs = require('fs-extra'),
  validator = require('validator');

const settings = require('../settings.json'),
  dev = require('./dev-log'),
  api = require('./api'),
  thumbs = require('./thumbs');

module.exports = (function() {
  const API = {
    getPresentation: () => getPresentation(),

    getFolder: slugFolderName => getFolder(slugFolderName),
    getMetaFileOfFolder: slugFolderName => getMetaFileOfFolder(slugFolderName),
    createFolder: fdata => createFolder(fdata),
    editFolder: (foldersData, fdata) => editFolder(foldersData, fdata),
    removeFolder: slugFolderName => removeFolder(slugFolderName),

    getMedia: (slugFolderName, slugMediaName) =>
      getMedia(slugFolderName, slugMediaName),
    gatherAllMedias: (slugFolderName, slugMediaName, mediaID) =>
      gatherAllMedias(slugFolderName, slugMediaName, mediaID),
    createMediaMeta: (slugFolderName, slugMediaName, additionalMeta) =>
      createMediaMeta(slugFolderName, slugMediaName, additionalMeta),
    editMedia: mdata => editMedia(mdata),
    removeMedia: (slugFolderName, slugMediaName) =>
      removeMedia(slugFolderName, slugMediaName),

    createTextMedia: mdata => createTextMedia(mdata)
  };

  function getPresentation() {
    return new Promise(function(resolve, reject) {
      let presentationMd = path.join(api.getFolderPath(), 'presentation.md');
      fs.access(presentationMd, fs.F_OK, function(err) {
        if (err) {
          resolve(validator.unescape(global.appInfos.presentationMd));
        } else {
          let presentationContent = validator.unescape(
            fs.readFileSync(presentationMd, settings.textEncoding)
          );
          presentationContent = api.parseData(presentationContent);
          resolve(presentationContent);
        }
      });
    });
  }

  function getMetaFileOfFolder(slugFolderName) {
    let folderPath = api.getFolderPath(slugFolderName);
    let metaPath = path.join(
      folderPath,
      settings.folderMetafilename + settings.metaFileext
    );
    return metaPath;
  }
  function getMetaFileOfMedia(slugFolderName, slugMediaName) {
    let mediaPath = path.join(api.getFolderPath(slugFolderName), slugMediaName);
    let mediaMetaPath = mediaPath + settings.metaFileext;
    return mediaMetaPath;
  }

  function readFolderMeta(slugFolderName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — readFolderMeta: ${slugFolderName}`);
      var metaFolderPath = getMetaFileOfFolder(slugFolderName);
      var folderData = readMetaFile(metaFolderPath);
      resolve(folderData);
    });
  }
  function readOrCreateMediaMeta(slugFolderName, slugMediaName) {
    return new Promise(function(resolve, reject) {
      // pour chaque item, on regarde s’il contient un fichier méta (même nom + .txt)
      let potentialMetaFile = getMetaFileOfMedia(slugFolderName, slugMediaName);
      fs.access(potentialMetaFile, fs.F_OK, err => {
        // if there's no META file at path
        let tasks = [];

        if (err) {
          dev.logverbose(`No meta for this media: ${err}`);
          // let’s get creation date and modification date, guess the type, and return this whole thing afterwards
          let createNewMediaMeta = new Promise((resolve, reject) => {
            createMediaMeta(slugFolderName, slugMediaName).then(mediaData => {
              delete mediaData.content;
              resolve(mediaData);
            });
          });
          tasks.push(createNewMediaMeta);
        } else {
          dev.logverbose(`Found meta there: ${potentialMetaFile}`);
          let readMediaMeta = new Promise((resolve, reject) => {
            readMetaFile(potentialMetaFile).then(mediaData => {
              delete mediaData.content;
              resolve(mediaData);
            });
          });
          tasks.push(readMediaMeta);
        }

        Promise.all(tasks).then(mediaData => {
          mediaData = mediaData[0];

          if (mediaData.type === 'text' || mediaData.type === 'marker') {
            // get text content
            let mediaPath = path.join(
              api.getFolderPath(slugFolderName),
              slugMediaName
            );
            mediaData.content = validator.unescape(
              fs.readFileSync(mediaPath, settings.textEncoding)
            );
            dev.logverbose(`Got mediaData.content : ${mediaData.content}`);
            resolve(mediaData);
          }

          resolve(mediaData);
        });
      });
    });
  }
  function readMediaAndThumbs(slugFolderName, slugMediaName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — readMediaAndThumbs: slugFolderName = ${slugFolderName} & slugMediaName = ${slugMediaName}`
      );

      readOrCreateMediaMeta(slugFolderName, slugMediaName)
        .then(mediaData => {
          dev.logverbose(
            `Read Meta, now getting thumbs for ${JSON.stringify(
              mediaData,
              null,
              4
            )}`
          );

          // let’s find or create thumbs
          thumbs
            .makeMediaThumbs(slugFolderName, slugMediaName, mediaData.type)
            .then(thumbData => {
              mediaData.thumbs = thumbData;
              resolve(mediaData);
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  function readMetaFile(metaPath) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — readMetaFile: ${metaPath}`);
      var metaFileContent = fs.readFileSync(metaPath, settings.textEncoding);
      var metaFileContentParsed = api.parseData(metaFileContent);
      resolve(metaFileContentParsed);
    });
  }

  function getFolder(slugFolderName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — getFolder: ${slugFolderName}`);
      let mainFolderPath = api.getFolderPath();
      // on cherche tous les dossiers du dossier de contenu
      fs.readdir(mainFolderPath, function(err, filenames) {
        //         dev.logverbose(`Found filenames: ${filenames}`);
        if (err) {
          dev.error(`Couldn't read content dir: ${err}`);
          reject(err);
        }
        if (filenames === undefined) {
          dev.error(`No folder found: ${err}`);
          reject(err);
        }

        var folders = filenames.filter(function(thisSlugFolderName) {
          // is a folder
          return (
            new RegExp(settings.regexpMatchFolderNames, 'i').test(
              thisSlugFolderName
            ) &&
            // if slugFolderName isset, filter to get only requested folder
            (slugFolderName ? thisSlugFolderName === slugFolderName : true) &&
            // if not deleted
            thisSlugFolderName.indexOf(settings.deletedPrefix) !== 0 &&
            // if doesn’t start with _ (these folders are generated by the tool, can’t be created through the interface)
            thisSlugFolderName.indexOf('_') !== 0
          );
        });

        dev.logverbose(
          `Number of folders that match in ${mainFolderPath} = ${
            folders.length
          }. Folder(s) is(are) ${folders}`
        );
        if (folders.length === 0) {
          reject('No such folder found');
        }

        var allFoldersData = [];
        folders.forEach(slugFolderName => {
          let fmeta = new Promise((resolve, reject) => {
            let prepareFolderMetaForClient = (slugFolderName, meta) => {
              meta.slugFolderName = slugFolderName;
              meta.medias = {};
              meta.created = api.parseDate(meta.created);
              meta.start = api.parseDate(meta.start);
              meta.end = api.parseDate(meta.end);
              meta.fullFolderPath = api.getFolderPath(slugFolderName);
              return meta;
            };

            // read meta
            readFolderMeta(slugFolderName)
              .then(meta => {
                let preparedMeta = prepareFolderMetaForClient(
                  slugFolderName,
                  meta
                );
                resolve(preparedMeta);
              })
              .catch(err => {
                dev.error(
                  `Couldn’t read folder meta, most probably because it doesn’t exist: ${err}`
                );
                _makeFolderMeta(slugFolderName)
                  .then(mdata => {
                    let folderMetaPath = getMetaFileOfFolder(slugFolderName);
                    api
                      .storeData(folderMetaPath, mdata, 'create')
                      .then(function(meta) {
                        dev.logverbose(
                          `New folder meta file created at path: ${folderMetaPath} with meta: ${JSON.stringify(
                            meta,
                            null,
                            4
                          )}`
                        );
                        let preparedMeta = prepareFolderMetaForClient(
                          slugFolderName,
                          meta
                        );
                        resolve(preparedMeta);
                      })
                      .catch(err => {
                        reject(err);
                      });
                  })
                  .catch(err => {
                    reject(err);
                  });
              });
          });
          allFoldersData.push(fmeta);
        });
        Promise.all(allFoldersData).then(parsedFoldersData => {
          dev.logverbose(
            `All folders meta have been processed`,
            JSON.stringify(parsedFoldersData, null, 4)
          );
          // reunite array items as a single big object
          let flatObjFoldersData = {};
          parsedFoldersData.forEach(fmeta => {
            flatObjFoldersData[fmeta.slugFolderName] = fmeta;
          });
          resolve(flatObjFoldersData);
        });
      });
    });
  }

  function createFolder(fdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — createFolder : will create a new folder with: ${JSON.stringify(
          fdata,
          null,
          4
        )}`
      );

      getFolder().then(
        foldersData => {
          let allFoldersSlug = Object.keys(foldersData);
          // créer un slug
          let slugFolderName = api.slug(fdata.name);
          if (slugFolderName.length <= 0) {
            slugFolderName = api.slug('Untitled Folder');
          }

          let index = 0;
          let newSlugFolderName = slugFolderName;
          while (allFoldersSlug.indexOf(newSlugFolderName) !== -1) {
            index++;
            newSlugFolderName = `${newSlugFolderName}-${index}`;
          }
          slugFolderName = newSlugFolderName;
          dev.logverbose(`All slugs: ${allFoldersSlug.join()}`);
          dev.logverbose(`Proposed slug: ${slugFolderName}`);

          // créer un fichier meta avec : nom humain, date de création, date de début, date de fin, mot de passe hashé, nom des auteurs
          dev.logverbose(
            `Making a new folder at path ${api.getFolderPath(slugFolderName)}`
          );
          fs.mkdirp(
            api.getFolderPath(slugFolderName),
            function(err) {
              _makeFolderMeta(slugFolderName, fdata).then(
                mdata => {
                  let folderMetaPath = getMetaFileOfFolder(slugFolderName);
                  api
                    .storeData(folderMetaPath, mdata, 'create')
                    .then(function(meta) {
                      dev.logverbose(
                        `New folder meta file created at path: ${folderMetaPath} with meta: ${JSON.stringify(
                          meta,
                          null,
                          4
                        )}`
                      );
                      resolve(slugFolderName);
                    })
                    .catch(err => {
                      reject(err);
                    });
                },
                function(err) {
                  reject(`${err}`);
                }
              );
            },
            function(err, p) {
              dev.error(`Failed to create folder ${slugFolderName}: ${err}`);
              reject(err);
            }
          );
        },
        function(err, p) {
          dev.error(`Failed to get folders data: ${err}`);
          reject(err);
        }
      );
    });
  }

  function editFolder(foldersData, fdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — editFolder : will edit folder: ${JSON.stringify(
          fdata,
          null,
          4
        )} with existing data ${JSON.stringify(foldersData, null, 4)}`
      );
      // remove slugFolderKey
      let slugFolderName = fdata.slugFolderName;
      let existingPassword = foldersData[slugFolderName].password;
      delete fdata['slugFolderName'];

      _makeFolderMeta(slugFolderName, fdata).then(mdata => {
        // replace password key by original (since password can’t be edited client-side)
        mdata.password = existingPassword;

        let folderMetaPath = getMetaFileOfFolder(slugFolderName);
        api.storeData(folderMetaPath, mdata, 'update').then(
          function(meta) {
            dev.logverbose(
              `Update folder meta file at path: ${folderMetaPath} with meta: ${JSON.stringify(
                meta,
                null,
                4
              )}`
            );
            resolve(slugFolderName);
          },
          function(err) {
            reject(`Couldn't update folder meta : ${err}`);
          }
        );
      });
    });
  }

  function removeFolder(slugFolderName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — removeFolder : will remove folder: ${slugFolderName}`
      );

      let folderPath = api.getFolderPath(slugFolderName);
      let movedFolderPath = path.join(
        api.getFolderPath(),
        settings.deletedFolderName,
        slugFolderName
      );

      fs
        .move(folderPath, movedFolderPath, { overwrite: true })
        .then(() => {
          dev.logfunction(
            `COMMON — removeFolder : folder ${slugFolderName} has been moved to ${movedFolderPath}`
          );
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  function _makeFolderMeta(slugFolderName, additionalMeta) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — _makeFolderMeta : will make a new meta for folder with name ${slugFolderName} and data ${additionalMeta}`
      );

      // this function is used both for create and update folder

      // default data
      let mdata = {
        name: slugFolderName,
        created: api.getCurrentDate(),
        start: api.getCurrentDate(),
        end: '',
        password: '',
        authors: ''
      };

      if (typeof additionalMeta === 'undefined') {
        resolve(mdata);
      }

      mdata.name =
        additionalMeta.name !== undefined
          ? validator.escape(additionalMeta.name)
          : mdata.name;

      // convert date to local format
      let start = api.convertDate(additionalMeta.start);
      if (start) {
        mdata.start = start;
      }
      // parse end
      let end = api.convertDate(additionalMeta.end);
      if (end) {
        mdata.end = end;
      }
      // hash password
      let hashedPassword = additionalMeta.password;
      if (hashedPassword) {
        mdata.password = additionalMeta.password;
      }
      // add authors
      let authors = additionalMeta.authors;
      if (authors) {
        mdata.authors = authors;
      }

      resolve(mdata);
    });
  }

  function getMedia(slugFolderName, slugMediaName = '') {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — getMedia`);
      if (slugFolderName === undefined) {
        dev.error(`Missing slugFolderName to read medias from.`);
        reject();
      }
      if (slugMediaName === '') {
        dev.logverbose(
          `Missing slugMediaName to read medias from ${slugFolderName}. Reading all medias instead.`
        );
      }
      dev.logverbose(
        `COMMON — getMedia — slugFolderName: ${slugFolderName} — slugMediaName: ${slugMediaName}`
      );

      let slugFolderPath = api.getFolderPath(slugFolderName);
      fs.readdir(slugFolderPath, function(err, filenames) {
        if (err) {
          dev.error(`Couldn't read content dir: ${err}`);
          reject(err);
        }
        if (filenames === undefined) {
          dev.error(`No medias for folder found: ${err}`);
          resolve();
        }

        dev.logverbose(
          `Found this many (${filenames.length}) filenames: ${filenames}`
        );
        let medias = filenames.filter(function(thisSlugMediaName) {
          // not a folder
          return (
            !new RegExp(settings.regexpMatchFolderNames, 'i').test(
              thisSlugMediaName
            ) &&
            // not meta.txt
            thisSlugMediaName !==
              settings.folderMetafilename + settings.metaFileext &&
            // not a text file
            new RegExp(settings.regexpGetFileExtension, 'i').exec(
              thisSlugMediaName
            )[0] !== '.txt' &&
            // not deleted
            thisSlugMediaName.indexOf(settings.deletedPrefix) &&
            // not a dotfile
            thisSlugMediaName.indexOf('.') !== 0 &&
            // if has slugMediaName, only if it matches
            (slugMediaName ? thisSlugMediaName === slugMediaName : true)
          );
        });
        dev.logverbose(
          `Number of medias that match in ${slugFolderPath} = ${
            medias.length
          }. Media(s) is(are) ${medias}`
        );

        if (medias.length === 0) {
          dev.logverbose(
            `Since no medias is in this folder, let’s abort right there.`
          );
          resolve({});
        } else {
          var allMediasData = [];
          medias.forEach(function(slugMediaName) {
            let fmeta = new Promise((resolve, reject) => {
              readMediaAndThumbs(slugFolderName, slugMediaName).then(meta => {
                meta.slugMediaName = slugMediaName;
                resolve(meta);
              });
            });
            allMediasData.push(fmeta);
          });

          Promise.all(allMediasData).then(parsedMediasData => {
            // reunite array items as a single big object
            let flatObjMediasData = {};
            parsedMediasData.forEach(fmeta => {
              let slugMediaName = fmeta.slugMediaName;
              delete fmeta.slugMediaName;
              flatObjMediasData[slugMediaName] = fmeta;
            });
            dev.logverbose(
              `All medias meta have been processed`,
              JSON.stringify(flatObjMediasData, null, 4)
            );
            resolve(flatObjMediasData);
          });
        }
      });
    });
  }

  function gatherAllMedias(slugFolderName, slugMediaName, mediaID) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — gatherAllMedias : will gather medias for folder ${slugFolderName} with opt slugMediaName = ${slugMediaName}`
      );

      getMedia(slugFolderName, slugMediaName).then(
        mediasData => {
          const defaultReactiveMeta = {
            date_timeline: '',
            date_modified: '',
            type: '',
            color: '',
            authors: '',
            keywords: '',
            caption: '',
            public: false,
            collapsed: false,
            y: 0,
            content: ''
          };

          // sanitize each media — make sure they have all the reactive fields when sent, because otherwise vue.js can’t track changes when a key is added afterwards
          for (let slugMediaName in mediasData) {
            let mediaData = mediasData[slugMediaName];

            /*******************************************************
            PRE 1.0.0 beta 3 legacy
          ******************************************************/
            // LEGACY : rename 'created' to 'date_created', and set date_timeline
            {
              if (mediaData.hasOwnProperty('created')) {
                mediaData.date_created = mediaData.created;
                if (!mediaData.hasOwnProperty('date_timeline')) {
                  mediaData.date_timeline = mediaData.created;
                }
                delete mediaData.created;
              }
              if (
                mediaData.hasOwnProperty('modified') &&
                !mediaData.hasOwnProperty('date_modified')
              ) {
                mediaData.date_modified = mediaData.modified;
                delete mediaData.modified;
              }
            }
            /*******************************************************
            END
          ******************************************************/

            mediaData.date_timeline = api.parseDate(mediaData.date_timeline);
            if (mediaData.hasOwnProperty('date_created')) {
              mediaData.date_created = api.parseDate(mediaData.date_created);
            }
            if (mediaData.hasOwnProperty('date_upload')) {
              mediaData.date_upload = api.parseDate(mediaData.date_upload);
            }
            if (mediaData.hasOwnProperty('date_modified')) {
              mediaData.date_modified = api.parseDate(mediaData.date_modified);
            }
            if (mediaID) {
              mediaData.mediaID = mediaID;
            }

            mediasData[slugMediaName] = Object.assign(
              {},
              defaultReactiveMeta,
              mediaData
            );
          }
          resolve(mediasData);
        },
        function(err) {
          dev.error(`Failed to list medias! Error: ${err}`);
          reject(err);
        }
      );
    });
  }

  function createMediaMeta(slugFolderName, slugMediaName, additionalMeta) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — createMediaMeta : will create a new meta file for media ${slugMediaName} in folder ${slugFolderName}`
      );
      if (additionalMeta !== undefined) {
        dev.logverbose(
          `Has additional meta: ${JSON.stringify(additionalMeta, null, 4)}`
        );
      }

      let mediaPath = path.join(
        api.getFolderPath(slugFolderName),
        slugMediaName
      );
      let potentialMetaFile = getMetaFileOfMedia(slugFolderName, slugMediaName);

      // check that a meta with this name doesn't exist already
      fs.access(potentialMetaFile, fs.F_OK, function(err) {
        // if there's nothing at path, we’re all good
        if (err) {
          // default media data
          let mdata = {
            date_timeline: api.getCurrentDate(),
            // date_created is added if EXIF or modified date
            date_upload: api.getCurrentDate(),
            date_modified: api.getCurrentDate(),
            public: false,
            y: Math.random() * 0.5,
            color: 'white',
            type: 'other',
            collapsed: false
          };

          let tasks = [];

          if (
            additionalMeta !== undefined &&
            additionalMeta.hasOwnProperty('color')
          ) {
            mdata.color = validator.escape(additionalMeta.color);
          }
          if (
            additionalMeta !== undefined &&
            additionalMeta.hasOwnProperty('collapsed') &&
            typeof additionalMeta.collapsed === 'boolean'
          ) {
            mdata.collapsed = additionalMeta.collapsed;
          }

          if (
            additionalMeta !== undefined &&
            additionalMeta.hasOwnProperty('type')
          ) {
            mdata.type = validator.escape(additionalMeta.type);
          } else {
            let mediaFileExtension = new RegExp(
              settings.regexpGetFileExtension,
              'i'
            ).exec(slugMediaName)[0];
            dev.logverbose(
              `Trying to guess filetype from extension: ${mediaFileExtension}`
            );
            switch (mediaFileExtension.toLowerCase()) {
              case '.jpeg':
              case '.jpg':
              case '.png':
              case '.gif':
              case '.tiff':
              case '.tif':
              case '.dng':
                mdata.type = 'image';
                break;
              case '.mp4':
              case '.mov':
              case '.webm':
                mdata.type = 'video';
                break;
              case '.mp3':
              case '.wav':
              case '.m4a':
                mdata.type = 'audio';
                break;
              case '.md':
              case '.rtf':
                mdata.type = 'text';
                break;
            }
            dev.logverbose(`Type determined to be: ${mdata.type}`);
          }

          /***************************************************************************
              CREATED DATE
          ***************************************************************************/

          if (
            additionalMeta !== undefined &&
            additionalMeta.hasOwnProperty('fileCreationDate')
          ) {
            dev.logverbose(`Setting created from additionalMeta`);
            mdata.date_created = api.convertDate(
              additionalMeta.fileCreationDate
            );
          } else {
            dev.logverbose(`Setting created from file birthtime`);
            let getFileCreationDate = new Promise((resolve, reject) => {
              fs.stat(mediaPath, function(err, stats) {
                if (err) {
                  resolve();
                }
                mdata.date_created = api.convertDate(new Date(stats.birthtime));
                resolve();
              });
            });
            tasks.push(getFileCreationDate);
          }

          if (mdata.type === 'image') {
            dev.logverbose(`Looking for EXIF for image`);
            let getEXIFTimestamp = new Promise((resolve, reject) => {
              thumbs
                .getTimestampFromEXIF(mediaPath)
                .then(ts => {
                  if (ts === false) {
                    dev.logverbose(`No timestamp found in EXIF.`);
                  } else {
                    let localTS = api.parseUTCDate(ts);
                    dev.logverbose(
                      `getEXIFData timestamp to date : ${api.convertDate(
                        localTS
                      )}`
                    );
                    mdata.date_created = api.convertDate(localTS);
                  }
                  resolve();
                })
                .catch(err => {
                  dev.logverbose(`No EXIF data to read from: ${err}`);
                  resolve();
                });
            });
            tasks.push(getEXIFTimestamp);
          }

          /***************************************************************************
              RATIO
          ***************************************************************************/
          if (mdata.type === 'image') {
            let getEXIFRatio = new Promise((resolve, reject) => {
              thumbs
                .getRatioFromEXIF(mediaPath)
                .then(mediaRatio => {
                  dev.log(`getEXIFData mediaRatio : ${mediaRatio}`);
                  if (mediaRatio !== undefined) {
                    mdata.ratio = mediaRatio;
                  }
                  resolve();
                })
                .catch(err => {
                  dev.error(`No EXIF data to read from: ${err}`);
                  resolve();
                });
            });
            tasks.push(getEXIFRatio);
          } else if (mdata.type === 'video' || mdata.type === 'audio') {
            let getMediaRatio = new Promise((resolve, reject) => {
              thumbs
                .getMediaRatio(mediaPath)
                .then(mediaRatio => {
                  dev.log(`getMediaRatio : ${mediaRatio}`);
                  if (mediaRatio !== undefined) {
                    mdata.ratio = mediaRatio;
                  }
                  resolve();
                })
                .catch(err => {
                  dev.error(`No probe data to read from: ${err}`);
                  resolve();
                });
            });
            tasks.push(getMediaRatio);
          }

          /***************************************************************************
              DURATION
          ***************************************************************************/
          if (mdata.type === 'video' || mdata.type === 'audio') {
            // get video or audio duration
            let getMediaDuration = new Promise((resolve, reject) => {
              dev.logverbose(`Will attempt to get media duration.`);
              thumbs
                .getMediaDuration(mediaPath)
                .then(duration => {
                  dev.log(`getMediaDuration: ${duration}`);
                  if (duration) {
                    mdata.duration = duration;
                  }
                  resolve();
                })
                .catch(err => {
                  dev.error(`No probe data to read from: ${err}`);
                  resolve();
                });
            });
            tasks.push(getMediaDuration);
          }

          /***************************************************************************
              DURATION
          ***************************************************************************/
          if (mdata.type === 'image') {
            let getFullEXIF = new Promise((resolve, reject) => {
              dev.logverbose(`Will attempt to get media duration.`);
              thumbs.getEXIFData(mediaPath).then(exifdata => {
                if (exifdata) {
                  mdata.exif = validator.escape(JSON.stringify(exifdata));
                }
                resolve();
              });
            });
            tasks.push(getFullEXIF);
          }

          /***************************************************************************
              DO IT ALL
          ***************************************************************************/
          Promise.all(tasks).then(() => {
            if (mdata.hasOwnProperty('date_created')) {
              // if there is a created date, the timeline date should match this one in priority
              mdata.date_timeline = mdata.date_created;
            }
            api.storeData(potentialMetaFile, mdata, 'create').then(
              function(meta) {
                dev.logverbose(
                  `New media meta file created at path: ${potentialMetaFile} with meta: ${JSON.stringify(
                    meta,
                    null,
                    4
                  )}`
                );
                resolve(meta);
              },
              function(err) {
                reject(`Couldn't create media meta : ${err}`);
              }
            );
          });
        } else {
          // otherwise, something’s weird
          dev.error(`Found existing meta! Aborting`);
          reject();
        }
      });
    });
  }

  function editMedia(mdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — editMedia : will edit media with ${JSON.stringify(
          mdata,
          null,
          4
        )}`
      );

      let slugFolderName = mdata.slugFolderName;
      let slugMediaName = mdata.slugMediaName;

      let newMediaData = {};

      /**************************************************************************
        list here all possible edit properties and how to validate them
      **************************************************************************/
      if (mdata.hasOwnProperty('date_timeline')) {
        newMediaData.date_timeline = api.convertDate(mdata.date_timeline);
      }

      if (mdata.hasOwnProperty('type')) {
        newMediaData.type = validator.escape(mdata.type);
      }

      if (mdata.hasOwnProperty('color')) {
        newMediaData.color = validator.escape(mdata.color);
      }

      if (mdata.hasOwnProperty('keywords')) {
        newMediaData.keywords = validator.escape(mdata.keywords);
      }

      if (mdata.hasOwnProperty('caption')) {
        newMediaData.caption = validator.escape(mdata.caption);
      }

      if (mdata.hasOwnProperty('authors')) {
        newMediaData.authors = validator.escape(mdata.authors);
      }

      if (mdata.hasOwnProperty('public') && typeof mdata.public === 'boolean') {
        newMediaData.public = mdata.public;
      }

      if (
        mdata.hasOwnProperty('collapsed') &&
        typeof mdata.collapsed === 'boolean'
      ) {
        newMediaData.collapsed = mdata.collapsed;
      }

      if (mdata.hasOwnProperty('y') && typeof mdata.y === 'number') {
        newMediaData.y = api.clip(mdata.y, 0, 1);
      }

      newMediaData.date_modified = api.getCurrentDate();
      dev.logverbose(
        `Following datas will replace existing data for this media meta: ${JSON.stringify(
          newMediaData,
          null,
          4
        )}`
      );

      readOrCreateMediaMeta(slugFolderName, slugMediaName).then(meta => {
        dev.logverbose(
          `Got meta, now updating for ${slugMediaName} with ${JSON.stringify(
            meta,
            null,
            4
          )}`
        );
        // overwrite stored obj with new informations
        Object.assign(meta, newMediaData);
        let tasks = [];

        let updateMediaMeta = new Promise((resolve, reject) => {
          let potentialMetaFile = getMetaFileOfMedia(
            slugFolderName,
            slugMediaName
          );
          api.storeData(potentialMetaFile, meta, 'update').then(
            meta => {
              dev.logverbose(
                `Updated media meta file at path: ${potentialMetaFile} with meta: ${JSON.stringify(
                  meta,
                  null,
                  4
                )}`
              );
              resolve();
            },
            function(err) {
              reject(`Couldn't update folder meta : ${err}`);
            }
          );
        });
        tasks.push(updateMediaMeta);

        if (
          (meta.type === 'text' || meta.type === 'marker') &&
          mdata.hasOwnProperty('content')
        ) {
          dev.logverbose(`Is text or marker and need to update content.`);
          let updateTextMedia = new Promise((resolve, reject) => {
            let mediaPath = path.join(
              api.getFolderPath(slugFolderName),
              slugMediaName
            );
            let content = validator.escape(mdata.content);
            api
              .storeData(mediaPath, content, 'update')
              .then(content => {
                dev.logverbose(
                  `Updated media file at path: ${mediaPath} with content: ${content}`
                );
                resolve();
              })
              .catch(err => {
                reject(err);
              });
          });
          tasks.push(updateTextMedia);
        }

        Promise.all(tasks).then(() => {
          resolve(slugFolderName);
        });
      });
    });
  }

  function removeMedia(slugFolderName, slugMediaName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — removeMedia : will remove media at path: ${slugFolderName}/${slugMediaName}`
      );

      let mediaPath = path.join(
        api.getFolderPath(slugFolderName),
        slugMediaName
      );
      let movedMediaPath = path.join(
        api.getFolderPath(slugFolderName),
        settings.deletedFolderName,
        slugMediaName
      );

      let mediaMetaPath = mediaPath + settings.metaFileext;
      let movedMediaMetaPath = movedMediaPath + settings.metaFileext;

      fs
        .move(mediaPath, movedMediaPath, { overwrite: true })
        .then(() => {
          return fs.move(mediaMetaPath, movedMediaMetaPath, {
            overwrite: true
          });
        })
        .then(() => {
          return thumbs.removeMediaThumbs(slugFolderName, slugMediaName);
        })
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  function createTextMedia(mdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON — createTextMedia : will create text media at path: ${
          mdata.slugFolderName
        }`
      );

      let slugFolderName = mdata.slugFolderName;
      let timeCreated = api.getCurrentDate();
      let textMediaName = timeCreated + '.md';

      if (mdata.hasOwnProperty('type')) {
        textMediaName = mdata.type + '-' + textMediaName;
      }
      let pathToTextMedia = path.join(
        api.getFolderPath(slugFolderName),
        textMediaName
      );

      api.storeData(pathToTextMedia, '', 'create').then(
        () => {
          let newMediaInfos = {
            slugMediaName: textMediaName,
            additionalMeta: {
              fileCreationDate: api.parseDate(timeCreated)
            }
          };
          if (mdata.hasOwnProperty('type')) {
            newMediaInfos.additionalMeta['type'] = mdata.type;
          }
          if (mdata.hasOwnProperty('color')) {
            newMediaInfos.additionalMeta['color'] = mdata.color;
          }
          if (mdata.hasOwnProperty('collapsed')) {
            newMediaInfos.additionalMeta['collapsed'] = mdata.collapsed;
          }
          resolve(newMediaInfos);
        },
        function(err) {
          dev.error(`Failed to storeData for textmedia`);
          reject(`${err}`);
        }
      );
    });
  }

  return API;
})();
