const
  path = require('path'),
  fs = require('fs-extra'),
  formidable = require('formidable')
;

const
  local = require('./local'),
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
  app.post('/:folder/file-upload', postFile2);

  /**
  * routing functions
  */
  function generatePageData(req) {
    return new Promise(function(resolve, reject) {

      let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      dev.log(`••• the following page has been requested: ${fullUrl} •••`);

      let pageDataJSON = {};

      pageDataJSON.pageTitle = 'Les Cahiers du Studio';
      pageDataJSON.slugFolderName = '';
      // full path on the storage space, as displayed in the footer
      pageDataJSON.folderPath = api.getFolderPath();

      pageDataJSON.url = req.path;
      pageDataJSON.isHttps = req.connection.encrypted;
      pageDataJSON.structure = local.settings().structure;
      pageDataJSON.logToFile = global.nodeStorage.getItem('logToFile');

      let tasks = [];

      let getPresentation = new Promise((resolve, reject) => {
        file.getPresentation().then((presentationMD) => {
          pageDataJSON.presentation_md = presentationMD;
          resolve();
        });
      });
      tasks.push(getPresentation);

      let getLocalIP = new Promise((resolve, reject) => {
        api.getLocalIP().then(localNetworkInfos => {
          pageDataJSON.localNetworkInfos = {
            ip: [],
            port: global.appInfos.port
          };
          pageDataJSON.localNetworkInfos.ip = Object.values(localNetworkInfos);
          resolve();
        }, function(err, p) {
          dev.error(`Err while getting local IP: ${err}`);
          reject(err);
        });
      });
      tasks.push(getLocalIP);

      Promise.all(tasks).then(() => {
        resolve(pageDataJSON);
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