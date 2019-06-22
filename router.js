const path = require('path'),
  fs = require('fs-extra'),
  formidable = require('formidable'),
  archiver = require('archiver');

const settings = global.settings,
  sockets = require('./core/sockets'),
  dev = require('./core/dev-log'),
  cache = require('./core/cache'),
  api = require('./core/api'),
  file = require('./core/file'),
  exporter = require('./core/exporter'),
  importer = require('./core/importer');

module.exports = function(app, io, m) {
  /**
   * routing event
   */
  app.get('/', showIndex);
  app.get('/:slugFolderName', loadFolderOrMedia);
  app.get('/:slugFolderName/media/:metaFileName', loadFolderOrMedia);
  app.get('/export/:type/:slugFolderName', exportFolderWithMedias);
  app.post('/file-upload/:type/:slugFolderName', postFile2);

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
      pageData.isDebug = dev.isDebug();

      pageData.mode = 'live';

      let tasks = [];

      let getPresentation = new Promise((resolve, reject) => {
        file
          .getPresentation()
          .then(presentationMD => {
            pageData.presentationMD = presentationMD;
            resolve();
          })
          .catch(() => {
            pageData.presentationMD = false;
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
        dev.logpackets(`Rendering index with data `, JSON.stringify(pageData));
        res.render('index', pageData);
      },
      err => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function loadFolderOrMedia(req, res) {
    let slugFolderName = req.param('slugFolderName');
    let metaFileName = req.param('metaFileName');

    generatePageData(req).then(
      pageData => {
        // let’s make sure that folder exists first and return some meta
        file
          .getFolder({ type: 'folders', slugFolderName })
          .then(
            foldersData => {
              pageData.slugFolderName = slugFolderName;
              pageData.folderAndMediaData = foldersData;
              if (metaFileName) {
                pageData.metaFileName = metaFileName;
              }
              res.render('index', pageData);
            },
            (err, p) => {
              dev.error(`Failed to get folder: ${err}`);
              pageData.noticeOfError = 'failed_to_find_folder';
              res.render('index', pageData);
            }
          )
          .catch(err => {
            dev.error('No folder found');
          });
      },
      err => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function exportFolderWithMedias(req, res) {
    let slugFolderName = req.param('slugFolderName');
    let type = req.param('type');
    generatePageData(req).then(pageData => {
      // get medias for a folder

      file.getFolder({ type, slugFolderName }).then(foldersData => {
        if (foldersData === undefined) return;

        file
          .getMediaMetaNames({
            type,
            slugFolderName
          })
          .then(list_metaFileName => {
            let medias_list = list_metaFileName.map(_metaFileName => {
              return {
                slugFolderName,
                metaFileName: _metaFileName
              };
            });
            file
              .readMediaList({ type, medias_list })
              .then(folders_and_medias => {
                let mediasData = folders_and_medias[slugFolderName].medias;
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
                  });
                }

                // recreate full object
                foldersData[slugFolderName].medias = mediasData;
                pageData.folderAndMediaData = foldersData;
                pageData.export_options = req.query;
                pageData.mode = 'export_web';

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
                  exporter
                    .copyFolderContent({
                      html,
                      folders_and_medias,
                      slugFolderName,
                      type: 'folders'
                    })
                    .then(
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
                            parseFloat((a / Math.pow(c, f)).toFixed(d)) +
                            ' ' +
                            e[f]
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
                              msg: `${formatBytes(pbytes)}/${formatBytes(
                                tbytes
                              )}`
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
                          console.log(
                            'Archive wrote %d bytes',
                            archive.pointer()
                          );
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
              })
              .catch((err, p) => {
                dev.error(`Failed to gather medias: ${err}`);
                pageData.noticeOfError = 'failed_to_find_folder';
                res.render('index', pageData);
              });
          })
          .catch((err, p) => {
            dev.error(`Failed to get folder: ${err}`);
            pageData.noticeOfError = 'failed_to_find_folder';
            res.render('index', pageData);
          });
      });
    });
  }

  function postFile2(req, res) {
    let type = req.param('type');
    let slugFolderName = req.param('slugFolderName');
    importer.handleForm({ req, res, type, slugFolderName });
  }
};
