const
  path = require('path'),
  fs = require('fs-extra'),
  formidable = require('formidable')
;

const
  settings = require('./settings.json'),
  sockets = require('./sockets'),
  dev = require('./bin/dev-log'),
  api = require('./bin/api'),
  file = require('./bin/file')
;

module.exports = function(app,io,m){

  /**
  * routing event
  */
  app.get('/', showIndex);
  app.get('/:folder', loadFolder);
  app.get('/:folder/export', exportFolder);
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
        file.getPresentation().then((presentationMD) => {
          pageData.presentationMD = presentationMD;
          resolve();
        });
      });
      tasks.push(getPresentation);

      let getLocalIP = new Promise((resolve, reject) => {
        api.getLocalIP().then(localNetworkInfos => {
          pageData.localNetworkInfos = {
            ip: [],
            port: global.appInfos.port
          };
          pageData.localNetworkInfos.ip = Object.values(localNetworkInfos);
          resolve();
        }, function(err, p) {
          dev.error(`Err while getting local IP: ${err}`);
          reject(err);
        });
      });
      tasks.push(getLocalIP);

      Promise.all(tasks).then(() => {
        resolve(pageData);
      });
    });
  }

  // GET
  function showIndex(req, res) {
    generatePageData(req).then((pageData) => {
      dev.logpackets(`Rendering index with data `, JSON.stringify(pageData, null, 4));
      res.render('index', pageData);
    }, (err) => {
      dev.error(`Err while getting index data: ${err}`);
    });
  }

  function loadFolder(req, res) {
    let slugFolderName = req.param('folder');
    generatePageData(req).then((pageData) => {
      pageData.slugFolderName = slugFolderName;
      // let’s make sure that folder exists first and return some meta
      file.getFolder(slugFolderName).then(foldersData => {
        res.render('index', pageData);
      }, (err, p) => {
        dev.error(`Failed to get folder: ${err}`);
        pageData.noticeOfError = 'failed_to_find_folder';
        res.render('index', pageData);
      });
    }, (err) => {
      dev.error(`Err while getting index data: ${err}`);
    });
  }


  function exportFolder(req, res) {
    let slugFolderName = req.param('folder');
    generatePageData(req).then((pageData) => {
      // get medias for a folder
      file.getFolder(slugFolderName).then(foldersData => {
        file.gatherAllMedias(slugFolderName).then(mediasData => {
          // recreate full object
          foldersData[slugFolderName].medias = mediasData;
          pageData.folderAndMediaData = foldersData;

          pageData.mode = 'export';

          // create cache folder that we will need to copy the content before zipping

          // adding a random string characters at the end, in case two medias get sent at the precise same moment
          let cacheFolderName = api.getCurrentDate() + '-' + (Math.random().toString(36)+'00000000000000000').slice(2, 3 + 2);

          let cachePath = path.join(__dirname, 'cache', cacheFolderName);
          fs.mkdirp(cachePath, function() {

            let tasks = [];
            // Générer le html a partir du jade au render, avec une variable qui contient tous les médias.
            tasks.push(
              new Promise((resolve, reject) => {
                res.render('index', pageData, (err, html) => {
                  // save to file named 'index.html' in a new folder in /cache
                  let indexCacheFilepath = path.join(cachePath, 'index.html');
                  api.storeData(indexCacheFilepath, html, 'create').then(function(meta) {
                    resolve();
                  }).catch(err => {
                    dev.error(`Failed to store HTML for export.`);
                    reject(err);
                  });
                });
              })
            );

            // Copier les dépendances : all.min.js all.min.css dans un sous dossier.



            Promise.all(tasks).then((d_array) => {
              resolve(d_array);
            });


            // Créer un dossier _thumbs et y copier le dossier _thumbs au bon chemin.

            // Copier tous les médias dans un dossier.


          }, function(err, p) {
            dev.error(`Failed to create cache folder: ${err}`);
            reject(err);
          });

        }, (err, p) => {
          dev.error(`Failed to gather medias: ${err}`);
          pageData.noticeOfError = 'failed_to_find_folder';
          res.render('index', pageData);
        });
      }, (err, p) => {
        dev.error(`Failed to get folder: ${err}`);
        pageData.noticeOfError = 'failed_to_find_folder';
        res.render('index', pageData);
      });
    });
  }

  function postFile2(req, res){
    let slugFolderName = req.param('folder');
    dev.logverbose(`Will add new media for folder ${slugFolderName}`);

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;

    // store all uploads in the folder directory
    form.uploadDir = api.getFolderPath(slugFolderName);

    let allFilesMeta = [];

    let fieldValues = {};
    form.on('field', function(name, value) {
      console.log(`Got field with name = ${name} and value = ${value}.`);
      try {
        fieldValues[name] = JSON.parse(value);
      } catch(e) {
        // didn’t get an object as additional meta
      }
    });

    // every time a file has been uploaded successfully,
    form.on('file', function(field, file) {
      dev.logverbose(`File uploaded:\nfield: ${field}\nfile: ${JSON.stringify(file, null, 4)}.`);
      // add addiontal meta from 'field' to the array
      let newFile = file;
      for(let fileName in fieldValues) {
        if(fileName === file.name) {
          newFile = Object.assign({}, file, { additionalMeta: fieldValues[fileName] });
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
      if(allFilesMeta.length > 0) {
        var m = [];
        for(var i in allFilesMeta) {
          m.push(renameMediaAndCreateMeta(form.uploadDir, slugFolderName, allFilesMeta[i]));
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

  function renameMediaAndCreateMeta(uploadDir, slugFolderName, fileMeta) {
    return new Promise(function(resolve, reject) {
      api.findFirstFilenameNotTaken(uploadDir, fileMeta.name).then(function(newFileName){
        dev.logverbose(`Following filename is available: ${newFileName}`);
        dev.logverbose(`Has additional meta: ${JSON.stringify(fileMeta.additionalMeta, null, 4)}`);
        let newPathToNewFileName = path.join(uploadDir, newFileName);
        fs.renameSync(fileMeta.path, newPathToNewFileName);
        sockets.createMediaMeta(slugFolderName, newFileName, fileMeta.additionalMeta);
        resolve();
      }, function(err) {
        reject(err);
      });
    });
  }

};