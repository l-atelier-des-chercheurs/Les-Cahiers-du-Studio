const
  path = require('path'),
  fs = require('fs-extra'),
  formidable = require('formidable'),
  gutil = require('gulp-util'),
  sizeOf = require('image-size'),
  mm = require('marky-mark'),
  slugg = require('slugg')
;

const
  local = require('./local'),
  main = require('./sockets'),
  dev = require('./bin/dev-log'),
  api = require('./bin/api'),
  file = require('./bin/file')
;

module.exports = function(app,io,m){

  /**
  * routing event
  */
  app.get('/', getIndex);
  app.get('/:folder', getConf);
  app.post('/:folder/file-upload', postFile2);

  /**
  * routing functions
  */
  function generatePageData( req, pageTitle) {
    return new Promise(function(resolve, reject) {

      let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      dev.log('—> the following page has been requested : ' + fullUrl);

      let pageDataJSON = {};

      // slugFolderName: for reference, when existing
      pageDataJSON.slugFolderName = '';

      // folderPath: full path on the storage space, as displayed in the footer
      pageDataJSON.folderPath = file.getFolderPath();
      pageDataJSON.url = req.path;
      pageDataJSON.isHttps = req.connection.encrypted;
      pageDataJSON.local = local;
      pageDataJSON.logToFile = global.nodeStorage.getItem('logToFile');

      let slugFolderName = req.param('folder');

      if(slugFolderName !== undefined) {
        file.readFolderMeta(slugFolderName).then(function(folderData) {
          pageDataJSON.slugFolderName = slugFolderName;
          pageTitle += " | " + folderData.name;
          if(pageTitle !== undefined)
            pageDataJSON.pageTitle = pageTitle;

          api.getLocalIP().then(function(localNetworkInfos) {
            pageDataJSON.localNetworkInfos = localNetworkInfos;
            resolve(pageDataJSON);
          }, function(err, p) {
            dev.error('Failed to get IP:' + err);
            reject(err);
          });
        }, function(err, p) {
          dev.error('Err ' + err);
          reject(err);
        });
        pageDataJSON.folderName = folderData.name;
        pageDataJSON.statut = folderData.statut;
        pageDataJSON.currentUserDirPath = file.getFolderPath(slugFolderName);
      }

      api.getLocalIP().then(function(localNetworkInfos) {
        pageDataJSON.localNetworkInfos = localNetworkInfos;
        resolve(pageDataJSON);
      }, function(err, p) {
        dev.error('Failed to get IP:' + err);
        reject(err);
      });

    });
  }

  // GET
  function getIndex(req, res) {
    const pageTitle = 'stv-doc';
    generatePageData(req, pageTitle).then(function(pageData) {
      res.render("index", pageData);
    }, function(err) {
      dev.error('Err while getting index data: ' + err);
    });
  }

  function getConf(req, res) {
    var slugFolderName = req.param('conf');
    dev.logfunction(`EVENT — getConf with slugFolderName = ${slugFolderName}`);
    api.readConfMeta(slugFolderName).then(function(c) {
      dev.logverbose('Meta conf gotten. Sending back conf to client');

      var pageTitle = c.name + ' | stv-doc';
      var confMeta = { "confName": c.name };
      if(c.lieu !== undefined)
        confMeta.lieu = c.lieu;
      if(c.date !== undefined)
        confMeta.date = c.date;
      if(c.auteur !== undefined)
        confMeta.auteur = c.auteur;
      if(c.introduction !== undefined)
        confMeta.introduction = c.introduction;

      res.render("conf", {
        "confMeta" : confMeta,
        "pageTitle" : pageTitle,
        "slugFolderName" : slugFolderName,
        "settings" : settings,
        "isDebug" : dev.isDebug(),
      });

    });
  }

  function postFile2(req, res){
    console.log('Will add new media for conf ' + req.param('conf'));
    var slugFolderName = req.param('conf');

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;

    // store all uploads in the conf directory
    form.uploadDir = file.getFolderPath(slugFolderName);

    var allFilesMeta = [];
    var allIframeMeta = [];
    var index = 0;
    var processed;

    form.on('field', function(name, value) {
      console.log('Name: ' + name);
      console.log('Value: ' + value);
      if(name === 'iframe[]') {
        allIframeMeta.push(value);
      }
    });

    // every time a file has been uploaded successfully,
    form.on('file', function(field, file) {
      console.log('File uploaded.');
      console.log('field data : ' + JSON.stringify(field));
      console.log('file data : ' + JSON.stringify(file));
      allFilesMeta.push(file);
    });

    // log any errors that occur
    form.on('error', function(err) {
      console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {

      // if websites
      if(allIframeMeta.length > 0) {
        var m = [];
        for(var i in allIframeMeta) {
          m.push(renameMediaAndCreateMetaForIframe(form.uploadDir, slugFolderName, allIframeMeta[i]));
        }
        Promise.all(m).then(function(filesToAddToMeta) {
          addMediasToMetaConf(slugFolderName, filesToAddToMeta);
          var msg = {
            "msg" : "success",
            "medias" : JSON.stringify(allIframeMeta)
          }
          // not using those packets for now
          res.end(JSON.stringify(msg));
        });
      }

      // if files
      if(allFilesMeta.length > 0) {
        var m = [];
        for(var i in allFilesMeta) {
          m.push(renameMediaAndCreateMeta(form.uploadDir, slugFolderName, allFilesMeta[i]));
        }

        dev.logverbose('Will promise all soon');

        // rename the new media if necessary to it's original name prepended by a number
        Promise.all(m).then(function(filesToAddToMeta) {
          addMediasToMetaConf(slugFolderName, filesToAddToMeta);
          var msg = {
            "msg" : "success",
            "medias" : JSON.stringify(allFilesMeta)
          }
          // not using those packets for now
          res.end(JSON.stringify(msg));
        });
      }
    });

    // parse the incoming request containing the form data
    form.parse(req);
  }

  function renameMediaAndCreateMeta( uploadDir, slugFolderName, file) {
    return new Promise(function(resolve, reject) {
      api.findFirstFilenameNotTaken( uploadDir, file.name).then(function(newFileName){
        dev.logverbose('Found new name');
        var newPathToNewFileName = path.join(uploadDir, newFileName);
        fs.rename(file.path, newPathToNewFileName);
        createMediaMeta( uploadDir, newFileName).then(function(fileMeta){
          resolve(newFileName);
        }, function(err) {
          console.log('fail createMediaMeta ' + err);
          reject(err);
        });
      }, function(err) {
        console.log('fail findFirstFilenameNotTaken ' + err);
        reject(err);
      });
    });
  }

  function renameMediaAndCreateMetaForIframe( uploadDir, slugFolderName, websiteName) {
    return new Promise(function(resolve, reject) {
      var slugWebsiteName = slugg(websiteName);
      api.findFirstFilenameNotTaken( uploadDir, slugWebsiteName + local.settings().metaFileext).then(function(newSlugWebsiteName){
        createMediaMeta( uploadDir, websiteName, newSlugWebsiteName).then(function(fileMeta){
          resolve(newSlugWebsiteName);
        }, function(err) {
          console.log('fail createMediaMeta for Iframes : ' + err);
          reject(err);
        });
      }, function(err) {
        console.log('fail findFirstFilenameNotTaken for iframe : ' + err);
        reject(err);
      });
    });
  }

  function createMediaMeta(confPath, mediaFileName, metaFileName) {
    return new Promise(function(resolve, reject) {
      console.log( "Will create a new meta file for media " + mediaFileName + " for conf " + confPath);

      // if no metaFileName, we will deduce metaFileName from mediaFileName
      if(metaFileName === undefined) {
        var fileNameWithoutExtension = new RegExp( local.settings().regexpRemoveFileExtension, 'i').exec( mediaFileName)[1];
        metaFileName = fileNameWithoutExtension + local.settings().metaFileext;
      }

      // check that a meta with this name doesn't exist already
      api.findFirstFilenameNotTaken(confPath, metaFileName).then(function(metaFileName){

        var newPathToMeta = path.join(confPath, metaFileName);
        // essayer d'avoir la taille du media
        var newPathToMedia = path.join(confPath, mediaFileName);
        try {
          var dimension = sizeOf(newPathToMedia);
          if(typeof dimension !== undefined)
            var mediaRatio = dimension.height / dimension.width;
        } catch(err) {}

        var mdata =
        {
          "name" : mediaFileName,
          "created" : api.getCurrentDate(),
          "modified" : api.getCurrentDate(),
          "informations" : "",
          "posX" : settings.startingPosX,
          "posY" : settings.startingPosY,
          "width" : settings.startingWidth,
        };
        if(mediaRatio !== undefined) {
          mdata['ratio'] = mediaRatio;
        }

        dev.logverbose("Saving JSON string " + JSON.stringify(mdata, null, 4));
        api.storeData( newPathToMeta, mdata, 'create').then(function( meta) {
          console.log( "New media meta file created at path " + newPathToMeta + " with meta : " + meta);
          resolve(meta);
        }, function(err) {
          console.log(gutil.colors.red('--> Couldn\'t create media meta.'));
          reject( 'Couldn\'t create media meta ' + err);
        });
      }, function(err) {
        console.log(gutil.colors.red('--> Couldn\'t find meta filename to use.'));
        reject( 'Couldn\'t find meta filename to use ' + err);
      });
    });
  }



  function addMediasToMetaConf(slugFolderName, filesToAddToMeta) {

    dev.logverbose('Finished adding media files, let’s add those to the conf meta');
    dev.logverbose('filesToAddToMeta : ' + JSON.stringify(filesToAddToMeta, null, 4));

    api.readConfMeta(slugFolderName).then(function(confMeta) {
      var curSlides = [];
      if( confMeta.hasOwnProperty('slides')) {
        curSlides = confMeta.slides;
      }
      // we just store a filename without the format
      dev.logverbose('filesToAddToMeta is of type ' + typeof filesToAddToMeta);
      if( typeof filesToAddToMeta === 'array' || typeof filesToAddToMeta === 'object') {
        for(var i in filesToAddToMeta) {
          dev.logverbose('acting on slide ' + filesToAddToMeta[i]);
          var fileNameWithoutExtension = new RegExp( local.settings().regexpRemoveFileExtension, 'i').exec(filesToAddToMeta[i])[1];
          curSlides.push(fileNameWithoutExtension);
        }
      } else if( typeof filesToAddToMeta === 'string'){
        var fileNameWithoutExtension = new RegExp( local.settings().regexpRemoveFileExtension, 'i').exec(filesToAddToMeta)[1];
        curSlides.push(fileNameWithoutExtension);
      }
      dev.logverbose('new slides for meta ' + JSON.stringify(curSlides, null, 4))
      confMeta['slides'] = curSlides;
      var metaConfPath = api.getMetaFileOfConf(slugFolderName);
      api.storeData(metaConfPath, confMeta, 'update');
    }, function(err) {
      console.log('fail readConfMeta ' + err);
      reject(err);
    });
  }

};