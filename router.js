const path = require('path'),
  fs = require('fs-extra'),
  formidable = require('formidable'),
  archiver = require('archiver');

const settings = require('./settings.json'),
  sockets = require('./core/sockets'),
  dev = require('./core/dev-log'),
  cache = require('./core/cache'),
  api = require('./core/api'),
  file = require('./core/file'),
  exporter = require('./core/exporter');

module.exports = function(app, io, m) {
  /**
   * routing event
   */
  app.get('/', showIndex);
  app.get('/:folder', loadFolder);
  app.get('/:folder/export/', exportFolder);
  app.post('/:folder/file-upload', postFile2);

  /**
   * routing functions
   */
  function generatePageData(req) {
    return new Promise(function(resolve, reject) {
      let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      dev.log(`••• the following page has been requested: ${fullUrl} •••`);

      let pageData = {};

      pageData.pageTitle = 'Les Cahiers du Studio';
      // full path on the storage space, as displayed in the footer
      pageData.folderPath = api.getFolderPath();
      pageData.slugFolderName = '';
      pageData.url = req.path;
      pageData.protocol = req.protocol;
      pageData.structure = settings.structure;
      pageData.logToFile = global.nodeStorage.getItem('logToFile');
      pageData.isDebug = dev.isDebug();

      pageData.mode = 'live';

      let tasks = [];

      let getPresentation = new Promise((resolve, reject) => {
        file.getPresentation().then(presentationMD => {
          pageData.presentationMD = presentationMD;
          resolve();
        });
      });
      tasks.push(getPresentation);

      Promise.all(tasks).then(() => {
        resolve(pageData);
      });
    });
  }

  // GET
  function showIndex(req, res) {
    generatePageData(req).then(
      pageData => {
        dev.logpackets(
          `Rendering index with data `,
          JSON.stringify(pageData, null, 4)
        );
        res.render('index', pageData);
      },
      err => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function loadFolder(req, res) {
    let slugFolderName = req.param('folder');
    generatePageData(req).then(
      pageData => {
        pageData.slugFolderName = slugFolderName;
        // let’s make sure that folder exists first and return some meta
        file.getFolder(slugFolderName).then(
          foldersData => {
            res.render('index', pageData);
          },
          (err, p) => {
            dev.error(`Failed to get folder: ${err}`);
            pageData.noticeOfError = 'failed_to_find_folder';
            res.render('index', pageData);
          }
        );
      },
      err => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function exportFolder(req, res) {
    let slugFolderName = req.param('folder');
    generatePageData(req).then(pageData => {
      // get medias for a folder
      file.getFolder(slugFolderName).then(
        foldersData => {
          file.gatherAllMedias(slugFolderName).then(
            mediasData => {
              // if there is a query at the end of the URL, filter by this query
              if (
                typeof req.query === 'object' &&
                Object.keys(req.query).length > 0
              ) {
                Object.keys(mediasData).forEach(slugMediaName => {
                  const media = mediasData[slugMediaName];

                  if (
                    req.query.hasOwnProperty('only_public') &&
                    req.query['only_public'] === 'true'
                  ) {
                    if (
                      !media.hasOwnProperty('public') ||
                      media['public'] === false
                    ) {
                      delete mediasData[slugMediaName];
                    }
                  }
                  // Object.keys(req.query).forEach(k => {
                  //   if (
                  //     k === 'only_public' &&
                  //     req.query['only_public'] === 'true'
                  //   ) {
                  //     if (!media['public']) {
                  //       delete mediasData[slugMediaName];
                  //     }
                  //   }
                  //   //  else if (
                  //   //   media.hasOwnProperty(k) &&
                  //   //   media[k] !== req.query[k]
                  //   // ) {
                  //   //   delete mediasData[slugMediaName];
                  //   // }
                  // });
                });
              }

              // recreate full object
              foldersData[slugFolderName].medias = mediasData;
              pageData.folderAndMediaData = foldersData;
              pageData.export_options = req.query;
              pageData.mode = 'export';

              let socketid;
              if (
                Object.keys(req.query).length > 0 &&
                req.query.hasOwnProperty('socketid')
              ) {
                socketid = req.query.socketid;
              }

              // sockets.notify({
              //   socketid,
              //   msg: `Creating a copy of this folder.`
              // });

              res.render('index', pageData, (err, html) => {
                exporter.copyWebsiteContent({ html, foldersData }).then(
                  cachePath => {
                    var archive = archiver('zip', {
                      zlib: { level: 0 } //
                    });

                    archive.on('error', function(err) {
                      res.status(500).send({ error: err.message });
                      sockets.notify({
                        socketid,
                        msg: `Failed to create zip: ${err.message}`
                      });
                    });

                    function formatBytes(a, b) {
                      if (0 == a) return '0 Bytes';
                      var c = 1024,
                        d = b || 2,
                        e = [
                          'Bytes',
                          'KB',
                          'MB',
                          'GB',
                          'TB',
                          'PB',
                          'EB',
                          'ZB',
                          'YB'
                        ],
                        f = Math.floor(Math.log(a) / Math.log(c));
                      return (
                        parseFloat((a / Math.pow(c, f)).toFixed(d)) + ' ' + e[f]
                      );
                    }

                    let is_finished = false;
                    let pbytes = 0;
                    let tbytes = false;

                    function informUserOfProgress() {
                      if (is_finished) return;
                      if (tbytes) {
                        sockets.notify({
                          socketid,
                          msg: `${formatBytes(pbytes)}/${formatBytes(tbytes)}`
                        });
                      }
                      setTimeout(informUserOfProgress, 1000);
                    }

                    archive.on('progress', function(msg) {
                      pbytes = msg.fs.processedBytes;
                      tbytes = msg.fs.totalBytes;
                    });

                    //on stream closed we can end the request
                    archive.on('end', function() {
                      is_finished = true;
                      console.log('Archive wrote %d bytes', archive.pointer());
                      sockets.notify({
                        socketid,
                        msg: `Archive finished, ${formatBytes(
                          archive.pointer()
                        )}`
                      });
                    });

                    //set the archive name
                    res.attachment(slugFolderName + '.zip');

                    //this is the streaming magic
                    archive.pipe(res);
                    informUserOfProgress();

                    archive.directory(cachePath, false);

                    archive.finalize();
                  },
                  (err, p) => {
                    dev.error(
                      `Failed while preparing/making a web export: ${err}`
                    );
                  }
                );
              });
            },
            (err, p) => {
              dev.error(`Failed to gather medias: ${err}`);
              pageData.noticeOfError = 'failed_to_find_folder';
              res.render('index', pageData);
            }
          );
        },
        (err, p) => {
          dev.error(`Failed to get folder: ${err}`);
          pageData.noticeOfError = 'failed_to_find_folder';
          res.render('index', pageData);
        }
      );
    });
  }

  function postFile2(req, res) {
    let slugFolderName = req.param('folder');
    dev.logverbose(`Will add new media for folder ${slugFolderName}`);

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;

    form.maxFileSize = 4096 * 1024 * 1024;

    // store all uploads in the folder directory
    form.uploadDir = api.getFolderPath(slugFolderName);

    let allFilesMeta = [];

    let fieldValues = {};
    form.on('field', function(name, value) {
      console.log(`Got field with name = ${name} and value = ${value}.`);
      try {
        fieldValues[name] = JSON.parse(value);
      } catch (e) {
        // didn’t get an object as additional meta
      }
    });

    // every time a file has been uploaded successfully,
    form.on('file', function(field, file) {
      dev.logverbose(
        `File uploaded:\nfield: ${field}\nfile: ${JSON.stringify(
          file,
          null,
          4
        )}.`
      );
      // add addiontal meta from 'field' to the array
      let newFile = file;
      for (let fileName in fieldValues) {
        if (fileName === file.name) {
          newFile = Object.assign({}, file, {
            additionalMeta: fieldValues[fileName]
          });
        }
      }
      //       dev.logverbose(`Found matching filenames, new meta file is: ${JSON.stringify(newFile,null,4)}`);
      allFilesMeta.push(newFile);
    });

    // log any errors that occur
    form.on('error', function(err) {
      console.log(`An error has happened: ${err}`);
    });

    // once all the files have been uploaded
    form.on('end', function() {
      if (allFilesMeta.length > 0) {
        var m = [];
        for (var i in allFilesMeta) {
          m.push(
            renameMediaAndCreateMeta(
              form.uploadDir,
              slugFolderName,
              allFilesMeta[i],
              socketid
            )
          );
        }
        Promise.all(m).then(() => {
          let msg = {};
          msg.msg = 'success';
          //           msg.medias = JSON.stringify(allFilesMeta);
          res.end(JSON.stringify(msg));
        });
      }
    });

    // parse the incoming request containing the form data
    form.parse(req);
  }

  function renameAndConvertMediaAndCreateMeta(
    uploadDir,
    slugProjectName,
    fileMeta,
    socketid
  ) {
    return new Promise(function(resolve, reject) {
      dev.logfunction('ROUTER — renameAndConvertMediaAndCreateMeta');
      api.findFirstFilenameNotTaken(uploadDir, fileMeta.name).then(
        function(newFileName) {
          dev.logverbose(`Following filename is available: ${newFileName}`);

          if (fileMeta.hasOwnProperty('additionalMeta')) {
            dev.logverbose(
              `Has additional meta: ${JSON.stringify(
                fileMeta.additionalMeta,
                null,
                4
              )}`
            );
          } else {
            fileMeta.additionalMeta = {};
          }

          file
            .convertAndSaveMedia({
              uploadDir,
              tempPath: fileMeta.path,
              newFileName,
              socketid
            })
            .then(newFileName => {
              fileMeta.additionalMeta.media_filename = newFileName;
              sockets.createMediaMeta({
                type: 'folder',
                slugFolderName: slugProjectName,
                additionalMeta: fileMeta.additionalMeta
              });
              resolve();
            })
            .catch(err => {
              dev.error(err);
              fileMeta.additionalMeta.media_filename = newFileName;
              sockets.createMediaMeta({
                type: 'folder',
                slugFolderName: slugProjectName,
                additionalMeta: fileMeta.additionalMeta
              });
              resolve();
            });
        },
        function(err) {
          reject(err);
        }
      );
    });
  }
};
