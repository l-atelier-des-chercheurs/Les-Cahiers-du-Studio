const
  path = require('path'),
  fs = require('fs-extra'),
  formidable = require('formidable')
;

const
  local = require('./local'),
  dev = require('./bin/dev-log'),
  api = require('./bin/api'),
  file = require('./bin/file')
;

module.exports = function(app,io,m){

  /**
  * routing event
  */
  app.get('/', showIndex);
  app.get('/:folder', showFolder);
  app.post('/:folder/file-upload', postFile2);

  /**
  * routing functions
  */
  function generatePageData(req) {
    return new Promise(function(resolve, reject) {

      let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      dev.log(`••• the following page has been requested: ${fullUrl} •••`);


      let pageDataJSON = {};

      pageDataJSON.pageTitle = 'stv-doc';
      pageDataJSON.slugFolderName = '';
      // full path on the storage space, as displayed in the footer
      pageDataJSON.folderPath = file.getFolderPath();

      pageDataJSON.url = req.path;
      pageDataJSON.isHttps = req.connection.encrypted;
      pageDataJSON.lang = local.lang();
      pageDataJSON.logToFile = global.nodeStorage.getItem('logToFile');

      api.getLocalIP().then(function(localNetworkInfos) {
        pageDataJSON.localNetworkInfos = localNetworkInfos;

        // if index page, get all folders data
        if(req.params.folder === undefined) {
          file.getFolder().then(function(foldersData) {
            pageDataJSON.data = foldersData;
            resolve(pageDataJSON);
          }, function(err, p) {
            dev.error(`Failed to get folder data for ${slugFolderName}: ${err}`);
            reject(err);
          });

        // if folder page, get that folder meta and all media meta
        } else {
          let slugFolderName = req.params.folder;

          file.getFolder(slugFolderName).then(folderData => {
            pageDataJSON.data = folderData;

            // get all of that folder's medias
            file.getMedia(slugFolderName).then(mediasData => {
              pageDataJSON.data[slugFolderName].medias = mediasData;
              resolve(pageDataJSON);
            }, function(err, p) {
              dev.error(`Failed to get folder’s media data for ${slugFolderName}: ${err}`);
              reject(err);
            });

          }, function(err, p) {
            dev.error(`Failed to get folder data for ${slugFolderName}: ${err}`);
            reject(err);
          });
        }
      }, function(err, p) {
        dev.error(`Failed to get IP: ${err}`);
        reject(err);
      });


    });
  }

  // GET
  function showIndex(req,res) {
    generatePageData(req).then(function(pageData) {
      dev.logpackets(`Rendering index with data `, JSON.stringify(pageData, null, 4));
      res.render('index', pageData);
    }, function(err) {
      dev.error(`Err while getting index data: ${err}`);
    });
  }

  function showFolder(req,res) {
    generatePageData(req).then(function(pageData) {
      dev.logpackets(`Rendering folder with data `, JSON.stringify(pageData, null, 4));
      res.render('folder', pageData);
    }, function(err) {
      dev.error(`Err while getting index data: ${err}`);
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
    form.uploadDir = file.getFolderPath(slugFolderName);

    var allFilesMeta = [];

    form.on('field', function(name, value) {
      console.log('Name: ' + name);
      console.log('Value: ' + value);
      if(name === 'iframe[]') {
        allIframeMeta.push(value);
      }
    });

    // every time a file has been uploaded successfully,
    form.on('file', function(field, file) {
      dev.logverbose(`File uploaded:\nfield: ${JSON.stringify(field)}\nfile: ${JSON.stringify(file)}.`);
      allFilesMeta.push(file);
    });

    // log any errors that occur
    form.on('error', function(err) {
      console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {

      if(allFilesMeta.length > 0) {
        var m = [];
        for(var i in allFilesMeta) {
          m.push(renameMediaAndCreateMeta(form.uploadDir, slugFolderName, allFilesMeta[i]));
        }

        // rename the new media if necessary to it's original name prepended by a number
        Promise.all(m).then((filesToAddToMeta) => {
          let msg = {};
          msg.msg = 'success';
          msg.medias = JSON.stringify(allFilesMeta);
          res.end(JSON.stringify(msg));
        });
      }
    });

    // parse the incoming request containing the form data
    form.parse(req);
  }

  function renameMediaAndCreateMeta(uploadDir, slugFolderName, file) {
    return new Promise(function(resolve, reject) {
      api.findFirstFilenameNotTaken( uploadDir, file.name).then(function(newFileName){
        var newPathToNewFileName = path.join(uploadDir, newFileName);
        fs.rename(file.path, newPathToNewFileName);
        dev.error(`TODO`);
/*
        file.createMediaMeta(uploadDir, newFileName).then(function(fileMeta){
          resolve(newFileName);
        }, function(err) {
          reject(err);
        });
*/
      }, function(err) {
        reject(err);
      });
    });
  }


};